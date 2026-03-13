"use client";

import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Document, ImageRun, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

type StudyMode = "college" | "lycee";

type WriterLine = {
  id: string;
  latex: string;
};

type Shortcut = {
  id: string;
  label: string;
  hint: string;
  latex: string;
  hotkey: string;
  modes: StudyMode[];
};

type ShortcutGroup = {
  name: string;
  tone: string;
  items: Shortcut[];
};

type WriterState = {
  title: string;
  mode: StudyMode;
  lines: WriterLine[];
};

type MathfieldElement = HTMLElement & {
  value: string;
  insert?: (value: string) => void;
  focus: () => void;
  blur?: () => void;
};

type MathfieldGlobal = {
  fontsDirectory?: string | null;
  soundsDirectory?: string | null;
};

type MathfieldWindow = typeof globalThis & {
  MathfieldElement?: MathfieldGlobal;
};

const STORAGE_KEY = "maths-facile-writer-v2";

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    name: "Essentiels",
    tone: "tone-sand",
    items: [
      {
        id: "fraction",
        label: "Fraction",
        hint: "Ecriture de fraction",
        latex: "\\frac{a}{b}",
        hotkey: "1",
        modes: ["college", "lycee"]
      },
      {
        id: "power",
        label: "Puissance",
        hint: "Carré, cube, puissance n",
        latex: "a^n",
        hotkey: "2",
        modes: ["college", "lycee"]
      },
      {
        id: "root",
        label: "Racine",
        hint: "Racine carrée",
        latex: "\\sqrt{a}",
        hotkey: "3",
        modes: ["college", "lycee"]
      },
      {
        id: "division",
        label: "Division",
        hint: "Signe diviser",
        latex: "a\\div b",
        hotkey: "4",
        modes: ["college", "lycee"]
      },
      {
        id: "times",
        label: "Produit",
        hint: "Signe multiplier",
        latex: "a\\times b",
        hotkey: "5",
        modes: ["college", "lycee"]
      },
      {
        id: "percent",
        label: "Pourcentage",
        hint: "Pourcent",
        latex: "25\\%",
        hotkey: "6",
        modes: ["college", "lycee"]
      }
    ]
  },
  {
    name: "Comparer",
    tone: "tone-blue",
    items: [
      {
        id: "equal",
        label: "Egal",
        hint: "Egalité",
        latex: "=",
        hotkey: "7",
        modes: ["college", "lycee"]
      },
      {
        id: "leq",
        label: "Inférieur ou égal",
        hint: "Signe ≤",
        latex: "\\le",
        hotkey: "8",
        modes: ["college", "lycee"]
      },
      {
        id: "geq",
        label: "Supérieur ou égal",
        hint: "Signe ≥",
        latex: "\\ge",
        hotkey: "9",
        modes: ["college", "lycee"]
      },
      {
        id: "approx",
        label: "Approché",
        hint: "Signe ≈",
        latex: "\\approx",
        hotkey: "0",
        modes: ["college", "lycee"]
      },
      {
        id: "neq",
        label: "Différent",
        hint: "Signe ≠",
        latex: "\\neq",
        hotkey: "-",
        modes: ["college", "lycee"]
      }
    ]
  },
  {
    name: "Collège",
    tone: "tone-green",
    items: [
      {
        id: "angle",
        label: "Angle",
        hint: "Mesure d'angle",
        latex: "\\widehat{ABC}=40^\\circ",
        hotkey: "a",
        modes: ["college", "lycee"]
      },
      {
        id: "segment",
        label: "Segment",
        hint: "Longueur de segment",
        latex: "\\overline{AB}=5\\text{ cm}",
        hotkey: "s",
        modes: ["college", "lycee"]
      },
      {
        id: "parallel",
        label: "Parallèle",
        hint: "Droites parallèles",
        latex: "(AB)\\parallel(CD)",
        hotkey: "d",
        modes: ["college", "lycee"]
      },
      {
        id: "perp",
        label: "Perpendiculaire",
        hint: "Droites perpendiculaires",
        latex: "(AB)\\perp(CD)",
        hotkey: "f",
        modes: ["college", "lycee"]
      },
      {
        id: "pi",
        label: "Pi",
        hint: "Constante pi",
        latex: "\\pi",
        hotkey: "g",
        modes: ["college", "lycee"]
      },
      {
        id: "probability",
        label: "Probabilité",
        hint: "Calcul simple",
        latex: "P(A)=\\frac{3}{10}",
        hotkey: "h",
        modes: ["college", "lycee"]
      }
    ]
  },
  {
    name: "Lycée",
    tone: "tone-plum",
    items: [
      {
        id: "function",
        label: "Fonction",
        hint: "Notation de fonction",
        latex: "f(x)=",
        hotkey: "j",
        modes: ["lycee"]
      },
      {
        id: "limit",
        label: "Limite",
        hint: "Notation de limite",
        latex: "\\lim_{x\\to a}",
        hotkey: "k",
        modes: ["lycee"]
      },
      {
        id: "sum",
        label: "Somme",
        hint: "Somme sigma",
        latex: "\\sum_{k=1}^{n}",
        hotkey: "l",
        modes: ["lycee"]
      },
      {
        id: "integral",
        label: "Intégrale",
        hint: "Intégrale définie",
        latex: "\\int_a^b",
        hotkey: "m",
        modes: ["lycee"]
      },
      {
        id: "trig",
        label: "Trigonométrie",
        hint: "Sinus, cosinus",
        latex: "\\sin(x)",
        hotkey: ",",
        modes: ["lycee"]
      },
      {
        id: "ln",
        label: "Ln",
        hint: "Logarithme népérien",
        latex: "\\ln(x)",
        hotkey: ".",
        modes: ["lycee"]
      }
    ]
  }
];

