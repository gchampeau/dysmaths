"use client";

import {
  type ClipboardEvent as ReactClipboardEvent,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
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
type StructuredTool = "fraction" | "division" | "power" | "root";
type UtilityMenu = "settings" | "export" | null;

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

type FloatingSymbol = {
  id: string;
  type: "symbol";
  label: string;
  content: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
};

type FloatingTextBox = {
  id: string;
  type: "textBox";
  text: string;
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
  symbols: FloatingSymbol[];
  textBoxes: FloatingTextBox[];
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
  itemType: "block" | "symbol" | "textBox";
  itemId: string;
  pointerOffsetX: number;
  pointerOffsetY: number;
  groupBlockPositions: Array<{ id: string; x: number; y: number }>;
  groupSymbolPositions: Array<{ id: string; x: number; y: number }>;
  groupTextBoxPositions: Array<{ id: string; x: number; y: number }>;
  anchorX: number;
  anchorY: number;
} | null;

type SelectionRect = {
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
} | null;

type PendingSelection = {
  originX: number;
  originY: number;
  started: boolean;
} | null;

type ToolbarDragPayload =
  | { kind: "structured"; toolId: StructuredTool }
  | { kind: "shortcut"; shortcutId: string };

type ToolbarDragMeta = {
  offsetX: number;
  offsetY: number;
  previewNode: HTMLElement | null;
};

type EditingFractionState =
  | {
      blockId: string;
      field: "numerator" | "denominator";
    }
  | null;

const STORAGE_KEY = "maths-facile-free-layout-v1";
const FLOATING_TEXTBOX_Y_OFFSET = 10;

const DEFAULT_TEXT_HTML = [
  "<p><strong>Commence ici :</strong> écris librement ta méthode, tes calculs et ta réponse.</p>",
  "<p>Ajoute ensuite une fraction posée, une division posée, une puissance ou une racine, puis déplace le bloc où tu veux sur la feuille.</p>"
].join("");

const DEFAULT_STATE: WriterState = {
  title: "Mon document de maths",
  mode: "college",
  textHtml: DEFAULT_TEXT_HTML,
  blocks: [],
  symbols: [],
  textBoxes: []
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
      { id: "equal", label: "=", hint: "Ajoute =", content: " = ", modes: ["college", "lycee"] },
      { id: "neq", label: "≠", hint: "Ajoute ≠", content: " ≠ ", modes: ["college", "lycee"] },
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

function getTextBoxWidth(text: string) {
  const visibleText = text.trim();
  return Math.max(36, Math.min(920, visibleText.length * 14 + 12));
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

    return {
      ...parsed,
      symbols: Array.isArray(parsed.symbols) ? parsed.symbols : [],
      textBoxes: Array.isArray((parsed as { textBoxes?: unknown }).textBoxes) ? (parsed as { textBoxes: FloatingTextBox[] }).textBoxes : []
    };
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
  const [openMenu, setOpenMenu] = useState<UtilityMenu>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [selectedSymbolIds, setSelectedSymbolIds] = useState<string[]>([]);
  const [selectedTextBoxIds, setSelectedTextBoxIds] = useState<string[]>([]);
  const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null);
  const [editingFraction, setEditingFraction] = useState<EditingFractionState>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | null>(null);
  const [isCanvasDropActive, setIsCanvasDropActive] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect>(null);
  const [isCanvasInteracting, setIsCanvasInteracting] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<Range | null>(null);
  const dragRef = useRef<DragState>(null);
  const pendingSelectionRef = useRef<PendingSelection>(null);
  const blocksRef = useRef<MathBlock[]>([]);
  const symbolsRef = useRef<FloatingSymbol[]>([]);
  const textBoxesRef = useRef<FloatingTextBox[]>([]);
  const selectedBlockIdsRef = useRef<string[]>([]);
  const selectedSymbolIdsRef = useRef<string[]>([]);
  const selectedTextBoxIdsRef = useRef<string[]>([]);
  const toolbarDragUntilRef = useRef(0);
  const toolbarDragMetaRef = useRef<ToolbarDragMeta | null>(null);
  const blockNodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const symbolNodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const textBoxNodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const pendingFocusTextBoxIdRef = useRef<string | null>(null);
  const fractionInputRefs = useRef<Record<string, { numerator?: HTMLInputElement | null; denominator?: HTMLInputElement | null }>>({});

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
  const selectedBlockId = selectedBlockIds.length === 1 && selectedSymbolIds.length === 0 && selectedTextBoxIds.length === 0 ? selectedBlockIds[0] : null;
  const selectedSymbolId = selectedSymbolIds.length === 1 && selectedBlockIds.length === 0 && selectedTextBoxIds.length === 0 ? selectedSymbolIds[0] : null;
  const selectedTextBoxId = selectedTextBoxIds.length === 1 && selectedBlockIds.length === 0 && selectedSymbolIds.length === 0 ? selectedTextBoxIds[0] : null;
  const selectedCount = selectedBlockIds.length + selectedSymbolIds.length + selectedTextBoxIds.length;
  const selectedBlock = useMemo(
    () => state.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [selectedBlockId, state.blocks]
  );
  const selectedSymbol = useMemo(
    () => state.symbols.find((symbol) => symbol.id === selectedSymbolId) ?? null,
    [selectedSymbolId, state.symbols]
  );
  const selectedTextBox = useMemo(
    () => state.textBoxes.find((textBox) => textBox.id === selectedTextBoxId) ?? null,
    [selectedTextBoxId, state.textBoxes]
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
    blocksRef.current = state.blocks;
    symbolsRef.current = state.symbols;
    textBoxesRef.current = state.textBoxes;
  }, [state.blocks, state.symbols, state.textBoxes]);

  useEffect(() => {
    selectedBlockIdsRef.current = selectedBlockIds;
    selectedSymbolIdsRef.current = selectedSymbolIds;
    selectedTextBoxIdsRef.current = selectedTextBoxIds;
  }, [selectedBlockIds, selectedSymbolIds, selectedTextBoxIds]);

  useEffect(() => {
    if (!pendingFocusTextBoxIdRef.current) {
      return;
    }

    const node = textBoxNodeRefs.current[pendingFocusTextBoxIdRef.current]?.querySelector("input");

    if (!node) {
      return;
    }

    node.focus();
    pendingFocusTextBoxIdRef.current = null;
  }, [state.textBoxes]);

  useEffect(() => {
    if (!editingFraction) {
      return;
    }

    const input = fractionInputRefs.current[editingFraction.blockId]?.[editingFraction.field];

    if (!input) {
      return;
    }

    input.focus();
    input.select();
  }, [editingFraction]);

  useEffect(() => {
    const element = editorRef.current;

    if (element && document.activeElement !== element && element.innerHTML !== state.textHtml) {
      element.innerHTML = state.textHtml;
    }
  }, [state.textHtml]);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!dragRef.current) {
        if (!pendingSelectionRef.current) {
          return;
        }

        const point = getCanvasPoint(event.clientX, event.clientY);
        const current = pendingSelectionRef.current;
        const distance = Math.hypot(point.x - current.originX, point.y - current.originY);

        if (!current.started && distance < 6) {
          return;
        }

        const nextRect = {
          originX: current.originX,
          originY: current.originY,
          currentX: point.x,
          currentY: point.y
        };

        if (!current.started) {
          pendingSelectionRef.current = { ...current, started: true };
        }

        setSelectionRect(nextRect);
        updateSelectionFromRect(nextRect);
        return;
      }

      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      const nextAnchorX = event.clientX - bounds.left - dragRef.current.pointerOffsetX;
      const nextAnchorY = event.clientY - bounds.top - dragRef.current.pointerOffsetY;
      const deltaX = Math.round(nextAnchorX - dragRef.current.anchorX);
      const deltaY = Math.round(nextAnchorY - dragRef.current.anchorY);

      setState((current) => ({
        ...current,
        blocks: current.blocks.map((block) => {
          const dragged = dragRef.current?.groupBlockPositions.find((item) => item.id === block.id);

          if (!dragged) {
            return block;
          }

          return {
            ...block,
            x: Math.max(18, Math.min(bounds.width - 24, dragged.x + deltaX)),
            y: Math.max(18, Math.min(bounds.height - 24, dragged.y + deltaY))
          };
        }),
        symbols: current.symbols.map((symbol) => {
          const dragged = dragRef.current?.groupSymbolPositions.find((item) => item.id === symbol.id);

          if (!dragged) {
            return symbol;
          }

          return {
            ...symbol,
            x: Math.max(18, Math.min(bounds.width - 24, dragged.x + deltaX)),
            y: Math.max(18, Math.min(bounds.height - 24, dragged.y + deltaY))
          };
        }),
        textBoxes: current.textBoxes.map((textBox) => {
          const dragged = dragRef.current?.groupTextBoxPositions.find((item) => item.id === textBox.id);

          if (!dragged) {
            return textBox;
          }

          return {
            ...textBox,
            x: Math.max(18, Math.min(bounds.width - 24, dragged.x + deltaX)),
            y: Math.max(18, Math.min(bounds.height - 24, dragged.y + deltaY))
          };
        })
      }));
    }

    function handleMouseUp() {
      if (pendingSelectionRef.current && !pendingSelectionRef.current.started) {
        const textBox = createFloatingTextBox(pendingSelectionRef.current.originX, pendingSelectionRef.current.originY);

        setState((current) => ({
          ...current,
          textBoxes: [...current.textBoxes, textBox]
        }));
        beginTextBoxEditing(textBox.id);
      }

      dragRef.current = null;
      pendingSelectionRef.current = null;
      setSelectionRect(null);
      setIsCanvasInteracting(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

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

  function createFloatingSymbol(shortcut: InlineShortcutItem, x: number, y: number) {
    return {
      id: createId("symbol"),
      type: "symbol",
      label: shortcut.label,
      content: shortcut.content.trim() || shortcut.label,
      x,
      y,
      color: COLOR_OPTIONS[0].value,
      fontSize: 1.18
    } satisfies FloatingSymbol;
  }

  function createFloatingTextBox(x: number, y: number) {
    return {
      id: createId("text"),
      type: "textBox",
      text: "",
      x,
      y: Math.max(18, y - FLOATING_TEXTBOX_Y_OFFSET),
      width: 100
    } satisfies FloatingTextBox;
  }

  function getCanvasDropPosition(clientX: number, clientY: number, offsetX = 0, offsetY = 0) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 24, y: 24 };
    }

    const bounds = canvas.getBoundingClientRect();

    return {
      x: Math.max(18, Math.min(bounds.width - 24, Math.round(clientX - bounds.left - offsetX))),
      y: Math.max(18, Math.min(bounds.height - 24, Math.round(clientY - bounds.top - offsetY)))
    };
  }

  function findShortcutById(shortcutId: string) {
    for (const group of activeInlineShortcuts) {
      const match = group.items.find((item) => item.id === shortcutId);

      if (match) {
        return match;
      }
    }

    return null;
  }

  function clearFloatingSelection() {
    setSelectedBlockIds([]);
    setSelectedSymbolIds([]);
    setSelectedTextBoxIds([]);
  }

  function selectSingleBlock(blockId: string) {
    setSelectedBlockIds([blockId]);
    setSelectedSymbolIds([]);
  }

  function selectSingleSymbol(symbolId: string) {
    setSelectedSymbolIds([symbolId]);
    setSelectedBlockIds([]);
    setSelectedTextBoxIds([]);
  }

  function selectSingleTextBox(textBoxId: string) {
    setSelectedTextBoxIds([textBoxId]);
    setSelectedBlockIds([]);
    setSelectedSymbolIds([]);
  }

  function getCanvasPoint(clientX: number, clientY: number) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const bounds = canvas.getBoundingClientRect();

    return {
      x: Math.max(0, Math.min(bounds.width, clientX - bounds.left)),
      y: Math.max(0, Math.min(bounds.height, clientY - bounds.top))
    };
  }

  function normalizeSelectionRect(rect: Exclude<SelectionRect, null>) {
    return {
      left: Math.min(rect.originX, rect.currentX),
      top: Math.min(rect.originY, rect.currentY),
      right: Math.max(rect.originX, rect.currentX),
      bottom: Math.max(rect.originY, rect.currentY)
    };
  }

  function updateSelectionFromRect(rect: Exclude<SelectionRect, null>) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const canvasBounds = canvas.getBoundingClientRect();
    const normalized = normalizeSelectionRect(rect);
    const nextBlockIds = blocksRef.current
      .filter((block) => {
        const node = blockNodeRefs.current[block.id];

        if (!node) {
          return false;
        }

        const bounds = node.getBoundingClientRect();
        const left = bounds.left - canvasBounds.left;
        const top = bounds.top - canvasBounds.top;
        const right = left + bounds.width;
        const bottom = top + bounds.height;

        return right >= normalized.left && left <= normalized.right && bottom >= normalized.top && top <= normalized.bottom;
      })
      .map((block) => block.id);
    const nextSymbolIds = symbolsRef.current
      .filter((symbol) => {
        const node = symbolNodeRefs.current[symbol.id];

        if (!node) {
          return false;
        }

        const bounds = node.getBoundingClientRect();
        const left = bounds.left - canvasBounds.left;
        const top = bounds.top - canvasBounds.top;
        const right = left + bounds.width;
        const bottom = top + bounds.height;

        return right >= normalized.left && left <= normalized.right && bottom >= normalized.top && top <= normalized.bottom;
      })
      .map((symbol) => symbol.id);
    const nextTextBoxIds = textBoxesRef.current
      .filter((textBox) => {
        const node = textBoxNodeRefs.current[textBox.id];

        if (!node) {
          return false;
        }

        const bounds = node.getBoundingClientRect();
        const left = bounds.left - canvasBounds.left;
        const top = bounds.top - canvasBounds.top;
        const right = left + bounds.width;
        const bottom = top + bounds.height;

        return right >= normalized.left && left <= normalized.right && bottom >= normalized.top && top <= normalized.bottom;
      })
      .map((textBox) => textBox.id);

    setSelectedBlockIds(nextBlockIds);
    setSelectedSymbolIds(nextSymbolIds);
    setSelectedTextBoxIds(nextTextBoxIds);
  }

  function beginAreaSelection(clientX: number, clientY: number) {
    const point = getCanvasPoint(clientX, clientY);
    pendingSelectionRef.current = { originX: point.x, originY: point.y, started: false };
    setSelectionRect(null);
    setIsCanvasInteracting(true);
    clearFloatingSelection();
    setOpenMenu(null);
  }

  function beginTextBoxEditing(textBoxId: string) {
    setEditingTextBoxId(textBoxId);
    selectSingleTextBox(textBoxId);
    pendingFocusTextBoxIdRef.current = textBoxId;
  }

  function closeFloatingTextEditing() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setEditingTextBoxId(null);
    clearFloatingSelection();
    setOpenMenu(null);
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
    if (type === "fraction") {
      const block = createBlock("fraction");

      setState((current) => ({
        ...current,
        blocks: [...current.blocks, block]
      }));
      selectSingleBlock(block.id);
      setEditingFraction({ blockId: block.id, field: "numerator" });
      setOpenMenu(null);
      return;
    }

    setOpenMenu(null);
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

    if (block.type === "fraction") {
      setOpenMenu(null);
      selectSingleBlock(blockId);
      setEditingFraction({ blockId, field: "numerator" });
      return;
    }

    setOpenMenu(null);
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
      selectSingleBlock(modalState.block.id);
      setModalState(null);
      return;
    }

    setState((current) => ({
      ...current,
      blocks: [...current.blocks, modalState.block]
    }));
    selectSingleBlock(modalState.block.id);
    setModalState(null);
  }

  function removeBlock(blockId: string) {
    setState((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== blockId)
    }));
    setSelectedBlockIds((current) => current.filter((id) => id !== blockId));
  }

  function removeSymbol(symbolId: string) {
    setState((current) => ({
      ...current,
      symbols: current.symbols.filter((symbol) => symbol.id !== symbolId)
    }));
    setSelectedSymbolIds((current) => current.filter((id) => id !== symbolId));
  }

  function updateSymbolStyle(symbolId: string, updates: Partial<Pick<FloatingSymbol, "fontSize" | "color">>) {
    setState((current) => ({
      ...current,
      symbols: current.symbols.map((symbol) =>
        symbol.id === symbolId ? { ...symbol, ...updates } : symbol
      )
    }));
  }

  function updateTextBox(textBoxId: string, updates: Partial<Pick<FloatingTextBox, "text" | "width">>) {
    setState((current) => ({
      ...current,
      textBoxes: current.textBoxes.map((textBox) =>
        textBox.id === textBoxId ? { ...textBox, ...updates } : textBox
      )
    }));
  }

  function updateFractionField(blockId: string, key: "numerator" | "denominator", value: string) {
    setState((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === blockId && block.type === "fraction" ? { ...block, [key]: value } : block
      )
    }));
  }

  function finishFractionEditing(blockId: string) {
    const block = blocksRef.current.find((item) => item.id === blockId);

    if (!block || block.type !== "fraction") {
      setEditingFraction(null);
      return;
    }

    if (!block.numerator.trim() && !block.denominator.trim()) {
      removeBlock(blockId);
      setEditingFraction(null);
      return;
    }

    setEditingFraction(null);
  }

  function handleFractionKeyDown(blockId: string, field: "numerator" | "denominator", event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (field === "numerator") {
      setEditingFraction({ blockId, field: "denominator" });
      return;
    }

    finishFractionEditing(blockId);
  }

  function removeTextBox(textBoxId: string) {
    setState((current) => ({
      ...current,
      textBoxes: current.textBoxes.filter((textBox) => textBox.id !== textBoxId)
    }));
    setSelectedTextBoxIds((current) => current.filter((id) => id !== textBoxId));
  }

  function removeSelectedItems() {
    if (selectedCount === 0) {
      return;
    }

    setState((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => !selectedBlockIds.includes(block.id)),
      symbols: current.symbols.filter((symbol) => !selectedSymbolIds.includes(symbol.id)),
      textBoxes: current.textBoxes.filter((textBox) => !selectedTextBoxIds.includes(textBox.id))
    }));
    clearFloatingSelection();
  }

  function startDragging(itemType: "block" | "symbol" | "textBox", itemId: string, x: number, y: number, event: ReactMouseEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsCanvasInteracting(true);

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const keepCurrentSelection =
      itemType === "block"
        ? selectedBlockIdsRef.current.includes(itemId)
        : itemType === "symbol"
          ? selectedSymbolIdsRef.current.includes(itemId)
          : selectedTextBoxIdsRef.current.includes(itemId);
    const currentBlockIds = keepCurrentSelection
      ? selectedBlockIdsRef.current
      : itemType === "block"
        ? [itemId]
        : [];
    const currentSymbolIds = keepCurrentSelection
      ? selectedSymbolIdsRef.current
      : itemType === "symbol"
        ? [itemId]
        : [];
    const currentTextBoxIds = keepCurrentSelection
      ? selectedTextBoxIdsRef.current
      : itemType === "textBox"
        ? [itemId]
        : [];

    dragRef.current = {
      itemType,
      itemId,
      pointerOffsetX: event.clientX - bounds.left - x,
      pointerOffsetY: event.clientY - bounds.top - y,
      groupBlockPositions: blocksRef.current
        .filter((block) => currentBlockIds.includes(block.id))
        .map((block) => ({ id: block.id, x: block.x, y: block.y })),
      groupSymbolPositions: symbolsRef.current
        .filter((symbol) => currentSymbolIds.includes(symbol.id))
        .map((symbol) => ({ id: symbol.id, x: symbol.x, y: symbol.y })),
      groupTextBoxPositions: textBoxesRef.current
        .filter((textBox) => currentTextBoxIds.includes(textBox.id))
        .map((textBox) => ({ id: textBox.id, x: textBox.x, y: textBox.y })),
      anchorX: x,
      anchorY: y
    };

    if (!keepCurrentSelection) {
      if (itemType === "block") {
        selectSingleBlock(itemId);
      } else if (itemType === "symbol") {
        selectSingleSymbol(itemId);
      } else {
        selectSingleTextBox(itemId);
      }
    }
  }

  function handleToolDragStart(payload: ToolbarDragPayload, event: ReactDragEvent<HTMLButtonElement>) {
    const source = event.currentTarget;
    const rect = source.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const previewNode = source.cloneNode(true) as HTMLElement;

    previewNode.style.position = "fixed";
    previewNode.style.top = "-200vh";
    previewNode.style.left = "-200vw";
    previewNode.style.pointerEvents = "none";
    previewNode.style.zIndex = "9999";
    previewNode.style.boxShadow = "0 12px 30px rgba(31, 45, 61, 0.12)";
    previewNode.style.opacity = "0.92";
    document.body.append(previewNode);

    toolbarDragMetaRef.current = { offsetX, offsetY, previewNode };
    toolbarDragUntilRef.current = Date.now() + 350;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-maths-tool", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", payload.kind === "shortcut" ? payload.shortcutId : payload.toolId);
    event.dataTransfer.setDragImage(previewNode, offsetX, offsetY);
    setOpenMenu(null);
  }

  function handleToolDragEnd() {
    const previewNode = toolbarDragMetaRef.current?.previewNode;

    if (previewNode) {
      previewNode.remove();
    }

    toolbarDragMetaRef.current = null;
  }

  function shouldIgnoreToolbarClick() {
    if (Date.now() <= toolbarDragUntilRef.current) {
      toolbarDragUntilRef.current = 0;
      return true;
    }

    return false;
  }

  function handleCanvasDragOver(event: ReactDragEvent<HTMLElement>) {
    if (!event.dataTransfer.types.includes("application/x-maths-tool")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsCanvasDropActive(true);
  }

  function handleCanvasDragLeave(event: ReactDragEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsCanvasDropActive(false);
  }

  function handleCanvasDrop(event: ReactDragEvent<HTMLElement>) {
    const rawPayload = event.dataTransfer.getData("application/x-maths-tool");

    if (!rawPayload) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsCanvasDropActive(false);
    clearFloatingSelection();

    let payload: ToolbarDragPayload | null = null;

    try {
      payload = JSON.parse(rawPayload) as ToolbarDragPayload;
    } catch {
      payload = null;
    }

    if (!payload) {
      return;
    }

    const position = getCanvasDropPosition(
      event.clientX,
      event.clientY,
      toolbarDragMetaRef.current?.offsetX ?? 0,
      toolbarDragMetaRef.current?.offsetY ?? 0
    );

    handleToolDragEnd();

    if (payload.kind === "structured") {
      if (payload.toolId === "fraction") {
        const block = { ...createBlock("fraction"), x: position.x, y: position.y };

        setState((current) => ({
          ...current,
          blocks: [...current.blocks, block]
        }));
        selectSingleBlock(block.id);
        setEditingFraction({ blockId: block.id, field: "numerator" });
        return;
      }

      setModalState({
        mode: "insert",
        block: { ...createBlock(payload.toolId), x: position.x, y: position.y }
      });
      return;
    }

    const shortcut = findShortcutById(payload.shortcutId);

    if (!shortcut) {
      return;
    }

    const symbol = createFloatingSymbol(shortcut, position.x, position.y);

    setState((current) => ({
      ...current,
      symbols: [...current.symbols, symbol]
    }));
    selectSingleSymbol(symbol.id);
  }

  function resetDocument() {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
    setOpenMenu(null);
    setModalState(null);
    clearFloatingSelection();
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

  function toggleMenu(menu: Exclude<UtilityMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  return (
    <main className="editor-shell">
      <header className="top-toolbar">
        <div className="top-toolbar-inner">
          <div className="toolbar-row toolbar-row-primary">
            <div className="toolbar-shortcut-group" aria-label="Blocs posés">
              {activeStructuredTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className="toolbar-shortcut"
                  draggable
                  title={tool.hint}
                  onDragStart={(event) => handleToolDragStart({ kind: "structured", toolId: tool.id }, event)}
                  onDragEnd={handleToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    openInsertModal(tool.id);
                  }}
                >
                  {tool.label}
                </button>
              ))}
            </div>

            <div className="toolbar-icon-actions">
              <button
                type="button"
                className={`toolbar-icon-button ${openMenu === "export" ? "toolbar-icon-button-active" : ""}`}
                aria-label="Exporter"
                title="Exporter"
                onClick={() => toggleMenu("export")}
              >
                ⤓
              </button>
              <button
                type="button"
                className={`toolbar-icon-button ${openMenu === "settings" ? "toolbar-icon-button-active" : ""}`}
                aria-label="Réglages"
                title="Réglages"
                onClick={() => toggleMenu("settings")}
              >
                ⚙
              </button>
            </div>
          </div>

          <div className="toolbar-row toolbar-row-secondary">
            <div className="toolbar-shortcut-group toolbar-shortcut-group-symbols" aria-label="Raccourcis maths">
              {activeInlineShortcuts.flatMap((group) => group.items).map((shortcut) => (
                <button
                  key={shortcut.id}
                  type="button"
                  className="toolbar-shortcut toolbar-shortcut-symbol"
                  draggable
                  title={shortcut.hint}
                  onDragStart={(event) => handleToolDragStart({ kind: "shortcut", shortcutId: shortcut.id }, event)}
                  onDragEnd={handleToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    insertTextAtCursor(shortcut.content);
                  }}
                >
                  {shortcut.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {openMenu ? (
          <div className="toolbar-popover-shell">
            {openMenu === "export" ? (
              <section className="toolbar-panel toolbar-popover-panel toolbar-file-panel" aria-label="Exporter">
                <div className="panel-block">
                  <h2>Exporter</h2>
                  <p className="toolbar-helper">Enregistre la feuille ou lance l’impression.</p>
                </div>
                <div className="panel-chip-row">
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
              </section>
            ) : null}

            {openMenu === "settings" ? (
              <section className="toolbar-panel toolbar-popover-panel toolbar-settings-panel" aria-label="Réglages">
                <div className="panel-block">
                  <h2>Réglages</h2>
                  <p className="toolbar-helper">Choisis le niveau pour adapter les raccourcis affichés.</p>
                </div>
                <div className="panel-chip-row">
                  <button
                    type="button"
                    className={`chip-button ${state.mode === "college" ? "chip-button-active" : ""}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setState((current) => ({ ...current, mode: "college" }))}
                  >
                    Collège
                  </button>
                  <button
                    type="button"
                    className={`chip-button ${state.mode === "lycee" ? "chip-button-active" : ""}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setState((current) => ({ ...current, mode: "lycee" }))}
                  >
                    Lycée
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </header>

      <section className="editor-stage">
        <div className="editor-sheet">
          <div className="editor-sheet-head">
            <div>
              <input
                className="sheet-title-input"
                value={state.title}
                onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))}
                placeholder="Document sans titre"
                aria-label="Titre du document"
              />
            </div>
            <p className="editor-sheet-note">
              Écris librement, puis déplace les opérations posées où tu veux sur la feuille.
            </p>
          </div>

          <div className="editor-local-toolbar" aria-label="Mise en forme du texte">
            <div className="editor-local-toolbar-group">
              <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")}>
                Gras
              </button>
              <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("removeFormat")}>
                Effacer
              </button>
            </div>

            <div className="editor-local-toolbar-group">
              {FONT_SIZE_OPTIONS.map((option) => (
                <button key={option.id} type="button" className="chip-button chip-button-compact" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("fontSize", option.value)}>
                  {option.label}
                </button>
              ))}
            </div>

            <div className="editor-local-toolbar-group">
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

            {selectedCount > 1 ? (
              <div className="editor-local-toolbar-group editor-local-toolbar-group-block">
                <span className="selected-block-label">{selectedCount} éléments sélectionnés</span>
                <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={removeSelectedItems}>
                  Supprimer
                </button>
              </div>
            ) : null}

            {selectedBlock ? (
              <div className="editor-local-toolbar-group editor-local-toolbar-group-block">
                <span className="selected-block-label">{getBlockTitle(selectedBlock)}</span>
                <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => openEditModal(selectedBlock.id)}>
                  Modifier
                </button>
                <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => removeBlock(selectedBlock.id)}>
                  Supprimer
                </button>
              </div>
            ) : null}

            {selectedSymbol ? (
              <div className="editor-local-toolbar-group editor-local-toolbar-group-block">
                <span className="selected-block-label">Symbole {selectedSymbol.label}</span>
                <button
                  type="button"
                  className="chip-button chip-button-compact"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => updateSymbolStyle(selectedSymbol.id, { fontSize: Math.max(0.92, selectedSymbol.fontSize - 0.12) })}
                >
                  A-
                </button>
                <button
                  type="button"
                  className="chip-button chip-button-compact"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => updateSymbolStyle(selectedSymbol.id, { fontSize: Math.min(2.4, selectedSymbol.fontSize + 0.12) })}
                >
                  A+
                </button>
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={`selected-symbol-${option.id}`}
                    type="button"
                    className="color-chip"
                    style={{ backgroundColor: option.value }}
                    aria-label={option.label}
                    title={option.label}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => updateSymbolStyle(selectedSymbol.id, { color: option.value })}
                  />
                ))}
                <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => removeSymbol(selectedSymbol.id)}>
                  Supprimer
                </button>
              </div>
            ) : null}

            {selectedTextBox ? (
              <div className="editor-local-toolbar-group editor-local-toolbar-group-block">
                <span className="selected-block-label">Zone de texte</span>
                <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => beginTextBoxEditing(selectedTextBox.id)}>
                  Modifier
                </button>
                <button type="button" className="chip-button" onMouseDown={(event) => event.preventDefault()} onClick={() => removeTextBox(selectedTextBox.id)}>
                  Supprimer
                </button>
              </div>
            ) : null}
          </div>

          <div
            className={`document-canvas ${isCanvasDropActive ? "document-canvas-drop-active" : ""} ${isCanvasInteracting ? "document-canvas-interacting" : ""}`}
            ref={canvasRef}
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                if (selectedTextBoxId) {
                  event.preventDefault();
                  closeFloatingTextEditing();
                  return;
                }

                event.preventDefault();
                beginAreaSelection(event.clientX, event.clientY);
                return;
              }

              clearFloatingSelection();
              setOpenMenu(null);
            }}
          >
            <div
              ref={editorRef}
              className="canvas-editor"
              contentEditable
              suppressContentEditableWarning
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  if (selectedTextBoxId) {
                    event.preventDefault();
                    closeFloatingTextEditing();
                    return;
                  }

                  event.preventDefault();
                  beginAreaSelection(event.clientX, event.clientY);
                } else {
                  clearFloatingSelection();
                }
              }}
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              onInput={syncText}
              onFocus={saveSelection}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onPaste={handlePaste}
            />

            {state.blocks.map((block) => (
              <article
                key={block.id}
                ref={(node) => {
                  blockNodeRefs.current[block.id] = node;
                }}
                className={`floating-math-block ${selectedBlockIds.includes(block.id) ? "floating-math-block-selected" : ""}`}
                style={{ left: `${block.x}px`, top: `${block.y}px` }}
                onMouseDown={(event) => {
                  startDragging("block", block.id, block.x, block.y, event);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  openEditModal(block.id);
                }}
              >
                {block.type === "fraction" && editingFraction?.blockId === block.id ? (
                  <div className="math-layout fraction-layout">
                    <div className="fraction-preview fraction-preview-editing">
                      <input
                        ref={(node) => {
                          fractionInputRefs.current[block.id] = {
                            ...fractionInputRefs.current[block.id],
                            numerator: node
                          };
                        }}
                        className="fraction-inline-input"
                        value={block.numerator}
                        placeholder="a"
                        onMouseDown={(event) => event.stopPropagation()}
                        onChange={(event) => updateFractionField(block.id, "numerator", event.target.value)}
                        onKeyDown={(event) => handleFractionKeyDown(block.id, "numerator", event)}
                        onBlur={() => {
                          if (editingFraction?.field === "numerator") {
                            setTimeout(() => {
                              if (editingFraction?.field === "numerator") {
                                finishFractionEditing(block.id);
                              }
                            }, 0);
                          }
                        }}
                      />
                      <div className="fraction-bar" />
                      <input
                        ref={(node) => {
                          fractionInputRefs.current[block.id] = {
                            ...fractionInputRefs.current[block.id],
                            denominator: node
                          };
                        }}
                        className="fraction-inline-input"
                        value={block.denominator}
                        placeholder="b"
                        onMouseDown={(event) => event.stopPropagation()}
                        onChange={(event) => updateFractionField(block.id, "denominator", event.target.value)}
                        onKeyDown={(event) => handleFractionKeyDown(block.id, "denominator", event)}
                        onBlur={() => {
                          if (editingFraction?.field === "denominator") {
                            setTimeout(() => {
                              if (editingFraction?.field === "denominator") {
                                finishFractionEditing(block.id);
                              }
                            }, 0);
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  renderMathPreview(block)
                )}
              </article>
            ))}

            {state.symbols.map((symbol) => (
              <button
                key={symbol.id}
                type="button"
                ref={(node) => {
                  symbolNodeRefs.current[symbol.id] = node;
                }}
                className={`floating-math-symbol ${selectedSymbolIds.includes(symbol.id) ? "floating-math-symbol-selected" : ""}`}
                style={{ left: `${symbol.x}px`, top: `${symbol.y}px`, color: symbol.color, fontSize: `${symbol.fontSize}rem` }}
                onMouseDown={(event) => {
                  startDragging("symbol", symbol.id, symbol.x, symbol.y, event);
                }}
              >
                {symbol.content}
              </button>
            ))}

            {state.textBoxes.map((textBox) => (
              <article
                key={textBox.id}
                ref={(node) => {
                  textBoxNodeRefs.current[textBox.id] = node;
                }}
                className={`floating-text-box ${selectedTextBoxIds.includes(textBox.id) ? "floating-text-box-selected" : ""}`}
                style={{ left: `${textBox.x}px`, top: `${textBox.y}px`, width: `${textBox.width}px` }}
                onMouseDown={(event) => {
                  if (editingTextBoxId === textBox.id) {
                    return;
                  }

                  startDragging("textBox", textBox.id, textBox.x, textBox.y, event);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  beginTextBoxEditing(textBox.id);
                }}
              >
                {editingTextBoxId === textBox.id ? (
                  <input
                    type="text"
                    className="floating-text-input"
                    value={textBox.text}
                    placeholder="Écris ici"
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      selectSingleTextBox(textBox.id);
                    }}
                    onFocus={() => {
                      selectSingleTextBox(textBox.id);
                    }}
                    onChange={(event) => {
                      const nextText = event.target.value;

                      updateTextBox(textBox.id, {
                        text: nextText,
                        width: Math.max(100, getTextBoxWidth(nextText))
                      });
                    }}
                    onBlur={(event) => {
                      if (!event.currentTarget.value.trim()) {
                        removeTextBox(textBox.id);
                        setEditingTextBoxId(null);
                        return;
                      }

                      updateTextBox(textBox.id, {
                        text: event.currentTarget.value.trim(),
                        width: getTextBoxWidth(event.currentTarget.value)
                      });
                      setEditingTextBoxId(null);
                      clearFloatingSelection();
                    }}
                  />
                ) : (
                  <div className="floating-text-content">
                    {textBox.text || "Zone de texte"}
                  </div>
                )}
              </article>
            ))}

            {selectionRect ? (
              <div
                className="canvas-selection-rect"
                style={{
                  left: `${Math.min(selectionRect.originX, selectionRect.currentX)}px`,
                  top: `${Math.min(selectionRect.originY, selectionRect.currentY)}px`,
                  width: `${Math.abs(selectionRect.currentX - selectionRect.originX)}px`,
                  height: `${Math.abs(selectionRect.currentY - selectionRect.originY)}px`
                }}
              />
            ) : null}
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
