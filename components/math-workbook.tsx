"use client";

import {
  type ClipboardEvent as ReactClipboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { toBlob, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Document, ImageRun, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

type StudyMode = "college" | "lycee";
type ToolbarPanel = "text" | "math";
type StructuredTool = "fraction" | "division" | "power" | "root";

type FractionBlock = {
  id: string;
  type: "fraction";
  numerator: string;
  denominator: string;
  simplified: string;
  caption: string;
  x: number;
  y: number;
  width: number;
};

type DivisionBlock = {
  id: string;
  type: "division";
  dividend: string;
  divisor: string;
  quotient: string;
  remainder: string;
  caption: string;
  x: number;
  y: number;
  width: number;
};

type PowerBlock = {
  id: string;
  type: "power";
  base: string;
  exponent: string;
  result: string;
  caption: string;
  x: number;
  y: number;
  width: number;
};

type RootBlock = {
  id: string;
  type: "root";
  radicand: string;
  result: string;
  caption: string;
  x: number;
  y: number;
  width: number;
};

type MathBlock = FractionBlock | DivisionBlock | PowerBlock | RootBlock;

type WriterState = {
  title: string;
  mode: StudyMode;
  textHtml: string;
  blocks: MathBlock[];
};

type ModalState =
  | {
      mode: "insert" | "edit";
      block: MathBlock;
    }
  | null;

type InlineShortcutItem = {
  id: string;
  label: string;
  hint: string;
  content: string;
  modes: StudyMode[];
};

type InlineShortcutGroup = {
  name: string;
  items: InlineShortcutItem[];
};

type DragState = {
  blockId: string;
  pointerOffsetX: number;
  pointerOffsetY: number;
} | null;

const STORAGE_KEY = "maths-facile-free-layout-v1";

const DEFAULT_TEXT_HTML = [
  "<p><strong>Commence ici :</strong> écris librement ta méthode, tes calculs et ta réponse.</p>",
  "<p>Ajoute ensuite une fraction posée, une division posée, une puissance ou une racine, puis déplace le bloc où tu veux sur la feuille.</p>"
].join("");

const DEFAULT_STATE: WriterState = {
  title: "Mon document de maths",
  mode: "college",
  textHtml: DEFAULT_TEXT_HTML,
  blocks: []
};

const FONT_SIZE_OPTIONS = [
  { id: "size-small", label: "Petit", value: "2" },
  { id: "size-normal", label: "Normal", value: "3" },
  { id: "size-large", label: "Grand", value: "5" },
  { id: "size-xlarge", label: "Très grand", value: "7" }
] as const;

const COLOR_OPTIONS = [
  { id: "ink", label: "Encre", value: "#1f2d3d" },
  { id: "orange", label: "Orange", value: "#d56f3c" },
  { id: "blue", label: "Bleu", value: "#2169b3" },
  { id: "green", label: "Vert", value: "#2f8f57" },
  { id: "pink", label: "Rose", value: "#b54d7a" }
] as const;

const STRUCTURED_TOOLS = [
  { id: "fraction" as const, label: "Fraction posée", hint: "Numérateur au-dessus, dénominateur en dessous", modes: ["college", "lycee"] as StudyMode[] },
  { id: "division" as const, label: "Division posée", hint: "Diviseur, dividende, quotient et reste", modes: ["college", "lycee"] as StudyMode[] },
  { id: "power" as const, label: "Puissance", hint: "Base, exposant et résultat", modes: ["college", "lycee"] as StudyMode[] },
  { id: "root" as const, label: "Racine", hint: "Radicande et résultat", modes: ["college", "lycee"] as StudyMode[] }
] as const;

const INLINE_SHORTCUT_GROUPS: InlineShortcutGroup[] = [
  {
    name: "Essentiels",
    items: [
      { id: "equal", label: "Égal", hint: "Ajoute =", content: " = ", modes: ["college", "lycee"] },
      { id: "neq", label: "Différent", hint: "Ajoute ≠", content: " ≠ ", modes: ["college", "lycee"] },
      { id: "leq", label: "≤", hint: "Inférieur ou égal", content: " ≤ ", modes: ["college", "lycee"] },
      { id: "geq", label: "≥", hint: "Supérieur ou égal", content: " ≥ ", modes: ["college", "lycee"] },
      { id: "times", label: "×", hint: "Multiplier", content: " × ", modes: ["college", "lycee"] },
      { id: "div", label: "÷", hint: "Diviser", content: " ÷ ", modes: ["college", "lycee"] },
      { id: "percent", label: "%", hint: "Pourcentage", content: "%", modes: ["college", "lycee"] },
      { id: "pi", label: "π", hint: "Pi", content: "π", modes: ["college", "lycee"] }
    ]
  },
  {
    name: "Géométrie",
    items: [
      { id: "angle", label: "∠ABC", hint: "Angle", content: "∠ABC", modes: ["college", "lycee"] },
      { id: "parallel", label: "∥", hint: "Parallèle", content: " ∥ ", modes: ["college", "lycee"] },
      { id: "perpendicular", label: "⟂", hint: "Perpendiculaire", content: " ⟂ ", modes: ["college", "lycee"] },
      { id: "degree", label: "°", hint: "Degré", content: "°", modes: ["college", "lycee"] }
    ]
  },
  {
    name: "Lycée",
    items: [
      { id: "function", label: "f(x)", hint: "Fonction", content: "f(x) = ", modes: ["lycee"] },
      { id: "limit", label: "lim", hint: "Limite", content: "lim(x→a)", modes: ["lycee"] },
      { id: "sum", label: "Σ", hint: "Somme", content: "Σ(k=1→n)", modes: ["lycee"] },
      { id: "integral", label: "∫", hint: "Intégrale", content: "∫[a;b]", modes: ["lycee"] },
      { id: "ln", label: "ln", hint: "Logarithme", content: "ln(x)", modes: ["lycee"] }
    ]
  }
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseStoredState(raw: string): WriterState | null {
  try {
    const parsed = JSON.parse(raw) as WriterState;

    if (
      typeof parsed.title !== "string" ||
      (parsed.mode !== "college" && parsed.mode !== "lycee") ||
      typeof parsed.textHtml !== "string" ||
      !Array.isArray(parsed.blocks)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getBlockTitle(block: MathBlock) {
  switch (block.type) {
    case "fraction":
      return "Fraction posée";
    case "division":
      return "Division posée";
    case "power":
      return "Puissance";
    case "root":
      return "Racine";
    default:
      return "Bloc";
  }
}

function getDefaultWidth(type: MathBlock["type"]) {
  switch (type) {
    case "division":
      return 320;
    case "fraction":
      return 260;
    case "power":
      return 220;
    case "root":
      return 230;
    default:
      return 260;
  }
}

function renderMathPreview(block: MathBlock) {
  if (block.type === "fraction") {
    return (
      <div className="math-layout fraction-layout">
        <div className="fraction-preview">
          <div className="fraction-line top">{block.numerator || "numérateur"}</div>
          <div className="fraction-bar" />
          <div className="fraction-line">{block.denominator || "dénominateur"}</div>
        </div>
        {block.simplified ? <p className="math-result">Résultat : {block.simplified}</p> : null}
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  if (block.type === "division") {
    return (
      <div className="math-layout division-layout">
        <div className="division-preview">
          <div className="division-quotient">{block.quotient || "quotient"}</div>
          <div className="division-divisor">{block.divisor || "diviseur"}</div>
          <div className="division-bracket">
            <div className="division-dividend">{block.dividend || "dividende"}</div>
            {block.remainder ? <div className="division-remainder">{block.remainder}</div> : null}
          </div>
        </div>
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  if (block.type === "power") {
    return (
      <div className="math-layout power-layout">
        <p className="power-preview">
          <span>{block.base || "base"}</span>
          <sup>{block.exponent || "exposant"}</sup>
        </p>
        {block.result ? <p className="math-result">Résultat : {block.result}</p> : null}
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  return (
    <div className="math-layout root-layout">
      <div className="root-preview">
        <span className="root-symbol">√</span>
        <span className="root-radicand">{block.radicand || "radicande"}</span>
      </div>
      {block.result ? <p className="math-result">Résultat : {block.result}</p> : null}
      {block.caption ? <p className="math-caption">{block.caption}</p> : null}
    </div>
  );
}

export function MathWorkbook() {
  const [state, setState] = useState<WriterState>(DEFAULT_STATE);
  const [toolbarPanel, setToolbarPanel] = useState<ToolbarPanel>("math");
  const [modalState, setModalState] = useState<ModalState>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<Range | null>(null);
  const dragRef = useRef<DragState>(null);

  const activeInlineShortcuts = useMemo(
    () =>
      INLINE_SHORTCUT_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.modes.includes(state.mode))
      })).filter((group) => group.items.length > 0),
    [state.mode]
  );

  const activeStructuredTools = useMemo(
    () => STRUCTURED_TOOLS.filter((tool) => tool.modes.includes(state.mode)),
    [state.mode]
  );
  const selectedBlock = useMemo(
    () => state.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [selectedBlockId, state.blocks]
  );

  useEffect(() => {
    setIsHydrated(true);
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    const parsed = parseStoredState(saved);

    if (!parsed) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    setState(parsed);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  useEffect(() => {
    const element = editorRef.current;

    if (element && document.activeElement !== element && element.innerHTML !== state.textHtml) {
      element.innerHTML = state.textHtml;
    }
  }, [state.textHtml]);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!dragRef.current) {
        return;
      }

      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const draggedBlock = state.blocks.find((block) => block.id === dragRef.current?.blockId);

      if (!draggedBlock) {
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      const nextX = event.clientX - bounds.left - dragRef.current.pointerOffsetX;
      const nextY = event.clientY - bounds.top - dragRef.current.pointerOffsetY;
      const clamped = {
        x: Math.max(24, Math.min(560, Math.round(nextX))),
        y: Math.max(120, Math.min(920, Math.round(nextY)))
      };

      setState((current) => ({
        ...current,
        blocks: current.blocks.map((block) =>
          block.id === draggedBlock.id ? { ...block, x: clamped.x, y: clamped.y } : block
        )
      }));
    }

    function handleMouseUp() {
      dragRef.current = null;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [state.blocks]);

  function createBlock(type: StructuredTool) {
    const count = state.blocks.length;
    const position = {
      x: 80 + (count % 3) * 48,
      y: 140 + count * 34,
      width: getDefaultWidth(type)
    };

    if (type === "fraction") {
      return { id: createId("fraction"), type, numerator: "", denominator: "", simplified: "", caption: "", ...position } satisfies MathBlock;
    }

    if (type === "division") {
      return {
        id: createId("division"),
        type,
        dividend: "",
        divisor: "",
        quotient: "",
        remainder: "",
        caption: "",
        ...position
      } satisfies MathBlock;
    }

    if (type === "power") {
      return { id: createId("power"), type, base: "", exponent: "", result: "", caption: "", ...position } satisfies MathBlock;
    }

    return { id: createId("root"), type, radicand: "", result: "", caption: "", ...position } satisfies MathBlock;
  }

  function syncText() {
    const element = editorRef.current;

    if (!element) {
      return;
    }

    const html = element.innerHTML;

    setState((current) => (current.textHtml === html ? current : { ...current, textHtml: html }));
  }

  function saveSelection() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    selectionRef.current = range.cloneRange();
  }

  function restoreSelection() {
    if (!selectionRef.current || !editorRef.current) {
      return false;
    }

    const selection = window.getSelection();

    if (!selection) {
      return false;
    }

    editorRef.current.focus();
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
    return true;
  }

  function focusEditorToEnd() {
    const element = editorRef.current;

    if (!element) {
      return;
    }

    element.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);

    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      selectionRef.current = range.cloneRange();
    }
  }

  function runCommand(command: string, value?: string) {
    if (!restoreSelection()) {
      focusEditorToEnd();
    }

    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
    syncText();
    saveSelection();
  }

  function insertTextAtCursor(content: string) {
    if (!restoreSelection()) {
      focusEditorToEnd();
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(content);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    selectionRef.current = range.cloneRange();
    syncText();
  }

  function handlePaste(event: ReactClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    insertTextAtCursor(event.clipboardData.getData("text/plain"));
  }

  function openInsertModal(type: StructuredTool) {
    setModalState({
      mode: "insert",
      block: createBlock(type)
    });
  }

  function openEditModal(blockId: string) {
    const block = state.blocks.find((item) => item.id === blockId);

    if (!block) {
      return;
    }

    setModalState({
      mode: "edit",
      block: { ...block }
    });
  }

  function updateModalField(key: string, value: string) {
    setModalState((current) =>
      current
        ? {
            ...current,
            block: { ...current.block, [key]: value } as MathBlock
          }
        : current
    );
  }

  function applyModalBlock() {
    if (!modalState) {
      return;
    }

    if (modalState.mode === "edit") {
      setState((current) => ({
        ...current,
        blocks: current.blocks.map((block) =>
          block.id === modalState.block.id ? modalState.block : block
        )
      }));
      setSelectedBlockId(modalState.block.id);
      setModalState(null);
      return;
    }

    setState((current) => ({
      ...current,
      blocks: [...current.blocks, modalState.block]
    }));
    setSelectedBlockId(modalState.block.id);
    setModalState(null);
  }

  function removeBlock(blockId: string) {
    setState((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== blockId)
    }));
    setSelectedBlockId((current) => (current === blockId ? null : current));
  }

  function startDragging(blockId: string, event: ReactMouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();

    const block = state.blocks.find((item) => item.id === blockId);
    const canvas = canvasRef.current;

    if (!block || !canvas) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    dragRef.current = {
      blockId,
      pointerOffsetX: event.clientX - bounds.left - block.x,
      pointerOffsetY: event.clientY - bounds.top - block.y
    };
    setSelectedBlockId(blockId);
  }

  function resetDocument() {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
    setToolbarPanel("math");
    setModalState(null);
    setSelectedBlockId(null);
    selectionRef.current = null;
    if (editorRef.current) {
      editorRef.current.innerHTML = DEFAULT_TEXT_HTML;
    }
  }

  async function exportPdf() {
    if (!canvasRef.current) {
      return;
    }

    setIsExporting("pdf");

    try {
      const imageUrl = await toPng(canvasRef.current, {
        backgroundColor: "#fffdf8",
        cacheBust: true,
        pixelRatio: 2
      });

      const image = new Image();
      image.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Image export error"));
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / image.width, pageHeight / image.height);
      const renderWidth = image.width * ratio;
      const renderHeight = image.height * ratio;

      pdf.addImage(imageUrl, "PNG", (pageWidth - renderWidth) / 2, 20, renderWidth, renderHeight);
      pdf.save(`${safeFileName(state.title) || "maths-facile"}.pdf`);
    } finally {
      setIsExporting(null);
    }
  }

  async function exportWord() {
    if (!canvasRef.current) {
      return;
    }

    setIsExporting("word");

    try {
      const blob = await toBlob(canvasRef.current, {
        backgroundColor: "#fffdf8",
        cacheBust: true,
        pixelRatio: 2
      });

      if (!blob) {
        return;
      }

      const arrayBuffer = await blob.arrayBuffer();
      const tempImageUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.src = tempImageUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Word export image error"));
      });

      URL.revokeObjectURL(tempImageUrl);

      const documentFile = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                spacing: { after: 180 },
                children: [new TextRun({ text: state.title, bold: true, size: 34 })]
              }),
              new Paragraph({
                spacing: { after: 180 },
                children: [
                  new TextRun({
                    text: state.mode === "college" ? "Mode collège" : "Mode lycée",
                    italics: true,
                    size: 24
                  })
                ]
              }),
              new Paragraph({
                children: [
                  new ImageRun({
                    type: "png",
                    data: arrayBuffer,
                    transformation: {
                      width: 520,
                      height: Math.max(280, Math.round((image.height / image.width) * 520))
                    }
                  })
                ]
              })
            ]
          }
        ]
      });

      const docBlob = await Packer.toBlob(documentFile);
      saveAs(docBlob, `${safeFileName(state.title) || "maths-facile"}.docx`);
    } finally {
      setIsExporting(null);
    }
  }

  function renderModalFields(block: MathBlock) {
    if (block.type === "fraction") {
      return (
        <div className="math-editor-grid">
          <label>
            <span>Numérateur</span>
            <input value={block.numerator} onChange={(event) => updateModalField("numerator", event.target.value)} placeholder="3x + 2" />
          </label>
          <label>
            <span>Dénominateur</span>
            <input value={block.denominator} onChange={(event) => updateModalField("denominator", event.target.value)} placeholder="5" />
          </label>
          <label>
            <span>Résultat simplifié</span>
            <input value={block.simplified} onChange={(event) => updateModalField("simplified", event.target.value)} placeholder="7/5" />
          </label>
          <label>
            <span>Consigne ou remarque</span>
            <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder="Je simplifie la fraction" />
          </label>
        </div>
      );
    }

    if (block.type === "division") {
      return (
        <div className="math-editor-grid">
          <label>
            <span>Dividende</span>
            <input value={block.dividend} onChange={(event) => updateModalField("dividend", event.target.value)} placeholder="245" />
          </label>
          <label>
            <span>Diviseur</span>
            <input value={block.divisor} onChange={(event) => updateModalField("divisor", event.target.value)} placeholder="7" />
          </label>
          <label>
            <span>Quotient</span>
            <input value={block.quotient} onChange={(event) => updateModalField("quotient", event.target.value)} placeholder="35" />
          </label>
          <label>
            <span>Reste</span>
            <input value={block.remainder} onChange={(event) => updateModalField("remainder", event.target.value)} placeholder="0" />
          </label>
          <label className="wide-field">
            <span>Consigne ou remarque</span>
            <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder="Je vérifie avec 35 × 7" />
          </label>
        </div>
      );
    }

    if (block.type === "power") {
      return (
        <div className="math-editor-grid">
          <label>
            <span>Base</span>
            <input value={block.base} onChange={(event) => updateModalField("base", event.target.value)} placeholder="2" />
          </label>
          <label>
            <span>Exposant</span>
            <input value={block.exponent} onChange={(event) => updateModalField("exponent", event.target.value)} placeholder="3" />
          </label>
          <label>
            <span>Résultat</span>
            <input value={block.result} onChange={(event) => updateModalField("result", event.target.value)} placeholder="8" />
          </label>
          <label>
            <span>Consigne ou remarque</span>
            <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder="Carré, cube, puissance n" />
          </label>
        </div>
      );
    }

    return (
      <div className="math-editor-grid">
        <label>
          <span>Radicande</span>
          <input value={block.radicand} onChange={(event) => updateModalField("radicand", event.target.value)} placeholder="49" />
        </label>
        <label>
          <span>Résultat</span>
          <input value={block.result} onChange={(event) => updateModalField("result", event.target.value)} placeholder="7" />
        </label>
        <label className="wide-field">
          <span>Consigne ou remarque</span>
          <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder="Racine carrée" />
        </label>
      </div>
    );
  }

  return (
    <main className="editor-shell">
      <header className="top-toolbar">
        <div className="toolbar-main-row">
          <div className="toolbar-brand">
            <p className="toolbar-eyebrow">Maths facile</p>
            <label className="document-title-field">
              <span>Titre</span>
              <input
                value={state.title}
                onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))}
                placeholder="Mon document de maths"
              />
            </label>
          </div>

          <div className="toolbar-side">
            <div className="mode-switch" aria-label="Choix du mode">
              <button type="button" className={state.mode === "college" ? "mode-active" : ""} onClick={() => setState((current) => ({ ...current, mode: "college" }))}>
                Collège
              </button>
              <button type="button" className={state.mode === "lycee" ? "mode-active" : ""} onClick={() => setState((current) => ({ ...current, mode: "lycee" }))}>
                Lycée
              </button>
            </div>

            <div className="toolbar-actions">
              <button type="button" className="toolbar-action primary" onClick={exportPdf} disabled={isExporting !== null}>
                {isExporting === "pdf" ? "Création PDF..." : "PDF"}
              </button>
              <button type="button" className="toolbar-action secondary" onClick={exportWord} disabled={isExporting !== null}>
                {isExporting === "word" ? "Création Word..." : "Word"}
              </button>
              <button type="button" className="toolbar-action ghost" onClick={() => window.print()}>
                Imprimer
              </button>
              <button type="button" className="toolbar-action ghost" onClick={resetDocument}>
                Nouveau
              </button>
            </div>
          </div>
        </div>

        <div className="toolbar-tab-row">
          <button type="button" className={toolbarPanel === "text" ? "tab-active" : ""} onClick={() => setToolbarPanel("text")}>
            Texte
          </button>
          <button type="button" className={toolbarPanel === "math" ? "tab-active" : ""} onClick={() => setToolbarPanel("math")}>
            Maths
          </button>
          <p className="toolbar-helper">
            Le texte reste libre. Les opérations posées deviennent des objets que tu peux placer où tu veux sur la feuille.
          </p>
        </div>

        {selectedBlock ? (
          <section className="toolbar-panel selected-block-toolbar" aria-label="Bloc sélectionné">
            <div className="panel-block">
              <h2>{getBlockTitle(selectedBlock)}</h2>
              <p className="toolbar-helper">
                Fais glisser le bloc directement sur la feuille. Double-clique dessus pour le modifier.
              </p>
            </div>
            <div className="panel-chip-row">
              <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => openEditModal(selectedBlock.id)}>
                Modifier
              </button>
              <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => removeBlock(selectedBlock.id)}>
                Supprimer
              </button>
            </div>
          </section>
        ) : null}

        {toolbarPanel === "text" ? (
          <section className="toolbar-panel" aria-label="Outils de texte">
            <div className="panel-block">
              <h2>Texte</h2>
              <div className="panel-chip-row">
                <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")}>
                  Gras
                </button>
                <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("removeFormat")}>
                  Effacer le style
                </button>
              </div>
            </div>

            <div className="panel-block">
              <h2>Taille</h2>
              <div className="panel-chip-row">
                {FONT_SIZE_OPTIONS.map((option) => (
                  <button key={option.id} type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("fontSize", option.value)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>Couleur</h2>
              <div className="color-row">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="color-chip"
                    style={{ backgroundColor: option.value }}
                    aria-label={option.label}
                    title={option.label}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => runCommand("foreColor", option.value)}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="toolbar-panel toolbar-panel-compact" aria-label="Outils de maths">
            <div className="panel-block">
              <h2>Blocs posés</h2>
              <div className="shortcut-row">
                {activeStructuredTools.map((tool) => (
                  <button key={tool.id} type="button" className="shortcut-chip" onMouseDown={(event) => event.preventDefault()} onClick={() => openInsertModal(tool.id)}>
                    <span>{tool.label}</span>
                    <small>{tool.hint}</small>
                  </button>
                ))}
              </div>
            </div>

            {activeInlineShortcuts.map((group) => (
              <div key={group.name} className="panel-block">
                <h2>{group.name}</h2>
                <div className="shortcut-row">
                  {group.items.map((shortcut) => (
                    <button key={shortcut.id} type="button" className="shortcut-chip" onMouseDown={(event) => event.preventDefault()} onClick={() => insertTextAtCursor(shortcut.content)}>
                      <span>{shortcut.label}</span>
                      <small>{shortcut.hint}</small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </header>

      <section className="editor-stage">
        <div className="editor-sheet">
          <div className="editor-sheet-head">
            <div>
              <p className="editor-sheet-badge">{state.mode === "college" ? "Mode collège" : "Mode lycée"}</p>
              <h1>{state.title || "Document sans titre"}</h1>
            </div>
            <p className="editor-sheet-note">
              Écris librement, puis attrape la poignée d&apos;un bloc posé pour le placer n&apos;importe où sur la feuille.
            </p>
          </div>

          <div className="document-canvas" ref={canvasRef} onMouseDown={() => setSelectedBlockId(null)}>
            <div
              ref={editorRef}
              className="canvas-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={syncText}
              onFocus={saveSelection}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onPaste={handlePaste}
            />

            {state.blocks.map((block) => (
              <article
                key={block.id}
                className={`floating-math-block ${selectedBlockId === block.id ? "floating-math-block-selected" : ""}`}
                style={{ left: `${block.x}px`, top: `${block.y}px` }}
                onMouseDown={(event) => {
                  setSelectedBlockId(block.id);
                  startDragging(block.id, event);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  openEditModal(block.id);
                }}
              >
                {renderMathPreview(block)}
              </article>
            ))}
          </div>
        </div>
      </section>

      {modalState ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setModalState(null)}>
          <section className="block-modal" role="dialog" aria-modal="true" aria-labelledby="block-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="block-modal-head">
              <div>
                <p className="card-kind">Bloc guidé</p>
                <h2 id="block-modal-title">{getBlockTitle(modalState.block)}</h2>
                <p className="toolbar-helper">Prépare le bloc, puis place-le librement sur la feuille.</p>
              </div>
              <div className="card-actions">
                <button type="button" className="small-action" onClick={() => setModalState(null)}>
                  Annuler
                </button>
                <button type="button" className="small-action primary-inline-action" onClick={applyModalBlock}>
                  {modalState.mode === "insert" ? "Insérer" : "Enregistrer"}
                </button>
              </div>
            </div>

            {renderModalFields(modalState.block)}

            <div className="block-modal-preview">
              <section className="export-math-block">
                <div className="export-math-head">
                  <span>Aperçu</span>
                </div>
                {renderMathPreview(modalState.block)}
              </section>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