const DEFAULT_STATE: WriterState = {
  title: "Mes formules de maths",
  mode: "college",
  lines: [
    { id: "line-1", latex: "Ecrire ici une formule ou une phrase de maths" },
    { id: "line-2", latex: "\\frac{3}{4}+\\frac{1}{8}" }
  ]
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function WriterLineField({
  value,
  onChange,
  onFocus,
  onEnter,
  onDeleteEmpty,
  register,
  readOnly = false
}: {
  value: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onEnter?: () => void;
  onDeleteEmpty?: () => void;
  register?: (element: MathfieldElement | null) => void;
  readOnly?: boolean;
}) {
  const ref = useRef<MathfieldElement | null>(null);

  useEffect(() => {
    import("mathlive")
      .then((module) => {
        const globalMathfield = (globalThis as MathfieldWindow).MathfieldElement;
        const mathfieldGlobal = (
          module.MathfieldElement ?? globalMathfield
        ) as MathfieldGlobal | undefined;

        if (!mathfieldGlobal) {
          return;
        }

        mathfieldGlobal.fontsDirectory = "/mathlive/fonts";
        mathfieldGlobal.soundsDirectory = null;
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    register?.(element);

    const handleInput = () => {
      onChange?.(element.value);
    };

    const handleKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;

      if (readOnly) {
        return;
      }

      if (keyboardEvent.key === "Enter" && !keyboardEvent.shiftKey) {
        keyboardEvent.preventDefault();
        onEnter?.();
        return;
      }

      if (
        keyboardEvent.key === "Backspace" &&
        element.value.trim() === "" &&
        onDeleteEmpty
      ) {
        keyboardEvent.preventDefault();
        onDeleteEmpty();
      }
    };

    element.setAttribute("virtual-keyboard-mode", "onfocus");
    element.setAttribute("smart-mode", "");
    element.setAttribute("smart-fence", "");
    element.setAttribute("default-mode", "math");
    element.setAttribute("letter-shape-style", "french");

    if (readOnly) {
      element.setAttribute("read-only", "");
      element.setAttribute("aria-readonly", "true");
      element.setAttribute("tabindex", "-1");
    } else {
      element.removeAttribute("read-only");
      element.setAttribute("aria-readonly", "false");
      element.setAttribute("tabindex", "0");
    }

    if (element.value !== value) {
      element.value = value;
    }

    element.addEventListener("input", handleInput);
    element.addEventListener("keydown", handleKeyDown);

    return () => {
      register?.(null);
      element.removeEventListener("input", handleInput);
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [onChange, onDeleteEmpty, onEnter, readOnly, register, value]);

  useEffect(() => {
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  return createElement("math-field", {
    ref: (node: Element | null) => {
      ref.current = node as MathfieldElement | null;
    },
    className: readOnly ? "writer-preview-field" : "writer-line-field",
    onFocus
  });
}

export function MathWorkbook() {
  const [state, setState] = useState<WriterState>(DEFAULT_STATE);
  const [activeLineId, setActiveLineId] = useState(DEFAULT_STATE.lines[0].id);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "word" | null>(null);
  const fieldRefs = useRef<Record<string, MathfieldElement | null>>({});
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsHydrated(true);

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as WriterState;

      if (Array.isArray(parsed.lines) && parsed.lines.length > 0) {
        setState(parsed);
        setActiveLineId(parsed.lines[0].id);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  useEffect(() => {
    if (!pendingFocusId) {
      return;
    }

    const focusTarget = () => {
      const field = fieldRefs.current[pendingFocusId];

      if (!field) {
        return false;
      }

      field.focus();
      setActiveLineId(pendingFocusId);
      setPendingFocusId(null);
      return true;
    };

    if (focusTarget()) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      focusTarget();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pendingFocusId, state.lines.length]);

  const activeShortcuts = useMemo(
    () =>
      SHORTCUT_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.modes.includes(state.mode))
      })).filter((group) => group.items.length > 0),
    [state.mode]
  );

  const hotkeyHelp = useMemo(
    () =>
      activeShortcuts
        .flatMap((group) => group.items)
        .slice(0, 8)
        .map((item) => `${item.hotkey.toUpperCase()} · ${item.label}`),
    [activeShortcuts]
  );

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      const activeField = fieldRefs.current[activeLineId];

      if (!activeField || document.activeElement !== activeField) {
        return;
      }

      const shortcut = activeShortcuts
        .flatMap((group) => group.items)
        .find((item) => item.hotkey === event.key.toLowerCase());

      if (!shortcut) {
        return;
      }

      event.preventDefault();
      insertShortcut(shortcut);
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [activeLineId, activeShortcuts]);

  function updateTitle(title: string) {
    setState((current) => ({
      ...current,
      title
    }));
  }

  function updateMode(mode: StudyMode) {
    setState((current) => ({
      ...current,
      mode
    }));
  }

  function updateLine(lineId: string, latex: string) {
    setState((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === lineId ? { ...line, latex } : line
      )
    }));
  }

  function addLine(afterId?: string) {
    const newLine = {
      id: createId("line"),
      latex: ""
    };

    setState((current) => {
      if (!afterId) {
        return {
          ...current,
          lines: [...current.lines, newLine]
        };
      }

      const index = current.lines.findIndex((line) => line.id === afterId);

      if (index === -1) {
        return {
          ...current,
          lines: [...current.lines, newLine]
        };
      }

      const lines = [...current.lines];
      lines.splice(index + 1, 0, newLine);

      return {
        ...current,
        lines
      };
    });

    setPendingFocusId(newLine.id);
  }

  function removeLine(lineId: string) {
    setState((current) => {
      if (current.lines.length === 1) {
        return current;
      }

      const index = current.lines.findIndex((line) => line.id === lineId);
      const lines = current.lines.filter((line) => line.id !== lineId);
      const fallback = lines[Math.max(0, index - 1)] ?? lines[0];

      setPendingFocusId(fallback.id);

      return {
        ...current,
        lines
      };
    });
  }

  function resetDocument() {
    setState(DEFAULT_STATE);
    setActiveLineId(DEFAULT_STATE.lines[0].id);
    setPendingFocusId(DEFAULT_STATE.lines[0].id);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function insertShortcut(shortcut: Shortcut) {
    const activeField =
      fieldRefs.current[activeLineId] ?? fieldRefs.current[state.lines[0]?.id ?? ""];

    if (activeField?.insert) {
      activeField.focus();
      activeField.insert(shortcut.latex);
      window.requestAnimationFrame(() => {
        updateLine(activeLineId, activeField.value);
      });
      return;
    }

    const firstLineId = state.lines[0]?.id;

    if (firstLineId) {
      updateLine(firstLineId, `${state.lines[0].latex} ${shortcut.latex}`.trim());
      setPendingFocusId(firstLineId);
    }
  }

  async function exportPdf() {
    if (!exportRef.current) {
      return;
    }

    fieldRefs.current[activeLineId]?.blur?.();
    setIsExporting("pdf");

    try {
      const imageUrl = await toPng(exportRef.current, {
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

      const pdf = new jsPDF({
        orientation: image.width > image.height ? "landscape" : "portrait",
        unit: "pt",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / image.width, pageHeight / image.height);
      const renderWidth = image.width * ratio;
      const renderHeight = image.height * ratio;

      pdf.addImage(
        imageUrl,
        "PNG",
        (pageWidth - renderWidth) / 2,
        20,
        renderWidth,
        renderHeight
      );
      pdf.save(`${safeFileName(state.title) || "maths-facile"}.pdf`);
    } finally {
      setIsExporting(null);
    }
  }

  async function exportWord() {
    if (!exportRef.current) {
      return;
    }

    fieldRefs.current[activeLineId]?.blur?.();
    setIsExporting("word");

    try {
      const blob = await toBlob(exportRef.current, {
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

      const maxWidth = 520;
      const ratio = maxWidth / image.width;
      const height = Math.max(280, Math.round(image.height * ratio));

      const document = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                spacing: { after: 180 },
                children: [
                  new TextRun({
                    text: state.title,
                    bold: true,
                    size: 34
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 160 },
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
                    data: arrayBuffer,
                    type: "png",
                    transformation: {
                      width: maxWidth,
                      height
                    }
                  })
                ]
              })
            ]
          }
        ]
      });

      const docBlob = await Packer.toBlob(document);
      saveAs(docBlob, `${safeFileName(state.title) || "maths-facile"}.docx`);
    } finally {
      setIsExporting(null);
    }
  }

  return (
    <main className="writer-shell">
      <header className="writer-topbar">
        <div className="writer-brand">
          <p className="writer-eyebrow">Maths facile</p>
          <h1>Une feuille pour écrire, des raccourcis pour aller vite.</h1>
          <p className="writer-intro">
            L&apos;enfant écrit dans une grande page comme dans un traitement de texte,
            puis insère les symboles utiles du programme en un clic ou avec
            <strong> Ctrl</strong> / <strong>Cmd</strong> + une touche.
          </p>
        </div>

        <div className="writer-controls">
          <label className="title-field">
            <span>Titre du document</span>
            <input
              value={state.title}
              onChange={(event) => updateTitle(event.target.value)}
              placeholder="Mes formules de maths"
            />
          </label>

          <div className="mode-switch" aria-label="Choix du mode">
            <button
              type="button"
              className={state.mode === "college" ? "mode-active" : ""}
              onClick={() => updateMode("college")}
              aria-pressed={state.mode === "college"}
            >
              Collège
            </button>
            <button
              type="button"
              className={state.mode === "lycee" ? "mode-active" : ""}
              onClick={() => updateMode("lycee")}
              aria-pressed={state.mode === "lycee"}
            >
              Lycée
            </button>
          </div>

          <div className="export-actions">
            <button type="button" className="toolbar-button primary" onClick={exportPdf} disabled={isExporting !== null}>
              {isExporting === "pdf" ? "Création PDF..." : "PDF"}
            </button>
            <button type="button" className="toolbar-button secondary" onClick={exportWord} disabled={isExporting !== null}>
              {isExporting === "word" ? "Création Word..." : "Word"}
            </button>
            <button type="button" className="toolbar-button ghost" onClick={() => window.print()}>
              Imprimer
            </button>
            <button type="button" className="toolbar-button ghost" onClick={resetDocument}>
              Nouveau
            </button>
          </div>
        </div>
      </header>

      <section className="shortcut-board">
        <div className="shortcut-note">
          <p className="shortcut-note-title">
            {state.mode === "college" ? "Raccourcis collège" : "Raccourcis lycée"}
          </p>
          <p className="shortcut-note-text">
            Appuie sur une touche de raccourci pendant que la ligne est active,
            ou clique sur un bouton pour insérer directement le symbole.
          </p>
          <div className="shortcut-help">
            {hotkeyHelp.map((item) => (
              <span key={item} className="shortcut-help-chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="shortcut-groups">
          {activeShortcuts.map((group) => (
            <section key={group.name} className={`shortcut-group ${group.tone}`}>
              <header className="shortcut-group-head">
                <h2>{group.name}</h2>
              </header>
              <div className="shortcut-grid">
                {group.items.map((shortcut) => (
                  <button
                    key={shortcut.id}
                    type="button"
                    className="shortcut-tile"
                    onClick={() => insertShortcut(shortcut)}
                  >
                    <span>{shortcut.label}</span>
                    <small>{shortcut.hint}</small>
                    <kbd>{shortcut.hotkey.toUpperCase()}</kbd>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="document-stage">
        <div className="document-head">
          <div>
            <h2>{state.title || "Document sans titre"}</h2>
            <p>
              {state.mode === "college"
                ? "Mode collège · fractions, géométrie, puissances, probabilités"
                : "Mode lycée · fonctions, limites, sommes, intégrales et trigonométrie"}
            </p>
          </div>
          <div className="document-tips">
            <span>Entrée : nouvelle ligne</span>
            <span>Retour arrière sur ligne vide : supprime la ligne</span>
          </div>
        </div>

        <div className="writer-paper">
          <div className="writer-lines">
            {state.lines.map((line, index) => (
              <div key={line.id} className="writer-line-row">
                <div className="line-gutter" aria-hidden="true">
                  {index + 1}
                </div>
                <WriterLineField
                  value={line.latex}
                  onFocus={() => setActiveLineId(line.id)}
                  onChange={(value) => updateLine(line.id, value)}
                  onEnter={() => addLine(line.id)}
                  onDeleteEmpty={() => removeLine(line.id)}
                  register={(element) => {
                    fieldRefs.current[line.id] = element;
                  }}
                />
              </div>
            ))}
          </div>

          <button type="button" className="add-line-button" onClick={() => addLine()}>
            + Ajouter une ligne
          </button>
        </div>
      </section>

      <div className="export-clone" aria-hidden="true">
        <div className="export-paper" ref={exportRef}>
          <header className="export-paper-head">
            <div>
              <p className="export-badge">
                {state.mode === "college" ? "Mode collège" : "Mode lycée"}
              </p>
              <h3>{state.title || "Document sans titre"}</h3>
            </div>
          </header>

          <div className="export-lines">
            {state.lines.map((line) => (
              <div key={`export-${line.id}`} className="export-line-row">
                <WriterLineField value={line.latex} readOnly />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
