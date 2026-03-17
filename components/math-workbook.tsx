"use client";

import {
  type ChangeEvent as ReactChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type CSSProperties as ReactCSSProperties,
  type DragEvent as ReactDragEvent,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { toBlob, toPng } from "html-to-image";
import { jsPDF } from "jspdf";

type StudyMode = "college" | "lycee";
type SheetStyle = "seyes" | "large-grid" | "small-grid" | "blank";
type StructuredTool = "fraction" | "addition" | "subtraction" | "multiplication" | "division" | "power" | "root";
type UtilityMenu = "highlight" | null;

type FractionBlock = {
  id: string;
  type: "fraction";
  numerator: string;
  denominator: string;
  simplified: string;
  caption: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
  numeratorStrike?: boolean;
  denominatorStrike?: boolean;
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
  work: string;
  struckCells: string[];
  caption: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
  x: number;
  y: number;
  width: number;
};

type AdditionBlock = {
  id: string;
  type: "addition";
  top: string;
  bottom: string;
  result: string;
  carryTop: string[];
  carryBottom: string[];
  carryResult: string[];
  struckCells: string[];
  caption: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
  x: number;
  y: number;
  width: number;
};

type SubtractionBlock = {
  id: string;
  type: "subtraction";
  top: string;
  bottom: string;
  result: string;
  carryTop: string[];
  carryBottom: string[];
  carryResult: string[];
  struckCells: string[];
  caption: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
  x: number;
  y: number;
  width: number;
};

type MultiplicationBlock = {
  id: string;
  type: "multiplication";
  top: string;
  bottom: string;
  result: string;
  carryTop: string[];
  carryBottom: string[];
  carryResult: string[];
  struckCells: string[];
  caption: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
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
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
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
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
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
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
};

type FloatingTextBox = {
  id: string;
  type: "textBox";
  variant?: "default" | "note";
  text: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
  x: number;
  y: number;
  width: number;
};

type FreehandPoint = {
  x: number;
  y: number;
};

type FreehandStroke = {
  id: string;
  color: string;
  width: number;
  opacity: number;
  points: FreehandPoint[];
};

type MathBlock = FractionBlock | AdditionBlock | SubtractionBlock | MultiplicationBlock | DivisionBlock | PowerBlock | RootBlock;

type WriterState = {
  title: string;
  mode: StudyMode;
  sheetStyle: SheetStyle;
  activeColor: string;
  activeHighlightColor: string | null;
  textHtml: string;
  blocks: MathBlock[];
  symbols: FloatingSymbol[];
  textBoxes: FloatingTextBox[];
  strokes: FreehandStroke[];
};

type ModalState =
  | {
      mode: "insert" | "edit";
      block: MathBlock;
    }
  | null;

type ConfirmResetState = {
  open: boolean;
} | null;

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
  itemType: "block" | "symbol" | "textBox" | "stroke";
  itemId: string;
  pointerOffsetX: number;
  pointerOffsetY: number;
  groupBlockPositions: Array<{ id: string; x: number; y: number }>;
  groupSymbolPositions: Array<{ id: string; x: number; y: number }>;
  groupTextBoxPositions: Array<{ id: string; x: number; y: number }>;
  groupStrokePositions: Array<{ id: string; x: number; y: number; points: FreehandPoint[] }>;
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

type PendingInsertTool =
  | { kind: "text" }
  | { kind: "structured"; toolId: StructuredTool }
  | { kind: "shortcut"; shortcutId: string }
  | null;

type InsertCursorPreview = {
  x: number;
  y: number;
  visible: boolean;
};

type ToolbarDragMeta = {
  offsetX: number;
  offsetY: number;
  previewNode: HTMLElement | null;
};

type EditingBlockState =
  | {
      blockId: string;
      field: string;
    }
  | null;

type CanvasQuickMenu =
  | {
      x: number;
      y: number;
      clickX: number;
      clickY: number;
    }
  | null;

type SnapGuides = {
  x: number | null;
  y: number | null;
};

type AdvancedTool = "select" | "move" | "note" | "draw" | "highlight" | null;

const STORAGE_KEY = "maths-facile-free-layout-v1";
const FLOATING_TEXTBOX_Y_OFFSET = 10;
const CANVAS_QUICK_MENU_OFFSET_X = 30;
const MAX_HISTORY_STEPS = 80;
const DEFAULT_CANVAS_FONT_SIZE_REM = 1.18;
const PAPER_LINE_STEP_REM = 2.95;
const CANVAS_GRID_LEFT_REM = 4.8;
const CANVAS_GRID_TOP_REM = PAPER_LINE_STEP_REM;
const MAX_SNAP_THRESHOLD_PX = 10;
const CANVAS_LINE_BASELINE_OFFSET_PX = 5;
const DEFAULT_ACTIVE_COLOR = "#1f2d3d";
const DEFAULT_HIGHLIGHT_TOOL_COLOR = "rgb(255 226 92)";
const HIGHLIGHT_STROKE_OPACITY = 0.4;
const HIGHLIGHT_STROKE_WIDTH = 10;
const MM_TO_PX = 96 / 25.4;
const SEYES_MAJOR_MM = 8;
const SEYES_MINOR_MM = 2;
const SEYES_MARGIN_CM = 4;

function mmToPx(mm: number) {
  return mm * MM_TO_PX;
}

function cmToPx(cm: number) {
  return mmToPx(cm * 10);
}

function getDefaultCanvasFontSize(sheetStyle: SheetStyle) {
  switch (sheetStyle) {
    case "seyes":
      return 1.02;
    case "small-grid":
      return 0.96;
    case "large-grid":
    case "blank":
    default:
      return DEFAULT_CANVAS_FONT_SIZE_REM;
  }
}

function getDefaultNoteFontSize(sheetStyle: SheetStyle) {
  return Math.max(0.84, Number((getDefaultCanvasFontSize(sheetStyle) - 0.18).toFixed(2)));
}

const DEFAULT_TEXT_HTML = "";

function createDefaultHeaderTextBoxes(sheetStyle: SheetStyle): FloatingTextBox[] {
  const metrics = getSheetMetrics(sheetStyle, 16);
  const fontSize = getDefaultCanvasFontSize(sheetStyle);
  const fieldHeight = Math.max(24, fontSize * 22);
  const firstBaseline = metrics.originY + metrics.snapYStep;
  const secondBaseline = metrics.originY + metrics.snapYStep * 2;
  const startX = (sheetStyle === "seyes" ? cmToPx(5.1) : mmToPx(14)) - 16;
  const dateX = mmToPx(145);

  return [
    {
      id: createId("text"),
      type: "textBox",
      variant: "default",
      text: "Nom et prénom :",
      color: DEFAULT_ACTIVE_COLOR,
      fontSize,
      fontWeight: 500,
      fontStyle: "normal",
      underline: false,
      highlightColor: null,
      x: Math.round(startX),
      y: Math.round(firstBaseline - fieldHeight + 5),
      width: getTextBoxWidth("Nom et prénom :")
    },
    {
      id: createId("text"),
      type: "textBox",
      variant: "default",
      text: "Classe :",
      color: DEFAULT_ACTIVE_COLOR,
      fontSize,
      fontWeight: 500,
      fontStyle: "normal",
      underline: false,
      highlightColor: null,
      x: Math.round(startX),
      y: Math.round(secondBaseline - fieldHeight + 5),
      width: getTextBoxWidth("Classe :")
    },
    {
      id: createId("text"),
      type: "textBox",
      variant: "default",
      text: "Date :",
      color: DEFAULT_ACTIVE_COLOR,
      fontSize,
      fontWeight: 500,
      fontStyle: "normal",
      underline: false,
      highlightColor: null,
      x: Math.round(dateX),
      y: Math.round(secondBaseline - fieldHeight + 5),
      width: getTextBoxWidth("Date :")
    }
  ];
}

function createDefaultState(sheetStyle: SheetStyle = "seyes"): WriterState {
  return {
    title: "Mon devoir de maths",
    mode: "college",
    sheetStyle,
    activeColor: DEFAULT_ACTIVE_COLOR,
    activeHighlightColor: "rgba(255, 226, 92, 0.58)",
    textHtml: DEFAULT_TEXT_HTML,
    blocks: [],
    symbols: [],
    textBoxes: createDefaultHeaderTextBoxes(sheetStyle),
    strokes: []
  };
}

const COLOR_OPTIONS = [
  { id: "ink", label: "Encre", value: "#1f2d3d" },
  { id: "orange", label: "Orange", value: "#d56f3c" },
  { id: "blue", label: "Bleu", value: "#2169b3" },
  { id: "green", label: "Vert", value: "#2f8f57" },
  { id: "pink", label: "Rose", value: "#b54d7a" }
] as const;

const HIGHLIGHT_OPTIONS = [
  { id: "yellow", label: "Jaune", value: "rgb(255 226 92)" },
  { id: "green", label: "Vert", value: "rgb(144 219 171)" },
  { id: "blue", label: "Bleu", value: "rgb(160 208 255)" },
  { id: "pink", label: "Rose", value: "rgb(255 184 210)" }
] as const;

const SHEET_STYLE_OPTIONS = [
  { id: "seyes" as const, label: "Lignes Seyes" },
  { id: "large-grid" as const, label: "Grands carreaux" },
  { id: "small-grid" as const, label: "Petits carreaux" },
  { id: "blank" as const, label: "Feuille blanche" }
] as const;

const STRUCTURED_TOOLS = [
  { id: "fraction" as const, label: "Fraction posée", hint: "Numérateur au-dessus, dénominateur en dessous", modes: ["college", "lycee"] as StudyMode[] },
  { id: "addition" as const, label: "Addition posée", hint: "Deux termes alignés et un résultat", modes: ["college", "lycee"] as StudyMode[] },
  { id: "subtraction" as const, label: "Soustraction posée", hint: "Deux termes alignés et un résultat", modes: ["college", "lycee"] as StudyMode[] },
  { id: "multiplication" as const, label: "Multiplication posée", hint: "Deux facteurs alignés et un résultat", modes: ["college", "lycee"] as StudyMode[] },
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
      { id: "lt", label: "<", hint: "Inférieur à", content: " < ", modes: ["college", "lycee"] },
      { id: "gt", label: ">", hint: "Supérieur à", content: " > ", modes: ["college", "lycee"] },
      { id: "leq", label: "≤", hint: "Inférieur ou égal", content: " ≤ ", modes: ["college", "lycee"] },
      { id: "geq", label: "≥", hint: "Supérieur ou égal", content: " ≥ ", modes: ["college", "lycee"] },
      { id: "minus", label: "-", hint: "Soustraire", content: " - ", modes: ["college", "lycee"] },
      { id: "times", label: "×", hint: "Multiplier", content: " × ", modes: ["college", "lycee"] },
      { id: "div", label: "÷", hint: "Diviser", content: " ÷ ", modes: ["college", "lycee"] },
      { id: "lbracket", label: "[", hint: "Crochet ouvrant", content: "[", modes: ["college", "lycee"] },
      { id: "rbracket", label: "]", hint: "Crochet fermant", content: "]", modes: ["college", "lycee"] },
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

function renderShortcutGlyph(shortcut: Pick<InlineShortcutItem, "id" | "label">) {
  return (
    <span className={`math-shortcut-glyph ${shortcut.id === "parallel" ? "math-shortcut-glyph-parallel" : ""}`}>
      {shortcut.label}
    </span>
  );
}

function renderStructuredToolGlyph(toolId: StructuredTool) {
  if (toolId === "fraction") {
    return "a/b";
  }

  if (toolId === "addition") {
    return "+";
  }

  if (toolId === "subtraction") {
    return "-";
  }

  if (toolId === "multiplication") {
    return "×";
  }

  if (toolId === "division") {
    return "÷";
  }

  if (toolId === "power") {
    return "x²";
  }

  return "√";
}

function getTextBoxWidth(text: string) {
  const visibleText = text.trim();
  return Math.max(36, Math.min(920, visibleText.length * 14 + 12));
}

function getSheetMetrics(sheetStyle: SheetStyle, rem: number) {
  const seyesStep = mmToPx(SEYES_MAJOR_MM);
  const seyesMinorStep = mmToPx(SEYES_MINOR_MM);

  switch (sheetStyle) {
    case "large-grid":
      return {
        snapXStep: seyesStep,
        snapYStep: seyesStep,
        originX: seyesStep,
        originY: seyesStep,
        baselineOffset: CANVAS_LINE_BASELINE_OFFSET_PX,
        snapX: true,
        snapY: true
      };
    case "small-grid":
      return {
        snapXStep: seyesMinorStep * 2,
        snapYStep: seyesMinorStep * 2,
        originX: seyesMinorStep * 2,
        originY: seyesMinorStep * 2,
        baselineOffset: CANVAS_LINE_BASELINE_OFFSET_PX,
        snapX: true,
        snapY: true
      };
    case "blank":
      return {
        snapXStep: seyesStep / 2,
        snapYStep: seyesStep,
        originX: CANVAS_GRID_LEFT_REM * rem,
        originY: seyesStep,
        baselineOffset: CANVAS_LINE_BASELINE_OFFSET_PX,
        snapX: true,
        snapY: true
      };
    case "seyes":
    default:
      return {
        snapXStep: seyesStep,
        snapYStep: seyesStep,
        originX: seyesStep,
        originY: seyesStep,
        baselineOffset: CANVAS_LINE_BASELINE_OFFSET_PX,
        snapX: true,
        snapY: true
      };
  }
}

function getStrokeBounds(points: FreehandPoint[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
    height: Math.max(1, Math.max(...ys) - Math.min(...ys))
  };
}

function createStrokePath(points: FreehandPoint[]): string {
  if (points.length === 0) {
    return "";
  }

  const [firstPoint, ...otherPoints] = points;
  return `M ${firstPoint.x} ${firstPoint.y} ${otherPoints.map((point) => `L ${point.x} ${point.y}`).join(" ")}`;
}

function getPointDistance(left: FreehandPoint, right: FreehandPoint): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

function getStrokeLength(points: FreehandPoint[]): number {
  let length = 0;

  for (let index = 1; index < points.length; index += 1) {
    length += getPointDistance(points[index - 1], points[index]);
  }

  return length;
}

function getDistanceToSegment(point: FreehandPoint, start: FreehandPoint, end: FreehandPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const squaredLength = dx * dx + dy * dy;

  if (squaredLength === 0) {
    return getPointDistance(point, start);
  }

  const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / squaredLength;
  const clampedProjection = Math.max(0, Math.min(1, projection));

  return Math.hypot(point.x - (start.x + clampedProjection * dx), point.y - (start.y + clampedProjection * dy));
}

function simplifyStrokePoints(points: FreehandPoint[], epsilon: number): FreehandPoint[] {
  if (points.length <= 2) {
    return points;
  }

  let maxDistance = 0;
  let splitIndex = 0;

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = getDistanceToSegment(points[index], points[0], points[points.length - 1]);

    if (distance > maxDistance) {
      maxDistance = distance;
      splitIndex = index;
    }
  }

  if (maxDistance <= epsilon) {
    return [points[0], points[points.length - 1]];
  }

  const left = simplifyStrokePoints(points.slice(0, splitIndex + 1), epsilon);
  const right = simplifyStrokePoints(points.slice(splitIndex), epsilon);
  return [...left.slice(0, -1), ...right];
}

function getPolygonArea(points: FreehandPoint[]): number {
  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area) / 2;
}

function isNearRightAngle(previous: FreehandPoint, current: FreehandPoint, next: FreehandPoint): boolean {
  const leftVector = { x: previous.x - current.x, y: previous.y - current.y };
  const rightVector = { x: next.x - current.x, y: next.y - current.y };
  const leftLength = Math.hypot(leftVector.x, leftVector.y);
  const rightLength = Math.hypot(rightVector.x, rightVector.y);

  if (leftLength === 0 || rightLength === 0) {
    return false;
  }

  const dot = (leftVector.x * rightVector.x + leftVector.y * rightVector.y) / (leftLength * rightLength);
  return Math.abs(dot) < 0.34;
}

function createCirclePoints(centerX: number, centerY: number, radius: number, segments = 28): FreehandPoint[] {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / segments;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  });
}

function normalizeStrokeShape(points: FreehandPoint[]): FreehandPoint[] {
  if (points.length < 2) {
    return points;
  }

  const bounds = getStrokeBounds(points);
  const diagonal = Math.hypot(bounds.width, bounds.height);
  const totalLength = getStrokeLength(points);
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const endDistance = getPointDistance(startPoint, endPoint);
  const isClosed = diagonal > 20 && endDistance <= Math.max(14, diagonal * 0.2);

  if (totalLength > 28 && endDistance / Math.max(totalLength, 1) > 0.9) {
    const maxDeviation = points.reduce((max, point) => Math.max(max, getDistanceToSegment(point, startPoint, endPoint)), 0);

    if (maxDeviation <= Math.max(6, diagonal * 0.08)) {
      return [startPoint, endPoint];
    }
  }

  if (!isClosed) {
    return points;
  }

  const simplified = simplifyStrokePoints(points, Math.max(10, diagonal * 0.045));
  const polygon = simplified.length > 2 ? simplified.slice(0, -1) : simplified;

  if (polygon.length === 3 && getPolygonArea(polygon) > 80) {
    return [...polygon, polygon[0]];
  }

  if (polygon.length === 4 && getPolygonArea(polygon) > 120) {
    const isRectangle = polygon.every((point, index) =>
      isNearRightAngle(polygon[(index + polygon.length - 1) % polygon.length], point, polygon[(index + 1) % polygon.length])
    );

    if (isRectangle) {
      return [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y }
      ];
    }

    return [...polygon, polygon[0]];
  }

  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const radii = points.map((point) => Math.hypot(point.x - centerX, point.y - centerY));
  const averageRadius = radii.reduce((sum, value) => sum + value, 0) / radii.length;
  const radiusVariance = radii.reduce((sum, value) => sum + Math.abs(value - averageRadius), 0) / radii.length;
  const aspectRatio = bounds.width / Math.max(1, bounds.height);
  const looksPolygonal = polygon.length >= 3 && polygon.length <= 5;

  if (
    !looksPolygonal &&
    averageRadius > 12 &&
    aspectRatio > 0.72 &&
    aspectRatio < 1.38 &&
    radiusVariance / Math.max(averageRadius, 1) < 0.2
  ) {
    return createCirclePoints(centerX, centerY, averageRadius);
  }

  return points;
}

function cloneWriterState(value: WriterState) {
  return JSON.parse(JSON.stringify(value)) as WriterState;
}

function areWriterStatesEqual(left: WriterState, right: WriterState) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function getGridDimensions(count: number, columns: number) {
  return {
    columns,
    rows: Math.ceil(count / columns)
  };
}

function getRemPixels() {
  if (typeof window === "undefined") {
    return 16;
  }

  return Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
}

function parseStoredState(raw: string): WriterState | null {
  try {
    const parsed = JSON.parse(raw) as WriterState;
    const parsedSheetStyle =
      (parsed as { sheetStyle?: unknown }).sheetStyle === "large-grid" ||
      (parsed as { sheetStyle?: unknown }).sheetStyle === "small-grid" ||
      (parsed as { sheetStyle?: unknown }).sheetStyle === "blank" ||
      (parsed as { sheetStyle?: unknown }).sheetStyle === "seyes"
        ? (parsed as { sheetStyle: SheetStyle }).sheetStyle
        : createDefaultState().sheetStyle;
    const defaultState = createDefaultState(parsedSheetStyle);
    const defaultFontSize = getDefaultCanvasFontSize(parsedSheetStyle);
    const defaultNoteFontSize = getDefaultNoteFontSize(parsedSheetStyle);

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
      sheetStyle: parsedSheetStyle,
      activeColor: typeof (parsed as { activeColor?: unknown }).activeColor === "string" ? parsed.activeColor : DEFAULT_ACTIVE_COLOR,
      activeHighlightColor:
        typeof (parsed as { activeHighlightColor?: unknown }).activeHighlightColor === "string"
          ? parsed.activeHighlightColor
          : defaultState.activeHighlightColor,
      blocks: parsed.blocks.map((block) => ({
        ...block,
        ...(block.type === "division"
          ? {
              work:
                typeof (block as { work?: unknown }).work === "string"
                  ? (block as { work: string }).work
                  : [(block as { dividend?: string }).dividend ?? "", (block as { remainder?: string }).remainder ?? ""]
                      .filter((line) => typeof line === "string" && line.trim().length > 0)
                      .join("\n"),
              struckCells: normalizeStruckCells((block as { struckCells?: unknown }).struckCells)
            }
          : {}),
        ...(block.type === "addition" || block.type === "subtraction" || block.type === "multiplication"
          ? {
              carryTop:
                normalizeArithmeticCarryCells(
                  typeof (block as { carryTop?: unknown }).carryTop !== "undefined"
                    ? (block as { carryTop?: unknown }).carryTop
                    : (block as { carry?: unknown }).carry
                ),
              carryBottom: normalizeArithmeticCarryCells((block as { carryBottom?: unknown }).carryBottom),
              carryResult: normalizeArithmeticCarryCells((block as { carryResult?: unknown }).carryResult),
              struckCells: normalizeStruckCells((block as { struckCells?: unknown }).struckCells)
            }
          : {}),
        color: typeof (block as { color?: unknown }).color === "string" ? (block as { color: string }).color : DEFAULT_ACTIVE_COLOR,
        fontSize: typeof (block as { fontSize?: unknown }).fontSize === "number" ? (block as { fontSize: number }).fontSize : defaultFontSize,
        fontWeight: typeof (block as { fontWeight?: unknown }).fontWeight === "number" ? (block as { fontWeight: number }).fontWeight : 500,
        fontStyle: (block as { fontStyle?: unknown }).fontStyle === "italic" ? "italic" : "normal",
        underline: (block as { underline?: unknown }).underline === true,
        highlightColor: typeof (block as { highlightColor?: unknown }).highlightColor === "string" ? (block as { highlightColor: string }).highlightColor : null
      })),
      symbols: Array.isArray(parsed.symbols)
        ? parsed.symbols.map((symbol) => ({
            ...symbol,
            color: typeof symbol.color === "string" ? symbol.color : DEFAULT_ACTIVE_COLOR,
            fontSize: typeof symbol.fontSize === "number" ? symbol.fontSize : defaultFontSize,
            fontWeight: typeof (symbol as { fontWeight?: unknown }).fontWeight === "number" ? (symbol as { fontWeight: number }).fontWeight : 500,
            fontStyle: (symbol as { fontStyle?: unknown }).fontStyle === "italic" ? "italic" : "normal",
            underline: (symbol as { underline?: unknown }).underline === true,
            highlightColor: typeof (symbol as { highlightColor?: unknown }).highlightColor === "string" ? (symbol as { highlightColor: string }).highlightColor : null
          }))
        : [],
      textBoxes: Array.isArray((parsed as { textBoxes?: unknown }).textBoxes)
        ? (parsed as { textBoxes: FloatingTextBox[] }).textBoxes.map((textBox) => ({
            ...textBox,
            color: typeof textBox.color === "string" ? textBox.color : DEFAULT_ACTIVE_COLOR,
            fontSize: typeof textBox.fontSize === "number" ? textBox.fontSize : textBox.variant === "note" ? defaultNoteFontSize : defaultFontSize,
            fontWeight: typeof (textBox as { fontWeight?: unknown }).fontWeight === "number" ? (textBox as { fontWeight: number }).fontWeight : 500,
            fontStyle: (textBox as { fontStyle?: unknown }).fontStyle === "italic" ? "italic" : "normal",
            underline: (textBox as { underline?: unknown }).underline === true,
            highlightColor: typeof (textBox as { highlightColor?: unknown }).highlightColor === "string" ? (textBox as { highlightColor: string }).highlightColor : null
          }))
        : [],
      strokes: Array.isArray((parsed as { strokes?: unknown }).strokes)
        ? (parsed as { strokes: FreehandStroke[] }).strokes.filter(
            (stroke) =>
              Boolean(stroke) &&
              typeof stroke.id === "string" &&
              Array.isArray(stroke.points) &&
              stroke.points.every((point) => point && typeof point.x === "number" && typeof point.y === "number")
          ).map((stroke) => ({
            ...stroke,
            color: typeof stroke.color === "string" ? stroke.color : DEFAULT_ACTIVE_COLOR,
            width: typeof stroke.width === "number" ? stroke.width : 2.6,
            opacity: typeof (stroke as { opacity?: unknown }).opacity === "number" ? (stroke as { opacity: number }).opacity : 1
          }))
        : []
    };
  } catch {
    return null;
  }
}

function getBlockTitle(block: MathBlock) {
  switch (block.type) {
    case "fraction":
      return "Fraction posée";
    case "addition":
      return "Addition posée";
    case "subtraction":
      return "Soustraction posée";
    case "multiplication":
      return "Multiplication posée";
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
    case "addition":
    case "subtraction":
    case "multiplication":
      return 250;
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

function getDivisionWorkLines(work: string) {
  const lines = work.split("\n").map((line) => line.replace(/\s+$/g, ""));
  return lines.length > 0 ? lines : [""];
}

function getDivisionQuotientDigits(quotient: string) {
  const digitsOnly = quotient.replace(/\D+/g, "");
  return Math.max(1, digitsOnly.length);
}

function normalizeDivisionDecimalInput(value: string) {
  const normalized = value.replace(/\./g, ",").replace(/[^0-9,]/g, "");
  const firstCommaIndex = normalized.indexOf(",");

  if (firstCommaIndex === -1) {
    return normalized;
  }

  return `${normalized.slice(0, firstCommaIndex + 1)}${normalized.slice(firstCommaIndex + 1).replace(/,/g, "")}`;
}

function getDivisionMaxWorkLines(quotient: string) {
  return Math.max(8, getDivisionQuotientDigits(quotient) * 2 + 1);
}

function getDivisionVisibleWorkLines(work: string, quotient: string) {
  const rawLines = getDivisionWorkLines(work);
  const maxLines = getDivisionMaxWorkLines(quotient);
  let completedPrefix = 0;

  while (completedPrefix < maxLines && (rawLines[completedPrefix] ?? "").trim().length > 0) {
    completedPrefix += 1;
  }

  const visibleCount = Math.min(maxLines, Math.max(1, completedPrefix + 1));
  return Array.from({ length: visibleCount }, (_, index) => rawLines[index] ?? "");
}

function setDivisionWorkLine(work: string, lineIndex: number, value: string) {
  const lines = getDivisionWorkLines(work);

  while (lines.length <= lineIndex) {
    lines.push("");
  }

  lines[lineIndex] = value;

  while (lines.length > 1 && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }

  return lines.join("\n");
}

function getDivisionCellValue(value: string, index: number) {
  return Array.from(value)[index] ?? "";
}

function setDivisionCellValue(value: string, index: number, nextCharacter: string) {
  const characters = Array.from(value);

  while (characters.length <= index) {
    characters.push("");
  }

  characters[index] = nextCharacter;

  while (characters.length > 0 && characters[characters.length - 1] === "") {
    characters.pop();
  }

  return characters.join("");
}

function setDivisionCellValues(value: string, startIndex: number, nextCharacters: string[], maxColumns: number) {
  const characters = Array.from(value);
  let insertedCount = 0;

  nextCharacters.forEach((nextCharacter, offset) => {
    const targetIndex = startIndex + offset;

    if (targetIndex >= maxColumns) {
      return;
    }

    while (characters.length <= targetIndex) {
      characters.push("");
    }

    characters[targetIndex] = nextCharacter;
    insertedCount += 1;
  });

  while (characters.length > 0 && characters[characters.length - 1] === "") {
    characters.pop();
  }

  return {
    value: characters.join(""),
    insertedCount
  };
}

function getDivisionLeftColumns(block: DivisionBlock) {
  const workLines = getDivisionWorkLines(block.work);
  return Math.max(3, block.dividend.trim().length, ...workLines.map((line) => line.length));
}

function getDivisionDivisorColumns(block: DivisionBlock) {
  return Math.max(1, block.divisor.trim().length);
}

function getDivisionQuotientColumns(block: DivisionBlock) {
  return Math.max(1, block.quotient.trim().length);
}

function isColumnArithmeticBlock(block: MathBlock): block is AdditionBlock | SubtractionBlock | MultiplicationBlock {
  return block.type === "addition" || block.type === "subtraction" || block.type === "multiplication";
}

function isCellStrikeBlock(block: MathBlock): block is AdditionBlock | SubtractionBlock | MultiplicationBlock | DivisionBlock {
  return isColumnArithmeticBlock(block) || block.type === "division";
}

function getArithmeticOperator(block: AdditionBlock | SubtractionBlock | MultiplicationBlock) {
  return block.type === "addition" ? "+" : block.type === "subtraction" ? "-" : "×";
}

type ArithmeticLineField = "top" | "bottom" | "result";
type ArithmeticCarryField = "carryTop" | "carryBottom" | "carryResult";

function getCarryFieldForArithmeticLine(field: ArithmeticLineField): ArithmeticCarryField {
  if (field === "top") {
    return "carryTop";
  }

  if (field === "bottom") {
    return "carryBottom";
  }

  return "carryResult";
}

function getArithmeticLineForCarryField(field: ArithmeticCarryField): ArithmeticLineField {
  if (field === "carryTop") {
    return "top";
  }

  if (field === "carryBottom") {
    return "bottom";
  }

  return "result";
}

function normalizeArithmeticCarryCells(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item.slice(-1) : "")).filter((item, index, array) => item !== "" || index < array.length - 1);
  }

  if (typeof value === "string") {
    return Array.from(value.replace(/\s+/g, "")).reverse().map((item) => item.slice(-1));
  }

  return [] as string[];
}

function normalizeStruckCells(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0)));
}

function getStruckCellKey(field: string, cellIndex: number) {
  return `${field}::${cellIndex}`;
}

function hasStruckCell(struckCells: string[], field: string, cellIndex: number) {
  return struckCells.includes(getStruckCellKey(field, cellIndex));
}

function toggleStruckCell(struckCells: string[], field: string, cellIndex: number) {
  const key = getStruckCellKey(field, cellIndex);

  if (struckCells.includes(key)) {
    return struckCells.filter((item) => item !== key);
  }

  return [...struckCells, key];
}

function getStrokeStyleForTool(tool: AdvancedTool, activeColor: string, activeHighlightColor: string | null) {
  if (tool === "highlight") {
    return {
      color: activeHighlightColor || DEFAULT_HIGHLIGHT_TOOL_COLOR,
      width: HIGHLIGHT_STROKE_WIDTH,
      opacity: HIGHLIGHT_STROKE_OPACITY
    };
  }

  return {
    color: activeColor,
    width: 2.6,
    opacity: 1
  };
}

function hasArithmeticCarryCells(cells: string[]) {
  return cells.some((cell) => cell.trim().length > 0);
}

function getArithmeticCarryCells(block: AdditionBlock | SubtractionBlock | MultiplicationBlock, line: ArithmeticLineField) {
  return block[getCarryFieldForArithmeticLine(line)];
}

function getArithmeticCarryCell(cells: string[], offsetFromRight: number) {
  return cells[offsetFromRight] ?? "";
}

function getLastFilledArithmeticCarryOffset(cells: string[]) {
  for (let index = cells.length - 1; index >= 0; index -= 1) {
    if ((cells[index] ?? "").trim().length > 0) {
      return index;
    }
  }

  return null;
}

function setArithmeticCarryCell(cells: string[], offsetFromRight: number, nextValue: string) {
  const nextCells = [...cells];

  while (nextCells.length <= offsetFromRight) {
    nextCells.push("");
  }

  nextCells[offsetFromRight] = nextValue.slice(-1);

  while (nextCells.length > 0 && nextCells[nextCells.length - 1] === "") {
    nextCells.pop();
  }

  return nextCells;
}

function getColumnArithmeticColumns(block: AdditionBlock | SubtractionBlock | MultiplicationBlock) {
  return Math.max(
    3,
    block.top.trim().length,
    block.bottom.trim().length,
    block.result.trim().length,
    block.carryTop.length,
    block.carryBottom.length,
    block.carryResult.length
  );
}

function getAlignedCaretCellIndex(value: string, columns: number, align: "start" | "end", caretPosition: number) {
  const characters = Array.from(value);
  const offset = align === "end" ? Math.max(0, columns - characters.length) : 0;
  return Math.max(0, Math.min(columns - 1, offset + caretPosition));
}

type DivisionCellRowOptions = {
  field?: string;
  struckCells?: string[];
  onCellToggle?: (cellIndex: number, cellValue: string) => void;
};

function renderDivisionCellRow(
  value: string,
  columns: number,
  className: string,
  align: "start" | "end" = "start",
  targetCellIndex?: number,
  options?: DivisionCellRowOptions
) {
  const characters = Array.from(value);
  const offset = align === "end" ? Math.max(0, columns - characters.length) : 0;

  return (
    <div className={`division-cell-row ${className}`} style={{ ["--division-columns" as string]: columns } as ReactCSSProperties}>
      {Array.from({ length: columns }).map((_, index) => {
        const cellValue = characters[index - offset] ?? "";
        const cellIndex = align === "end" ? columns - 1 - index : index;
        const isStruck = options?.field ? hasStruckCell(options.struckCells ?? [], options.field, cellIndex) : false;
        const cellClassName = `division-cell ${targetCellIndex === index ? "division-cell-target" : ""} ${isStruck ? "division-cell-struck" : ""} ${options?.onCellToggle ? "division-cell-button" : ""}`;

        if (!options?.onCellToggle) {
          return (
            <span key={index} className={cellClassName}>
              {cellValue}
            </span>
          );
        }

        return (
          <button
            key={index}
            type="button"
            className={cellClassName}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              options.onCellToggle?.(cellIndex, cellValue);
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              event.stopPropagation();
              options.onCellToggle?.(cellIndex, cellValue);
            }}
          >
            {cellValue}
          </button>
        );
      })}
    </div>
  );
}

function renderArithmeticCarryRow(
  cells: string[],
  columns: number,
  className: string,
  targetCellIndex?: number,
  options?: DivisionCellRowOptions
) {
  return (
    <div className={`division-cell-row ${className}`} style={{ ["--division-columns" as string]: columns } as ReactCSSProperties}>
      {Array.from({ length: columns }).map((_, index) => {
        const offsetFromRight = columns - 1 - index;
        const cellValue = getArithmeticCarryCell(cells, offsetFromRight);
        const isStruck = options?.field ? hasStruckCell(options.struckCells ?? [], options.field, offsetFromRight) : false;
        const cellClassName = `division-cell addition-carry-cell ${targetCellIndex === index ? "division-cell-target" : ""} ${isStruck ? "division-cell-struck" : ""} ${options?.onCellToggle ? "division-cell-button" : ""}`;

        if (!options?.onCellToggle) {
          return (
            <span key={index} className={cellClassName}>
              {cellValue}
            </span>
          );
        }

        return (
          <button
            key={index}
            type="button"
            className={cellClassName}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              options.onCellToggle?.(offsetFromRight, cellValue);
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              event.stopPropagation();
              options.onCellToggle?.(offsetFromRight, cellValue);
            }}
          >
            {cellValue}
          </button>
        );
      })}
    </div>
  );
}

function renderColumnArithmeticPreview(block: AdditionBlock | SubtractionBlock | MultiplicationBlock) {
  const columns = getColumnArithmeticColumns(block);
  const operator = getArithmeticOperator(block);
  const renderCarryOverlay = (line: ArithmeticLineField) => {
    const carryCells = getArithmeticCarryCells(block, line);
    const carryField = getCarryFieldForArithmeticLine(line);

    if (!hasArithmeticCarryCells(carryCells)) {
      return null;
    }

    return (
      <div className="addition-line addition-line-carry">
        <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
        {renderArithmeticCarryRow(carryCells, columns, "addition-row addition-carry-row addition-row-preview", undefined, {
          field: carryField,
          struckCells: block.struckCells
        })}
      </div>
    );
  };
  const topCarryOverlay = renderCarryOverlay("top");
  const bottomCarryOverlay = renderCarryOverlay("bottom");
  const resultCarryOverlay = renderCarryOverlay("result");

  return (
    <div className="math-layout addition-layout">
      <div className="addition-preview">
        <div className={`addition-line-stack ${topCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
          {topCarryOverlay ? <div className="addition-line-carry-overlay">{topCarryOverlay}</div> : null}
          <div className="addition-line">
            <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
            {renderDivisionCellRow(block.top, columns, "addition-row addition-row-preview", "end", undefined, { field: "top", struckCells: block.struckCells })}
          </div>
        </div>
        <div className={`addition-line-stack ${bottomCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
          {bottomCarryOverlay ? <div className="addition-line-carry-overlay">{bottomCarryOverlay}</div> : null}
          <div className="addition-line">
            <span className="addition-sign">{operator}</span>
            {renderDivisionCellRow(block.bottom, columns, "addition-row addition-row-operation addition-row-preview", "end", undefined, { field: "bottom", struckCells: block.struckCells })}
          </div>
        </div>
        <div className={`addition-line-stack ${resultCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
          {resultCarryOverlay ? <div className="addition-line-carry-overlay">{resultCarryOverlay}</div> : null}
          <div className="addition-line">
            <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
            {renderDivisionCellRow(block.result, columns, "addition-row addition-row-result addition-row-preview", "end", undefined, { field: "result", struckCells: block.struckCells })}
          </div>
        </div>
      </div>
      {block.caption ? <p className="math-caption">{block.caption}</p> : null}
    </div>
  );
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
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  if (isColumnArithmeticBlock(block)) {
    return renderColumnArithmeticPreview(block);
  }

  if (block.type === "division") {
    const leftColumns = getDivisionLeftColumns(block);
    const divisorColumns = getDivisionDivisorColumns(block);
    const quotientColumns = getDivisionQuotientColumns(block);
    const workLines = getDivisionVisibleWorkLines(block.work, block.quotient);
    return (
      <div className="math-layout division-layout">
        <div className="division-preview">
          <div className="division-left-column">
            <div className="division-work-line division-work-line-head">
              <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />
              {renderDivisionCellRow(block.dividend, leftColumns, "division-dividend division-row-preview", "start", undefined, { field: "dividend", struckCells: block.struckCells })}
            </div>
            <div className="division-work-grid">
              {workLines.map((line, index) => (
                <div
                  key={index}
                  className={`division-work-line ${index % 2 === 0 ? "division-work-line-operation" : "division-work-line-result"} ${line.trim().length === 0 ? "division-work-line-pending" : ""}`}
                >
                  {index % 2 === 0 ? <span className="division-work-minus">-</span> : <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />}
                  {renderDivisionCellRow(line, leftColumns, "division-workpad division-row-preview", "start", undefined, { field: `work:${index}`, struckCells: block.struckCells })}
                </div>
              ))}
            </div>
          </div>
          <div className="division-right-column">
            {renderDivisionCellRow(block.divisor, divisorColumns, "division-divisor division-row-preview", "start", undefined, { field: "divisor", struckCells: block.struckCells })}
            {renderDivisionCellRow(block.quotient, quotientColumns, "division-quotient division-row-preview", "start", undefined, { field: "quotient", struckCells: block.struckCells })}
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
      {block.caption ? <p className="math-caption">{block.caption}</p> : null}
    </div>
  );
}

function getInlineStartField(type: StructuredTool) {
  switch (type) {
    case "fraction":
      return "numerator";
    case "addition":
    case "subtraction":
    case "multiplication":
      return "top";
    case "division":
      return "dividend";
    case "power":
      return "base";
    case "root":
      return "radicand";
    default:
      return "";
  }
}

function getInlineFieldSequence(type: StructuredTool) {
  switch (type) {
    case "fraction":
      return ["numerator", "denominator"];
    case "addition":
    case "subtraction":
    case "multiplication":
      return ["carryTop", "top", "carryBottom", "bottom", "carryResult", "result"];
    case "division":
      return ["dividend", "divisor", "quotient", "work"];
    case "power":
      return ["base", "exponent"];
    case "root":
      return ["radicand"];
    default:
      return [];
  }
}

function getNextInlineField(block: MathBlock, field: string) {
  const sequence = getInlineFieldSequence(block.type).filter((item) => {
    if (!isColumnArithmeticBlock(block)) {
      return true;
    }

    if (item === "carryTop") {
      return hasArithmeticCarryCells(block.carryTop) || field === "carryTop";
    }

    if (item === "carryBottom") {
      return hasArithmeticCarryCells(block.carryBottom) || field === "carryBottom";
    }

    if (item === "carryResult") {
      return hasArithmeticCarryCells(block.carryResult) || field === "carryResult";
    }

    return true;
  });
  const index = sequence.indexOf(field);
  return index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : null;
}

function getPreviousInlineField(block: MathBlock, field: string) {
  const sequence = getInlineFieldSequence(block.type).filter((item) => {
    if (!isColumnArithmeticBlock(block)) {
      return true;
    }

    if (item === "carryTop") {
      return hasArithmeticCarryCells(block.carryTop) || field === "carryTop";
    }

    if (item === "carryBottom") {
      return hasArithmeticCarryCells(block.carryBottom) || field === "carryBottom";
    }

    if (item === "carryResult") {
      return hasArithmeticCarryCells(block.carryResult) || field === "carryResult";
    }

    return true;
  });
  const index = sequence.indexOf(field);
  return index > 0 ? sequence[index - 1] : null;
}

function isBlockEmpty(block: MathBlock) {
  if (block.type === "fraction") {
    return !block.numerator.trim() && !block.denominator.trim();
  }

  if (block.type === "addition") {
    return !block.top.trim() && !block.bottom.trim() && !block.result.trim() && !hasArithmeticCarryCells(block.carryTop) && !hasArithmeticCarryCells(block.carryBottom) && !hasArithmeticCarryCells(block.carryResult);
  }

  if (block.type === "subtraction") {
    return !block.top.trim() && !block.bottom.trim() && !block.result.trim() && !hasArithmeticCarryCells(block.carryTop) && !hasArithmeticCarryCells(block.carryBottom) && !hasArithmeticCarryCells(block.carryResult);
  }

  if (block.type === "multiplication") {
    return !block.top.trim() && !block.bottom.trim() && !block.result.trim() && !hasArithmeticCarryCells(block.carryTop) && !hasArithmeticCarryCells(block.carryBottom) && !hasArithmeticCarryCells(block.carryResult);
  }

  if (block.type === "division") {
    return !block.work.trim() && !block.dividend.trim() && !block.divisor.trim() && !block.quotient.trim() && !block.remainder.trim();
  }

  if (block.type === "power") {
    return !block.base.trim() && !block.exponent.trim();
  }

  return !block.radicand.trim();
}

export function MathWorkbook() {
  const [state, setState] = useState<WriterState>(() => createDefaultState());
  const [historyPast, setHistoryPast] = useState<WriterState[]>([]);
  const [historyFuture, setHistoryFuture] = useState<WriterState[]>([]);
  const [openMenu, setOpenMenu] = useState<UtilityMenu>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [confirmResetState, setConfirmResetState] = useState<ConfirmResetState>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [selectedSymbolIds, setSelectedSymbolIds] = useState<string[]>([]);
  const [selectedTextBoxIds, setSelectedTextBoxIds] = useState<string[]>([]);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<EditingBlockState>(null);
  const [strikeModeBlockId, setStrikeModeBlockId] = useState<string | null>(null);
  const [numericFieldCaretPositions, setNumericFieldCaretPositions] = useState<Record<string, number>>({});
  const [advancedTool, setAdvancedTool] = useState<AdvancedTool>(null);
  const [pendingInsertTool, setPendingInsertTool] = useState<PendingInsertTool>(null);
  const [insertCursorPreview, setInsertCursorPreview] = useState<InsertCursorPreview>({ x: 0, y: 0, visible: false });
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
  const [draftStroke, setDraftStroke] = useState<FreehandPoint[] | null>(null);
  const [canvasQuickMenu, setCanvasQuickMenu] = useState<CanvasQuickMenu>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuides>({ x: null, y: null });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "png" | null>(null);
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
  const strokesRef = useRef<FreehandStroke[]>([]);
  const selectedBlockIdsRef = useRef<string[]>([]);
  const selectedSymbolIdsRef = useRef<string[]>([]);
  const selectedTextBoxIdsRef = useRef<string[]>([]);
  const selectedStrokeIdsRef = useRef<string[]>([]);
  const isDrawingStrokeRef = useRef(false);
  const draftStrokeRef = useRef<FreehandPoint[]>([]);
  const draftStrokeStyleRef = useRef<{ color: string; width: number; opacity: number }>({
    color: DEFAULT_ACTIVE_COLOR,
    width: 2.6,
    opacity: 1
  });
  const toolbarDragUntilRef = useRef(0);
  const toolbarDragMetaRef = useRef<ToolbarDragMeta | null>(null);
  const advancedToolRef = useRef<AdvancedTool>(null);
  const editingBlockRef = useRef<EditingBlockState>(null);
  const blockNodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const symbolNodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const textBoxNodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const strokeNodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const pendingFocusTextBoxIdRef = useRef<string | null>(null);
  const blockInputRefs = useRef<Record<string, Record<string, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const historyInitializedRef = useRef(false);
  const skipHistoryRef = useRef(false);
  const previousStateRef = useRef<WriterState>(cloneWriterState(createDefaultState()));
  const stateRef = useRef<WriterState>(cloneWriterState(createDefaultState()));
  const transientHistorySnapshotRef = useRef<WriterState | null>(null);
  const transientHistoryKindRef = useRef<"drag" | "edit" | null>(null);
  const suspendHistoryRef = useRef(false);

  const activeInlineShortcuts = useMemo(() => INLINE_SHORTCUT_GROUPS, []);

  const activeStructuredTools = useMemo(() => STRUCTURED_TOOLS, []);
  const textBoxShortcuts = useMemo(
    () =>
      activeInlineShortcuts.flatMap((group) =>
        group.items.map((item) => ({
          id: item.id,
          label: item.label,
          hint: item.hint,
          content: item.content.trimStart()
        }))
      ),
    [activeInlineShortcuts]
  );
  const commonInlineShortcuts = useMemo(() => activeInlineShortcuts.flatMap((group) => group.items).filter((item) => item.modes.includes("college")), [activeInlineShortcuts]);
  const visibleLyceeInlineShortcuts = useMemo(
    () => activeInlineShortcuts.flatMap((group) => group.items).filter((item) => item.modes.length === 1 && item.modes[0] === "lycee"),
    [activeInlineShortcuts]
  );
  const selectedBlockId = selectedBlockIds.length === 1 && selectedSymbolIds.length === 0 && selectedTextBoxIds.length === 0 && selectedStrokeIds.length === 0 ? selectedBlockIds[0] : null;
  const selectedSymbolId = selectedSymbolIds.length === 1 && selectedBlockIds.length === 0 && selectedTextBoxIds.length === 0 && selectedStrokeIds.length === 0 ? selectedSymbolIds[0] : null;
  const selectedTextBoxId = selectedTextBoxIds.length === 1 && selectedBlockIds.length === 0 && selectedSymbolIds.length === 0 && selectedStrokeIds.length === 0 ? selectedTextBoxIds[0] : null;
  const selectedStrokeId = selectedStrokeIds.length === 1 && selectedBlockIds.length === 0 && selectedSymbolIds.length === 0 && selectedTextBoxIds.length === 0 ? selectedStrokeIds[0] : null;
  const selectedCount = selectedBlockIds.length + selectedSymbolIds.length + selectedTextBoxIds.length + selectedStrokeIds.length;
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
  const selectedStroke = useMemo(
    () => state.strokes.find((stroke) => stroke.id === selectedStrokeId) ?? null,
    [selectedStrokeId, state.strokes]
  );
  const selectedHighlightColor = useMemo(() => {
    const selectedItems = [
      ...state.blocks.filter((block) => selectedBlockIds.includes(block.id)).map((block) => block.highlightColor ?? ""),
      ...state.symbols.filter((symbol) => selectedSymbolIds.includes(symbol.id)).map((symbol) => symbol.highlightColor ?? ""),
      ...state.textBoxes.filter((textBox) => selectedTextBoxIds.includes(textBox.id)).map((textBox) => textBox.highlightColor ?? "")
    ];

    if (selectedItems.length === 0) {
      return state.activeHighlightColor;
    }

    return selectedItems.every((value) => value === selectedItems[0]) ? selectedItems[0] || null : state.activeHighlightColor;
  }, [selectedBlockIds, selectedSymbolIds, selectedTextBoxIds, state.activeHighlightColor, state.blocks, state.symbols, state.textBoxes]);
  const multiSelectionMenuPosition = useMemo(() => {
    if (selectedCount <= 1 || isCanvasInteracting || selectionRect || !canvasRef.current) {
      return null;
    }

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const selectedNodes = [
      ...selectedBlockIds.map((id) => blockNodeRefs.current[id]),
      ...selectedSymbolIds.map((id) => symbolNodeRefs.current[id]),
      ...selectedTextBoxIds.map((id) => textBoxNodeRefs.current[id]),
      ...selectedStrokeIds.map((id) => strokeNodeRefs.current[id])
    ].filter((node): node is HTMLElement | SVGGElement => Boolean(node));

    if (selectedNodes.length === 0) {
      return null;
    }

    const bounds = selectedNodes.map((node) => node.getBoundingClientRect());
    const minLeft = Math.min(...bounds.map((rect) => rect.left - canvasBounds.left));
    const maxRight = Math.max(...bounds.map((rect) => rect.right - canvasBounds.left));
    const minTop = Math.min(...bounds.map((rect) => rect.top - canvasBounds.top));
    const centerX = (minLeft + maxRight) / 2;

    return {
      x: centerX,
      y: Math.max(18, minTop - 52)
    };
  }, [isCanvasInteracting, selectedBlockIds, selectedCount, selectedStrokeIds, selectedSymbolIds, selectedTextBoxIds, selectionRect, state.blocks, state.strokes, state.symbols, state.textBoxes]);
  const selectedTextBoxMenuPosition = useMemo(() => {
    if (!selectedTextBox || editingTextBoxId === selectedTextBox.id || selectedCount !== 1 || isCanvasInteracting || selectionRect || !canvasRef.current) {
      return null;
    }

    const node = textBoxNodeRefs.current[selectedTextBox.id];

    if (!node) {
      return null;
    }

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const rect = node.getBoundingClientRect();

    return {
      x: rect.left - canvasBounds.left + rect.width / 2 + 100,
      y: Math.max(18, rect.top - canvasBounds.top - 52)
    };
  }, [editingTextBoxId, isCanvasInteracting, selectedCount, selectedTextBox, selectionRect]);
  const pendingInsertLabel = useMemo(() => {
    if (!pendingInsertTool) {
      return "";
    }

    if (pendingInsertTool.kind === "text") {
      return "Texte";
    }

    if (pendingInsertTool.kind === "structured") {
      return STRUCTURED_TOOLS.find((tool) => tool.id === pendingInsertTool.toolId)?.label ?? "Bloc";
    }

    return findShortcutById(pendingInsertTool.shortcutId)?.hint ?? findShortcutById(pendingInsertTool.shortcutId)?.label ?? "Symbole";
  }, [pendingInsertTool, activeInlineShortcuts]);

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
    strokesRef.current = state.strokes;
  }, [state.blocks, state.strokes, state.symbols, state.textBoxes]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    advancedToolRef.current = advancedTool;
  }, [advancedTool]);

  useEffect(() => {
    editingBlockRef.current = editingBlock;
  }, [editingBlock]);

  useEffect(() => {
    if (!editingBlock) {
      setStrikeModeBlockId(null);
      return;
    }

    setStrikeModeBlockId((current) => (current && current !== editingBlock.blockId ? null : current));
  }, [editingBlock]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyboardTarget(event.target)) {
        return;
      }

      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (isModifierPressed && event.key.toLowerCase() === "z" && !event.altKey) {
        event.preventDefault();

        if (event.shiftKey) {
          redoHistory();
          return;
        }

        undoHistory();
        return;
      }

      if (isModifierPressed && event.key.toLowerCase() === "y" && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        redoHistory();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedCount > 0) {
        event.preventDefault();
        handleHeaderDelete();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedCount, historyPast.length, historyFuture.length, selectedBlock, selectedSymbol, selectedTextBox, selectedStroke]);

  useEffect(() => {
    if (pendingInsertTool) {
      setAdvancedTool(null);
      setCanvasQuickMenu(null);
      setOpenMenu(null);
      clearFloatingSelection();
      return;
    }

    setInsertCursorPreview((current) => (current.visible ? { ...current, visible: false } : current));
  }, [pendingInsertTool]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!historyInitializedRef.current) {
      previousStateRef.current = cloneWriterState(state);
      historyInitializedRef.current = true;
      return;
    }

    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      previousStateRef.current = cloneWriterState(state);
      return;
    }

    if (suspendHistoryRef.current) {
      return;
    }

    if (areWriterStatesEqual(previousStateRef.current, state)) {
      return;
    }

    const previousSnapshot = cloneWriterState(previousStateRef.current);
    previousStateRef.current = cloneWriterState(state);

    setHistoryPast((current) => [...current.slice(-(MAX_HISTORY_STEPS - 1)), previousSnapshot]);
    setHistoryFuture([]);
  }, [isHydrated, state]);

  useEffect(() => {
    selectedBlockIdsRef.current = selectedBlockIds;
    selectedSymbolIdsRef.current = selectedSymbolIds;
    selectedTextBoxIdsRef.current = selectedTextBoxIds;
    selectedStrokeIdsRef.current = selectedStrokeIds;
  }, [selectedBlockIds, selectedStrokeIds, selectedSymbolIds, selectedTextBoxIds]);

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
    if (!editingBlock) {
      return;
    }

    const block = blocksRef.current.find((item) => item.id === editingBlock.blockId);

    if (block && isColumnArithmeticBlock(block) && (editingBlock.field === "carryTop" || editingBlock.field === "carryBottom" || editingBlock.field === "carryResult")) {
      const carryField = editingBlock.field;
      const line = getArithmeticLineForCarryField(carryField);
      const existingOffset = getLastFilledArithmeticCarryOffset(block[carryField]);

      if (existingOffset !== null) {
        setEditingBlock({ blockId: block.id, field: `${carryField}:${existingOffset}` });
        return;
      }

      const columns = getColumnArithmeticColumns(block);
      const lineValue = block[line];
      const caretKey = `${block.id}:${line}`;
      const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(lineValue).length;
      const targetCellIndex = getAlignedCaretCellIndex(lineValue, columns, "end", caretPosition);
      const targetOffset = columns - 1 - targetCellIndex;

      setEditingBlock({ blockId: block.id, field: `${carryField}:${targetOffset}` });
      return;
    }

    const input = blockInputRefs.current[editingBlock.blockId]?.[editingBlock.field];

    if (!input) {
      return;
    }

    if (document.activeElement !== input) {
      input.focus();
    }

    const isArithmeticNumericField =
      block &&
      isColumnArithmeticBlock(block) &&
      (editingBlock.field === "top" || editingBlock.field === "bottom" || editingBlock.field === "result");
    const isDivisionNumericField =
      block &&
      block.type === "division" &&
      (editingBlock.field === "dividend" || editingBlock.field === "divisor" || editingBlock.field === "quotient");

    if (isArithmeticNumericField || isDivisionNumericField) {
      let numericValue = "";

      if (isArithmeticNumericField) {
        numericValue = block[editingBlock.field as ArithmeticLineField];
      } else if (isDivisionNumericField) {
        numericValue = block[editingBlock.field as "dividend" | "divisor" | "quotient"];
      }

      const caretKey = `${editingBlock.blockId}:${editingBlock.field}`;
      const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(numericValue).length;

      input.setSelectionRange(caretPosition, caretPosition);
      return;
    }

    if (document.activeElement === input) {
      return;
    }

    input.select();
  }, [editingBlock, numericFieldCaretPositions]);

  useEffect(() => {
    const element = editorRef.current;

    if (element && document.activeElement !== element && element.innerHTML !== state.textHtml) {
      element.innerHTML = state.textHtml;
    }
  }, [state.textHtml]);

  useEffect(() => {
    function handlePointerMove(clientX: number, clientY: number) {
      if (isDrawingStrokeRef.current) {
        const point = getCanvasPoint(clientX, clientY);
        const currentPoints = draftStrokeRef.current;
        const lastPoint = currentPoints[currentPoints.length - 1];

        if (!lastPoint || Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) >= 1.5) {
          const nextPoints = [...currentPoints, point];
          draftStrokeRef.current = nextPoints;
          setDraftStroke(nextPoints);
        }
        return;
      }

      if (!dragRef.current) {
        if (!pendingSelectionRef.current) {
          return;
        }

        const point = getCanvasPoint(clientX, clientY);
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
      const nextAnchorX = clientX - bounds.left - dragRef.current.pointerOffsetX;
      const nextAnchorY = clientY - bounds.top - dragRef.current.pointerOffsetY;
      const draggedNode =
        dragRef.current.itemType === "block"
          ? blockNodeRefs.current[dragRef.current.itemId]
          : dragRef.current.itemType === "symbol"
            ? symbolNodeRefs.current[dragRef.current.itemId]
            : dragRef.current.itemType === "textBox"
              ? textBoxNodeRefs.current[dragRef.current.itemId]
              : strokeNodeRefs.current[dragRef.current.itemId];
      const snappedAnchor = getCanvasPlacementPosition(nextAnchorX, nextAnchorY, bounds.width - 24, bounds.height - 24, "soft", {
        height: draggedNode?.getBoundingClientRect().height ?? 0,
        snapOffsetY: 5
      });
      setSnapGuides(snappedAnchor.guides);
      const deltaX = Math.round(snappedAnchor.x - dragRef.current.anchorX);
      const deltaY = Math.round(snappedAnchor.y - dragRef.current.anchorY);

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
        }),
        strokes: current.strokes.map((stroke) => {
          const dragged = dragRef.current?.groupStrokePositions.find((item) => item.id === stroke.id);

          if (!dragged) {
            return stroke;
          }

          return {
            ...stroke,
            points: dragged.points.map((point) => ({
              x: Math.max(18, Math.min(bounds.width - 24, point.x + deltaX)),
              y: Math.max(18, Math.min(bounds.height - 24, point.y + deltaY))
            }))
          };
        })
      }));
    }

    function handleMouseMove(event: MouseEvent) {
      handlePointerMove(event.clientX, event.clientY);
    }

    function handleTouchMove(event: TouchEvent) {
      if (!isDrawingStrokeRef.current && !pendingSelectionRef.current && !dragRef.current) {
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      event.preventDefault();
      handlePointerMove(touch.clientX, touch.clientY);
    }

    function handleMouseUp() {
      if (isDrawingStrokeRef.current) {
        const points = draftStrokeRef.current;
        const strokeStyle = draftStrokeStyleRef.current;

        isDrawingStrokeRef.current = false;
        draftStrokeRef.current = [];
        setDraftStroke(null);
        setIsCanvasInteracting(false);

        if (points.length >= 2) {
          const normalizedPoints = normalizeStrokeShape(points);

          setState((current) => ({
            ...current,
            strokes: [...current.strokes, { id: createId("stroke"), color: strokeStyle.color, width: strokeStyle.width, opacity: strokeStyle.opacity, points: normalizedPoints }]
          }));
          scheduleTransientHistoryCommit("edit");
        } else {
          commitTransientHistorySession("edit");
        }

        return;
      }

      const draggedSession = dragRef.current;

      if (pendingSelectionRef.current && !pendingSelectionRef.current.started) {
        if (advancedToolRef.current === "note") {
          createAnnotationTextBoxAt(pendingSelectionRef.current.originX, pendingSelectionRef.current.originY);
        } else if (
          advancedToolRef.current !== "move" &&
          advancedToolRef.current !== "select" &&
          advancedToolRef.current !== "draw" &&
          advancedToolRef.current !== "highlight"
        ) {
          openCanvasQuickMenuAtPoint(pendingSelectionRef.current.originX, pendingSelectionRef.current.originY);
        }
      }

      if (draggedSession) {
        commitTransientHistorySession("drag");
      }

      dragRef.current = null;
      pendingSelectionRef.current = null;
      setSelectionRect(null);
      setSnapGuides({ x: null, y: null });
      setIsCanvasInteracting(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      if (!canvasQuickMenu) {
        return;
      }

      const target = event.target as Node | null;
      const canvas = canvasRef.current;

      if (!canvas) {
        setCanvasQuickMenu(null);
        return;
      }

      const quickMenu = canvas.querySelector(".canvas-quick-menu");

      if (quickMenu?.contains(target)) {
        return;
      }

      setCanvasQuickMenu(null);
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [canvasQuickMenu]);

  function createBlock(type: StructuredTool) {
    const count = state.blocks.length;
    const defaultFontSize = getDefaultCanvasFontSize(state.sheetStyle);
    const position = {
      x: 80 + (count % 3) * 48,
      y: 140 + count * 34,
      width: getDefaultWidth(type)
    };

    if (type === "fraction") {
      return {
        id: createId("fraction"),
        type,
        numerator: "",
        denominator: "",
        simplified: "",
        caption: "",
        color: state.activeColor,
        fontSize: defaultFontSize,
        fontWeight: 500,
        fontStyle: "normal",
        underline: false,
        highlightColor: null,
        numeratorStrike: false,
        denominatorStrike: false,
        ...position
      } satisfies MathBlock;
    }

    if (type === "addition") {
      return {
        id: createId("addition"),
        type,
        top: "",
        bottom: "",
        result: "",
        carryTop: [],
        carryBottom: [],
        carryResult: [],
        struckCells: [],
        caption: "",
        color: state.activeColor,
        fontSize: defaultFontSize,
        fontWeight: 500,
        fontStyle: "normal",
        underline: false,
        highlightColor: null,
        ...position
      } satisfies MathBlock;
    }

    if (type === "subtraction") {
      return {
        id: createId("subtraction"),
        type,
        top: "",
        bottom: "",
        result: "",
        carryTop: [],
        carryBottom: [],
        carryResult: [],
        struckCells: [],
        caption: "",
        color: state.activeColor,
        fontSize: defaultFontSize,
        fontWeight: 500,
        fontStyle: "normal",
        underline: false,
        highlightColor: null,
        ...position
      } satisfies MathBlock;
    }

    if (type === "multiplication") {
      return {
        id: createId("multiplication"),
        type,
        top: "",
        bottom: "",
        result: "",
        carryTop: [],
        carryBottom: [],
        carryResult: [],
        struckCells: [],
        caption: "",
        color: state.activeColor,
        fontSize: defaultFontSize,
        fontWeight: 500,
        fontStyle: "normal",
        underline: false,
        highlightColor: null,
        ...position
      } satisfies MathBlock;
    }

    if (type === "division") {
      return {
        id: createId("division"),
        type,
        dividend: "",
        divisor: "",
        quotient: "",
        remainder: "",
        work: "",
        struckCells: [],
        caption: "",
        color: state.activeColor,
        fontSize: defaultFontSize,
        fontWeight: 500,
        fontStyle: "normal",
        underline: false,
        highlightColor: null,
        ...position
      } satisfies MathBlock;
    }

    if (type === "power") {
      return { id: createId("power"), type, base: "", exponent: "", result: "", caption: "", color: state.activeColor, fontSize: defaultFontSize, fontWeight: 500, fontStyle: "normal", underline: false, highlightColor: null, ...position } satisfies MathBlock;
    }

    return { id: createId("root"), type, radicand: "", result: "", caption: "", color: state.activeColor, fontSize: defaultFontSize, fontWeight: 500, fontStyle: "normal", underline: false, highlightColor: null, ...position } satisfies MathBlock;
  }

function createFloatingSymbol(shortcut: InlineShortcutItem, x: number, y: number) {
  const defaultFontSize = getDefaultCanvasFontSize(state.sheetStyle);
  return {
      id: createId("symbol"),
      type: "symbol",
      label: shortcut.label,
      content: shortcut.content.trim() || shortcut.label,
      x,
      y,
      color: state.activeColor,
      fontSize: defaultFontSize
      ,
      fontWeight: 500,
      fontStyle: "normal",
      underline: false,
      highlightColor: null
  } satisfies FloatingSymbol;
}

  function createFloatingTextBox(x: number, y: number, variant: "default" | "note" = "default") {
    const defaultFontSize = getDefaultCanvasFontSize(state.sheetStyle);
    const defaultNoteFontSize = getDefaultNoteFontSize(state.sheetStyle);
    return {
      id: createId("text"),
      type: "textBox",
      variant,
      text: "",
      color: state.activeColor,
      fontSize: variant === "note" ? defaultNoteFontSize : defaultFontSize,
      fontWeight: 500,
      fontStyle: "normal",
      underline: false,
      highlightColor: null,
      x,
      y: Math.max(18, y - FLOATING_TEXTBOX_Y_OFFSET),
      width: variant === "note" ? 72 : 100
    } satisfies FloatingTextBox;
  }

  function getCanvasDropPosition(clientX: number, clientY: number, offsetX = 0, offsetY = 0) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 24, y: 24, guides: { x: null, y: null } };
    }

    const bounds = canvas.getBoundingClientRect();

    return getCanvasPlacementPosition(clientX - bounds.left - offsetX, clientY - bounds.top - offsetY, bounds.width - 24, bounds.height - 24, "soft");
  }

  function getExactCanvasPlacementPosition(x: number, y: number, maxX: number, maxY: number) {
    return {
      x: Math.max(18, Math.min(maxX, Math.round(x))),
      y: Math.max(18, Math.min(maxY, Math.round(y))),
      guides: {
        x: null,
        y: null
      }
    };
  }

  function getCanvasPlacementPosition(
    x: number,
    y: number,
    maxX: number,
    maxY: number,
    mode: "soft" | "strict" = "soft",
    visualSize?: { height?: number; snapOffsetY?: number }
  ) {
    const rem = getRemPixels();
    const metrics = getSheetMetrics(stateRef.current.sheetStyle, rem);
    const horizontalStep = metrics.snapXStep;
    const verticalStep = metrics.snapYStep;
    const originX = metrics.originX;
    const originY = metrics.originY;
    const visualHeight = Math.max(0, visualSize?.height ?? 0);
    const snapOffsetY = visualSize?.snapOffsetY ?? 0;
    const clampedX = Math.max(18, Math.min(maxX, Math.round(x)));
    const clampedY = Math.max(18, Math.min(maxY, Math.round(y)));
    const snappedX = originX + Math.round((clampedX - originX) / horizontalStep) * horizontalStep;
    const anchorY = visualHeight > 0 ? clampedY + visualHeight + metrics.baselineOffset - snapOffsetY : clampedY + metrics.baselineOffset - snapOffsetY;
    const snappedY = originY + Math.round((anchorY - originY) / verticalStep) * verticalStep;
    const horizontalThreshold = Math.min(MAX_SNAP_THRESHOLD_PX, horizontalStep * 0.26);
    const verticalThreshold = Math.min(MAX_SNAP_THRESHOLD_PX, verticalStep * 0.22);
    const useSnapX = metrics.snapX && (mode === "strict" || Math.abs(clampedX - snappedX) <= horizontalThreshold);
    const useSnapY = metrics.snapY && (mode === "strict" || Math.abs(anchorY - snappedY) <= verticalThreshold);
    const nextX = useSnapX ? snappedX : clampedX;
    const nextY = useSnapY
      ? Math.max(18, Math.min(maxY, Math.round((visualHeight > 0 ? snappedY - visualHeight - metrics.baselineOffset + snapOffsetY : snappedY - metrics.baselineOffset + snapOffsetY))))
      : clampedY;

    return {
      x: Math.max(18, Math.min(maxX, Math.round(nextX))),
      y: Math.max(18, Math.min(maxY, Math.round(nextY))),
      guides: {
        x: useSnapX ? Math.max(18, Math.min(maxX, Math.round(snappedX))) : null,
        y: useSnapY ? Math.round(snappedY) : null
      }
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
    setSelectedStrokeIds([]);
  }

  function selectSingleBlock(blockId: string) {
    setSelectedBlockIds([blockId]);
    setSelectedSymbolIds([]);
    setSelectedTextBoxIds([]);
    setSelectedStrokeIds([]);
  }

  function selectSingleSymbol(symbolId: string) {
    setSelectedSymbolIds([symbolId]);
    setSelectedBlockIds([]);
    setSelectedTextBoxIds([]);
    setSelectedStrokeIds([]);
  }

  function selectSingleTextBox(textBoxId: string) {
    setSelectedTextBoxIds([textBoxId]);
    setSelectedBlockIds([]);
    setSelectedSymbolIds([]);
    setSelectedStrokeIds([]);
  }

  function selectSingleStroke(strokeId: string) {
    setSelectedStrokeIds([strokeId]);
    setSelectedBlockIds([]);
    setSelectedSymbolIds([]);
    setSelectedTextBoxIds([]);
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
    const nextStrokeIds = strokesRef.current
      .filter((stroke) => {
        const node = strokeNodeRefs.current[stroke.id];

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
      .map((stroke) => stroke.id);

    setSelectedBlockIds(nextBlockIds);
    setSelectedSymbolIds(nextSymbolIds);
    setSelectedTextBoxIds(nextTextBoxIds);
    setSelectedStrokeIds(nextStrokeIds);
  }

  function beginAreaSelection(clientX: number, clientY: number) {
    const point = getCanvasPoint(clientX, clientY);
    pendingSelectionRef.current = { originX: point.x, originY: point.y, started: false };
    setSelectionRect(null);
    setIsCanvasInteracting(true);
    setCanvasQuickMenu(null);
    clearFloatingSelection();
    setOpenMenu(null);
  }

  function handleSurfaceTouchStart(
    event: ReactTouchEvent<HTMLElement>,
    currentTarget: EventTarget & HTMLElement,
    allowEditorSurface = false
  ) {
    if (event.touches.length === 0) {
      return;
    }

    if (event.target !== currentTarget && !allowEditorSurface) {
      return;
    }

    if (pendingInsertTool) {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const point = getCanvasPoint(touch.clientX, touch.clientY);
      placePendingInsertToolAt(point.x, point.y);
      return;
    }

    if (selectedTextBoxId) {
      event.preventDefault();
      closeFloatingTextEditing();
      return;
    }

    const touch = event.touches[0];
    event.preventDefault();
    beginAreaSelection(touch.clientX, touch.clientY);
  }

  function beginTextBoxEditing(textBoxId: string) {
    beginTransientHistorySession("edit");
    setEditingTextBoxId(textBoxId);
    selectSingleTextBox(textBoxId);
    pendingFocusTextBoxIdRef.current = textBoxId;
  }

  function beginBlockEditing(blockId: string, field?: string) {
    const block = blocksRef.current.find((item) => item.id === blockId);

    if (!block) {
      return;
    }

    beginTransientHistorySession("edit");
    selectSingleBlock(blockId);
    setOpenMenu(null);
    setCanvasQuickMenu(null);
    setEditingBlock({ blockId, field: field ?? getInlineStartField(block.type) });
  }

  function beginBlockEditingAfterInsert(blockId: string, field: string, attempt = 0) {
    window.requestAnimationFrame(() => {
      const block = blocksRef.current.find((item) => item.id === blockId);

      if (!block) {
        if (attempt < 4) {
          beginBlockEditingAfterInsert(blockId, field, attempt + 1);
        }
        return;
      }

      beginBlockEditing(blockId, field);
    });
  }

  function closeFloatingTextEditing() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setEditingTextBoxId(null);
    clearFloatingSelection();
    setOpenMenu(null);
    setCanvasQuickMenu(null);
  }

  function openCanvasQuickMenu(clientX: number, clientY: number) {
    const point = getCanvasPoint(clientX, clientY);
    setCanvasQuickMenu({ x: point.x + CANVAS_QUICK_MENU_OFFSET_X, y: point.y, clickX: point.x, clickY: point.y });
    clearFloatingSelection();
    setOpenMenu(null);
  }

  function openCanvasQuickMenuAtPoint(x: number, y: number) {
    setCanvasQuickMenu({ x: x + CANVAS_QUICK_MENU_OFFSET_X, y, clickX: x, clickY: y });
    clearFloatingSelection();
    setOpenMenu(null);
  }

  function collapseToolsPanelForTablet() {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(max-width: 1180px)").matches) {
      setIsToolsPanelOpen(false);
    }
  }

  function togglePendingInsertTool(nextTool: Exclude<PendingInsertTool, null>) {
    setPendingInsertTool((current) => {
      let nextValue: PendingInsertTool = nextTool;

      if (!current) {
        nextValue = nextTool;
      } else if (current.kind !== nextTool.kind) {
        nextValue = nextTool;
      } else if (current.kind === "text" && nextTool.kind === "text") {
        nextValue = null;
      } else if (current.kind === "structured" && nextTool.kind === "structured" && current.toolId === nextTool.toolId) {
        nextValue = null;
      } else if (current.kind === "shortcut" && nextTool.kind === "shortcut" && current.shortcutId === nextTool.shortcutId) {
        nextValue = null;
      } else {
        nextValue = nextTool;
      }

      if (nextValue) {
        collapseToolsPanelForTablet();
      }

      return nextValue;
    });
  }

  function updateInsertCursorPreview(clientX: number, clientY: number) {
    if ((!pendingInsertTool && advancedTool !== "highlight") || !canvasRef.current) {
      return;
    }

    const point = getCanvasPoint(clientX, clientY);
    setInsertCursorPreview({ x: point.x, y: point.y, visible: true });
  }

  function hideInsertCursorPreview() {
    setInsertCursorPreview((current) => (current.visible ? { ...current, visible: false } : current));
  }

  function placePendingInsertToolAt(x: number, y: number) {
    if (!pendingInsertTool) {
      return false;
    }

    if (pendingInsertTool.kind === "text") {
      createTextBoxAt(x, y, "exact");
      setPendingInsertTool(null);
      return true;
    }

    if (pendingInsertTool.kind === "structured") {
      createStructuredToolAt(pendingInsertTool.toolId, x, y, "exact");
      setPendingInsertTool(null);
      return true;
    }

    createShortcutSymbolAt(pendingInsertTool.shortcutId, x, y, "exact");
    setPendingInsertTool(null);
    return true;
  }

  function createTextBoxAt(x: number, y: number, mode: "exact" | "soft" = "soft") {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const placement =
      mode === "exact"
        ? getExactCanvasPlacementPosition(x, y + FLOATING_TEXTBOX_Y_OFFSET, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24)
        : getCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24, "soft");
    const textBox = createFloatingTextBox(placement.x, placement.y);
    beginTransientHistorySession("edit");

    setState((current) => ({
      ...current,
      textBoxes: [...current.textBoxes, textBox]
    }));
    beginTextBoxEditing(textBox.id);
    setCanvasQuickMenu(null);
  }

  function getFirstAvailableCanvasObjectPosition(targetWidth: number, targetHeight: number, snapOffsetY = 0) {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const canvasWidth = bounds?.width ?? 720;
    const canvasHeight = bounds?.height ?? 1020;
    const rem = getRemPixels();
    const metrics = getSheetMetrics(state.sheetStyle, rem);
    const lineStep = metrics.snapYStep;
    const originX = metrics.originX;
    const originY = metrics.originY;
    const clearance = 12;
    const occupiedBottoms = [
      ...state.blocks.map((block) => {
        const node = blockNodeRefs.current[block.id];
        const rect = node?.getBoundingClientRect();
        return block.y + Math.max(targetHeight, rect?.height ?? 52);
      }),
      ...state.symbols.map((symbol) => {
        const node = symbolNodeRefs.current[symbol.id];
        const rect = node?.getBoundingClientRect();
        return symbol.y + Math.max(targetHeight, rect?.height ?? symbol.fontSize * 20);
      }),
      ...state.textBoxes.map((textBox) => {
        const node = textBoxNodeRefs.current[textBox.id];
        const rect = node?.getBoundingClientRect();
        return textBox.y + Math.max(targetHeight, rect?.height ?? textBox.fontSize * 22);
      }),
      ...state.strokes.map((stroke) => {
        const strokeBounds = getStrokeBounds(stroke.points);
        return strokeBounds.y + Math.max(targetHeight, strokeBounds.height);
      })
    ];
    const lowestBottom = occupiedBottoms.length > 0 ? Math.max(...occupiedBottoms) : originY;
    const snappedLine = metrics.snapY
      ? originY + Math.ceil((Math.max(originY, lowestBottom + clearance) - originY) / lineStep) * lineStep
      : Math.max(originY, lowestBottom + clearance + targetHeight);
    const snappedTop = metrics.snapY ? snappedLine - targetHeight - metrics.baselineOffset + snapOffsetY : snappedLine - targetHeight;

    return {
      x: Math.max(18, Math.min(canvasWidth - targetWidth, Math.round(originX))),
      y: Math.max(18, Math.min(canvasHeight - targetHeight, Math.round(snappedTop)))
    };
  }

  function getFirstAvailableTextBoxPosition() {
    return getFirstAvailableCanvasObjectPosition(120, 28, FLOATING_TEXTBOX_Y_OFFSET);
  }

  function createToolbarTextBox() {
    const position = getFirstAvailableTextBoxPosition();
    const textBox = createFloatingTextBox(position.x, position.y);
    beginTransientHistorySession("edit");

    setState((current) => ({
      ...current,
      textBoxes: [...current.textBoxes, textBox]
    }));
    beginTextBoxEditing(textBox.id);
    setCanvasQuickMenu(null);
  }

  function createAnnotationTextBoxAt(x: number, y: number) {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const snappedPoint = getCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24, "soft");
    const textBox = createFloatingTextBox(snappedPoint.x, snappedPoint.y, "note");
    beginTransientHistorySession("edit");

    setState((current) => ({
      ...current,
      textBoxes: [...current.textBoxes, textBox]
    }));
    beginTextBoxEditing(textBox.id);
  }

  function beginFreehandDrawing(clientX: number, clientY: number) {
    const point = getCanvasPoint(clientX, clientY);
    draftStrokeStyleRef.current = getStrokeStyleForTool(advancedToolRef.current, stateRef.current.activeColor, stateRef.current.activeHighlightColor);
    beginTransientHistorySession("edit");
    isDrawingStrokeRef.current = true;
    draftStrokeRef.current = [point];
    setDraftStroke([point]);
    setCanvasQuickMenu(null);
    setOpenMenu(null);
    setIsCanvasInteracting(true);
    clearFloatingSelection();
  }

  function createStructuredToolAt(type: StructuredTool, x: number, y: number, mode: "exact" | "soft" = "soft") {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const placement =
      mode === "exact"
        ? getExactCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24)
        : getCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24, "soft");
    const block = { ...createBlock(type), x: placement.x, y: placement.y };
    beginTransientHistorySession("edit");

    setState((current) => ({
      ...current,
      blocks: [...current.blocks, block]
    }));
    beginBlockEditingAfterInsert(block.id, getInlineStartField(type));
    setCanvasQuickMenu(null);
  }

  function createShortcutSymbolAt(shortcutId: string, x: number, y: number, mode: "exact" | "soft" = "soft") {
    const shortcut = findShortcutById(shortcutId);

    if (!shortcut) {
      return;
    }

    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const placement =
      mode === "exact"
        ? getExactCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24)
        : getCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24, "soft");
    const symbol = createFloatingSymbol(shortcut, placement.x, placement.y);

    setState((current) => ({
      ...current,
      symbols: [...current.symbols, symbol]
    }));
    selectSingleSymbol(symbol.id);
    setCanvasQuickMenu(null);
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

  function insertIntoEditingTextBox(textBoxId: string, content: string) {
    const input = textBoxNodeRefs.current[textBoxId]?.querySelector("input");
    const currentTextBox = textBoxesRef.current.find((item) => item.id === textBoxId);

    if (!input || !currentTextBox) {
      return;
    }

    const start = input.selectionStart ?? currentTextBox.text.length;
    const end = input.selectionEnd ?? start;
    const nextText = `${currentTextBox.text.slice(0, start)}${content}${currentTextBox.text.slice(end)}`;
    const nextCursor = start + content.length;
    const minimumWidth = currentTextBox.variant === "note" ? 56 : 100;

    updateTextBox(textBoxId, {
      text: nextText,
      width: Math.max(minimumWidth, getTextBoxWidth(nextText))
    });

    window.requestAnimationFrame(() => {
      const nextInput = textBoxNodeRefs.current[textBoxId]?.querySelector("input");

      if (!nextInput) {
        return;
      }

      nextInput.focus();
      nextInput.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handlePaste(event: ReactClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    insertTextAtCursor(event.clipboardData.getData("text/plain"));
  }

  function isEditableKeyboardTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    const tagName = target.tagName;
    return target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
  }

  function openInsertModal(type: StructuredTool) {
    const estimatedHeight = type === "division" ? 92 : type === "addition" || type === "subtraction" || type === "multiplication" ? 98 : type === "fraction" ? 72 : 64;
    const position = getFirstAvailableCanvasObjectPosition(getDefaultWidth(type), estimatedHeight);
    const block = { ...createBlock(type), x: position.x, y: position.y };
    beginTransientHistorySession("edit");

    setState((current) => ({
      ...current,
      blocks: [...current.blocks, block]
    }));
    beginBlockEditingAfterInsert(block.id, getInlineStartField(type));
    setOpenMenu(null);
    setCanvasQuickMenu(null);
  }

  function openEditModal(blockId: string) {
    const block = state.blocks.find((item) => item.id === blockId);

    if (!block) {
      return;
    }

    beginBlockEditing(blockId, getInlineStartField(block.type));
  }

  function updateModalField(key: string, value: string | string[]) {
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

  function updateTextBox(textBoxId: string, updates: Partial<Pick<FloatingTextBox, "text" | "width" | "color">>) {
    setState((current) => ({
      ...current,
      textBoxes: current.textBoxes.map((textBox) =>
        textBox.id === textBoxId ? { ...textBox, ...updates } : textBox
      )
    }));
  }

  function applyActiveColor(color: string) {
    setState((current) => ({
      ...current,
      activeColor: color,
      blocks: current.blocks.map((block) =>
        selectedBlockIdsRef.current.includes(block.id) ? { ...block, color } : block
      ),
      symbols: current.symbols.map((symbol) =>
        selectedSymbolIdsRef.current.includes(symbol.id) ? { ...symbol, color } : symbol
      ),
      textBoxes: current.textBoxes.map((textBox) =>
        selectedTextBoxIdsRef.current.includes(textBox.id) ? { ...textBox, color } : textBox
      ),
      strokes: current.strokes.map((stroke) =>
        selectedStrokeIdsRef.current.includes(stroke.id) ? { ...stroke, color } : stroke
      )
    }));

    if (editorRef.current && editorRef.current.contains(document.activeElement)) {
      runCommand("foreColor", color);
    }
  }

  function toggleCanvasBold() {
    if (selectedCount === 0) {
      runCommand("bold");
      return;
    }

    setState((current) => {
      const selectedBlocks = current.blocks.filter((block) => selectedBlockIdsRef.current.includes(block.id));
      const selectedSymbols = current.symbols.filter((symbol) => selectedSymbolIdsRef.current.includes(symbol.id));
      const selectedTextBoxes = current.textBoxes.filter((textBox) => selectedTextBoxIdsRef.current.includes(textBox.id));
      const selectedStrokes = current.strokes.filter((stroke) => selectedStrokeIdsRef.current.includes(stroke.id));
      const shouldEmphasizeText = ![...selectedBlocks, ...selectedSymbols, ...selectedTextBoxes].every((item) => item.fontWeight >= 700);
      const shouldEmphasizeStrokes = !selectedStrokes.every((stroke) => stroke.width >= 4);

      return {
        ...current,
        blocks: current.blocks.map((block) =>
          selectedBlockIdsRef.current.includes(block.id) ? { ...block, fontWeight: shouldEmphasizeText ? 700 : 500 } : block
        ),
        symbols: current.symbols.map((symbol) =>
          selectedSymbolIdsRef.current.includes(symbol.id) ? { ...symbol, fontWeight: shouldEmphasizeText ? 700 : 500 } : symbol
        ),
        textBoxes: current.textBoxes.map((textBox) =>
          selectedTextBoxIdsRef.current.includes(textBox.id) ? { ...textBox, fontWeight: shouldEmphasizeText ? 700 : 500 } : textBox
        ),
        strokes: current.strokes.map((stroke) =>
          selectedStrokeIdsRef.current.includes(stroke.id) ? { ...stroke, width: shouldEmphasizeStrokes ? 4.2 : 2.6 } : stroke
        )
      };
    });
  }

  function toggleCanvasItalic() {
    if (selectedCount === 0) {
      runCommand("italic");
      return;
    }

    setState((current) => {
      const selectedTextItems = [
        ...current.blocks.filter((block) => selectedBlockIdsRef.current.includes(block.id)),
        ...current.symbols.filter((symbol) => selectedSymbolIdsRef.current.includes(symbol.id)),
        ...current.textBoxes.filter((textBox) => selectedTextBoxIdsRef.current.includes(textBox.id))
      ];
      const shouldItalicize = !selectedTextItems.every((item) => item.fontStyle === "italic");

      return {
        ...current,
        blocks: current.blocks.map((block) =>
          selectedBlockIdsRef.current.includes(block.id) ? { ...block, fontStyle: shouldItalicize ? "italic" : "normal" } : block
        ),
        symbols: current.symbols.map((symbol) =>
          selectedSymbolIdsRef.current.includes(symbol.id) ? { ...symbol, fontStyle: shouldItalicize ? "italic" : "normal" } : symbol
        ),
        textBoxes: current.textBoxes.map((textBox) =>
          selectedTextBoxIdsRef.current.includes(textBox.id) ? { ...textBox, fontStyle: shouldItalicize ? "italic" : "normal" } : textBox
        )
      };
    });
  }

  function toggleCanvasUnderline() {
    if (selectedCount === 0) {
      runCommand("underline");
      return;
    }

    setState((current) => {
      const selectedTextItems = [
        ...current.blocks.filter((block) => selectedBlockIdsRef.current.includes(block.id)),
        ...current.symbols.filter((symbol) => selectedSymbolIdsRef.current.includes(symbol.id)),
        ...current.textBoxes.filter((textBox) => selectedTextBoxIdsRef.current.includes(textBox.id))
      ];
      const shouldUnderline = !selectedTextItems.every((item) => item.underline);

      return {
        ...current,
        blocks: current.blocks.map((block) =>
          selectedBlockIdsRef.current.includes(block.id) ? { ...block, underline: shouldUnderline } : block
        ),
        symbols: current.symbols.map((symbol) =>
          selectedSymbolIdsRef.current.includes(symbol.id) ? { ...symbol, underline: shouldUnderline } : symbol
        ),
        textBoxes: current.textBoxes.map((textBox) =>
          selectedTextBoxIdsRef.current.includes(textBox.id) ? { ...textBox, underline: shouldUnderline } : textBox
        )
      };
    });
  }

  function applyCanvasHighlight(highlightColor: string) {
    const nextHighlight = highlightColor || null;

    if (selectedCount === 0) {
      setState((current) => ({
        ...current,
        activeHighlightColor: nextHighlight
      }));
      runCommand("hiliteColor", nextHighlight ?? "transparent");
      return;
    }

    setState((current) => ({
      ...current,
      activeHighlightColor: nextHighlight,
      blocks: current.blocks.map((block) =>
        selectedBlockIdsRef.current.includes(block.id) ? { ...block, highlightColor: nextHighlight } : block
      ),
      symbols: current.symbols.map((symbol) =>
        selectedSymbolIdsRef.current.includes(symbol.id) ? { ...symbol, highlightColor: nextHighlight } : symbol
      ),
      textBoxes: current.textBoxes.map((textBox) =>
        selectedTextBoxIdsRef.current.includes(textBox.id) ? { ...textBox, highlightColor: nextHighlight } : textBox
      )
    }));
  }

  function activateHighlightTool(highlightColor: string) {
    const nextHighlight = highlightColor || null;
    const shouldDisableHighlight = advancedTool === "highlight" && nextHighlight !== null && state.activeHighlightColor === nextHighlight;
    const resolvedHighlight = shouldDisableHighlight ? null : nextHighlight;

    setState((current) => ({
      ...current,
      activeHighlightColor: resolvedHighlight
    }));
    setPendingInsertTool(null);
    setAdvancedTool(resolvedHighlight ? "highlight" : null);
    setOpenMenu(null);
  }

  function adjustCanvasSize(direction: "down" | "up") {
    if (selectedCount === 0) {
      runCommand("fontSize", direction === "up" ? "5" : "2");
      return;
    }

    const delta = direction === "up" ? 0.12 : -0.12;

    setState((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        selectedBlockIdsRef.current.includes(block.id)
          ? { ...block, fontSize: Math.max(0.9, Math.min(2.6, Number((block.fontSize + delta).toFixed(2)))) }
          : block
      ),
      symbols: current.symbols.map((symbol) =>
        selectedSymbolIdsRef.current.includes(symbol.id)
          ? { ...symbol, fontSize: Math.max(0.9, Math.min(2.6, Number((symbol.fontSize + delta).toFixed(2)))) }
          : symbol
      ),
      textBoxes: current.textBoxes.map((textBox) =>
        selectedTextBoxIdsRef.current.includes(textBox.id)
          ? (() => {
              const nextFontSize = Math.max(textBox.variant === "note" ? 0.72 : 0.9, Math.min(2.6, Number((textBox.fontSize + delta).toFixed(2))));
              const minimumWidth = textBox.variant === "note" ? 56 : 36;
              const sizeRatio = nextFontSize / DEFAULT_CANVAS_FONT_SIZE_REM;
              return {
                ...textBox,
                fontSize: nextFontSize,
                width: Math.max(minimumWidth, Math.round(getTextBoxWidth(textBox.text || " ") * sizeRatio))
              };
            })()
          : textBox
      ),
      strokes: current.strokes.map((stroke) =>
        selectedStrokeIdsRef.current.includes(stroke.id)
          ? { ...stroke, width: Math.max(1.6, Math.min(6, Number((stroke.width + delta * 6).toFixed(2)))) }
          : stroke
      )
    }));
  }

  function updateInlineBlockField(blockId: string, key: string, value: string) {
    setState((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === blockId ? ({ ...block, [key]: value } as MathBlock) : block
      )
    }));
  }

  function toggleInlineBlockStrikeMode(blockId: string) {
    setStrikeModeBlockId((current) => (current === blockId ? null : blockId));
  }

  function toggleInlineBlockCellStrike(blockId: string, field: string, cellIndex: number) {
    setState((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === blockId && isCellStrikeBlock(block)
          ? ({ ...block, struckCells: toggleStruckCell(block.struckCells, field, cellIndex) } as MathBlock)
          : block
      )
    }));
  }

  function finishBlockEditing(blockId: string) {
    const block = blocksRef.current.find((item) => item.id === blockId);

    if (!block) {
      setEditingBlock(null);
      scheduleTransientHistoryCommit("edit");
      return;
    }

    if (isBlockEmpty(block)) {
      removeBlock(blockId);
      setEditingBlock(null);
      scheduleTransientHistoryCommit("edit");
      return;
    }

    setEditingBlock(null);
    scheduleTransientHistoryCommit("edit");
  }

  function updateNumericCaretPosition(key: string, nextPosition: number) {
    setNumericFieldCaretPositions((current) =>
      current[key] === nextPosition
        ? current
        : {
            ...current,
            [key]: nextPosition
          }
    );
  }

  function shouldCloseEditingBlock(target: EventTarget | null) {
    if (!editingBlock?.blockId) {
      return false;
    }

    const blockNode = blockNodeRefs.current[editingBlock.blockId];

    if (!blockNode) {
      return true;
    }

    return !blockNode.contains(target as Node | null);
  }

  function handleInlineBlockKeyDown(blockId: string, field: string, event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const block = blocksRef.current.find((item) => item.id === blockId);

    if (!block) {
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
      }
      finishBlockEditing(blockId);
      return;
    }

    if (block.type === "division" && field.startsWith("work:")) {
      const lineIndex = Number.parseInt(field.slice(5), 10);
      const workLines = getDivisionVisibleWorkLines(block.work, block.quotient);
      const maxLines = getDivisionMaxWorkLines(block.quotient);
      const canAdvance = (workLines[lineIndex] ?? "").trim().length > 0 && lineIndex < maxLines - 1;

      if (event.key === "Tab") {
        event.preventDefault();

        if (event.shiftKey) {
          if (lineIndex > 0) {
            setEditingBlock({ blockId, field: `work:${lineIndex - 1}` });
            return;
          }

          setEditingBlock({ blockId, field: "quotient" });
          return;
        }

        if (lineIndex < workLines.length - 1 || canAdvance) {
          setEditingBlock({ blockId, field: `work:${lineIndex + 1}` });
          return;
        }
      }

      if (event.key === "Enter") {
        event.preventDefault();

        if (lineIndex < workLines.length - 1 || canAdvance) {
          setEditingBlock({ blockId, field: `work:${lineIndex + 1}` });
          return;
        }
      }

      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const targetField = event.shiftKey ? getPreviousInlineField(block, field) : getNextInlineField(block, field);

      if (targetField) {
        setEditingBlock({ blockId, field: block.type === "division" && targetField === "work" ? "work:0" : targetField });
        return;
      }

      finishBlockEditing(blockId);
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    if (block.type === "division" && field === "work") {
      return;
    }

    event.preventDefault();
    const nextField = getNextInlineField(block, field);

    if (nextField) {
      setEditingBlock({ blockId, field: block.type === "division" && nextField === "work" ? "work:0" : nextField });
      return;
    }

    finishBlockEditing(blockId);
  }

  function removeTextBox(textBoxId: string) {
    setState((current) => ({
      ...current,
      textBoxes: current.textBoxes.filter((textBox) => textBox.id !== textBoxId)
    }));
    setSelectedTextBoxIds((current) => current.filter((id) => id !== textBoxId));
  }

  function removeStroke(strokeId: string) {
    setState((current) => ({
      ...current,
      strokes: current.strokes.filter((stroke) => stroke.id !== strokeId)
    }));
    setSelectedStrokeIds((current) => current.filter((id) => id !== strokeId));
  }

  function removeSelectedItems() {
    if (selectedCount === 0) {
      return;
    }

    setState((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => !selectedBlockIds.includes(block.id)),
      symbols: current.symbols.filter((symbol) => !selectedSymbolIds.includes(symbol.id)),
      textBoxes: current.textBoxes.filter((textBox) => !selectedTextBoxIds.includes(textBox.id)),
      strokes: current.strokes.filter((stroke) => !selectedStrokeIds.includes(stroke.id))
    }));
    clearFloatingSelection();
  }

  function resetTransientUi() {
    setOpenMenu(null);
    setModalState(null);
    setCanvasQuickMenu(null);
    setEditingBlock(null);
    setEditingTextBoxId(null);
    setDraftStroke(null);
    isDrawingStrokeRef.current = false;
    draftStrokeRef.current = [];
    draftStrokeStyleRef.current = { color: stateRef.current.activeColor, width: 2.6, opacity: 1 };
    clearFloatingSelection();
  }

  function beginTransientHistorySession(kind: "drag" | "edit") {
    if (transientHistorySnapshotRef.current) {
      return;
    }

    transientHistorySnapshotRef.current = cloneWriterState(stateRef.current);
    transientHistoryKindRef.current = kind;
    suspendHistoryRef.current = true;
  }

  function commitTransientHistorySession(kind: "drag" | "edit") {
    if (!transientHistorySnapshotRef.current || transientHistoryKindRef.current !== kind) {
      return;
    }

    const startSnapshot = transientHistorySnapshotRef.current;
    const currentSnapshot = cloneWriterState(stateRef.current);

    suspendHistoryRef.current = false;
    transientHistorySnapshotRef.current = null;
    transientHistoryKindRef.current = null;

    if (!areWriterStatesEqual(startSnapshot, currentSnapshot)) {
      setHistoryPast((current) => [...current.slice(-(MAX_HISTORY_STEPS - 1)), startSnapshot]);
      setHistoryFuture([]);
    }

    previousStateRef.current = currentSnapshot;
  }

  function scheduleTransientHistoryCommit(kind: "drag" | "edit") {
    window.setTimeout(() => {
      commitTransientHistorySession(kind);
    }, 0);
  }

  function undoHistory() {
    if (historyPast.length === 0) {
      return;
    }

    const previous = historyPast[historyPast.length - 1];
    skipHistoryRef.current = true;
    setHistoryPast((current) => current.slice(0, -1));
    setHistoryFuture((current) => [cloneWriterState(state), ...current].slice(0, MAX_HISTORY_STEPS));
    resetTransientUi();
    setState(cloneWriterState(previous));
  }

  function redoHistory() {
    if (historyFuture.length === 0) {
      return;
    }

    const next = historyFuture[0];
    skipHistoryRef.current = true;
    setHistoryFuture((current) => current.slice(1));
    setHistoryPast((current) => [...current.slice(-(MAX_HISTORY_STEPS - 1)), cloneWriterState(state)]);
    resetTransientUi();
    setState(cloneWriterState(next));
  }

  function alignSelectedItems() {
    if (selectedCount < 2) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const spacing = 12;
    const measuredItems = [
      ...state.blocks
        .filter((block) => selectedBlockIds.includes(block.id))
        .map((block) => {
          const node = blockNodeRefs.current[block.id];
          const rect = node?.getBoundingClientRect();

          return {
            id: block.id,
            type: "block" as const,
            x: block.x,
            y: block.y,
            width: Math.max(24, rect?.width ?? block.width ?? 64),
            height: Math.max(24, rect?.height ?? 64)
          };
        }),
      ...state.symbols
        .filter((symbol) => selectedSymbolIds.includes(symbol.id))
        .map((symbol) => {
          const node = symbolNodeRefs.current[symbol.id];
          const rect = node?.getBoundingClientRect();

          return {
            id: symbol.id,
            type: "symbol" as const,
            x: symbol.x,
            y: symbol.y,
            width: Math.max(24, rect?.width ?? 32),
            height: Math.max(24, rect?.height ?? symbol.fontSize * 18)
          };
        }),
      ...state.textBoxes
        .filter((textBox) => selectedTextBoxIds.includes(textBox.id))
        .map((textBox) => {
          const node = textBoxNodeRefs.current[textBox.id];
          const rect = node?.getBoundingClientRect();

          return {
            id: textBox.id,
            type: "textBox" as const,
            x: textBox.x,
            y: textBox.y,
            width: Math.max(24, rect?.width ?? textBox.width),
            height: Math.max(24, rect?.height ?? 32)
          };
        }),
      ...state.strokes
        .filter((stroke) => selectedStrokeIds.includes(stroke.id))
        .map((stroke) => {
          const node = strokeNodeRefs.current[stroke.id];
          const rect = node?.getBoundingClientRect();
          const strokeBounds = getStrokeBounds(stroke.points);

          return {
            id: stroke.id,
            type: "stroke" as const,
            x: strokeBounds.x,
            y: strokeBounds.y,
            width: Math.max(24, rect?.width ?? strokeBounds.width),
            height: Math.max(24, rect?.height ?? strokeBounds.height)
          };
        })
    ];

    if (measuredItems.length < 2) {
      return;
    }

    const anchorX = Math.min(...measuredItems.map((item) => item.x));
    const anchorY = Math.min(...measuredItems.map((item) => item.y));
    const currentRight = Math.max(...measuredItems.map((item) => item.x + item.width));
    const currentBottom = Math.max(...measuredItems.map((item) => item.y + item.height));
    const currentWidth = Math.max(1, currentRight - anchorX);
    const currentHeight = Math.max(1, currentBottom - anchorY);
    const orderedItems = [...measuredItems].sort((left, right) =>
      currentWidth >= currentHeight
        ? left.x === right.x
          ? left.y - right.y
          : left.x - right.x
        : left.y === right.y
          ? left.x - right.x
          : left.y - right.y
    );
    const currentAspectRatio = currentWidth / currentHeight;
    const canvasBounds = canvas.getBoundingClientRect();
    const snappedLayoutOrigin = getCanvasPlacementPosition(anchorX, anchorY, canvasBounds.width - 24, canvasBounds.height - 24, "strict");

    let bestLayout:
      | {
          positions: Array<{ id: string; type: "block" | "symbol" | "textBox" | "stroke"; x: number; y: number }>;
          score: number;
        }
      | null = null;

    for (let columnCount = 1; columnCount <= orderedItems.length; columnCount += 1) {
      const { columns, rows } = getGridDimensions(orderedItems.length, columnCount);
      const colWidths = Array.from({ length: columns }, () => 0);
      const rowHeights = Array.from({ length: rows }, () => 0);

      orderedItems.forEach((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        colWidths[col] = Math.max(colWidths[col], item.width);
        rowHeights[row] = Math.max(rowHeights[row], item.height);
      });

      const totalWidth = colWidths.reduce((sum, width) => sum + width, 0) + spacing * Math.max(0, columns - 1);
      const totalHeight = rowHeights.reduce((sum, height) => sum + height, 0) + spacing * Math.max(0, rows - 1);
      const positions = orderedItems.map((item, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = snappedLayoutOrigin.x + colWidths.slice(0, col).reduce((sum, width) => sum + width, 0) + spacing * col;
        const rowTop = snappedLayoutOrigin.y + rowHeights.slice(0, row).reduce((sum, height) => sum + height, 0) + spacing * row;
        const y = rowTop + (rowHeights[row] - item.height) / 2;
        const snappedPoint = getCanvasPlacementPosition(x, y, canvasBounds.width - item.width - 18, canvasBounds.height - item.height - 18, "strict", {
          height: item.height
        });

        return {
          id: item.id,
          type: item.type,
          x: snappedPoint.x,
          y: snappedPoint.y
        };
      });

      const area = totalWidth * totalHeight;
      const nextAspectRatio = totalWidth / Math.max(1, totalHeight);
      const aspectPenalty = Math.abs(Math.log(nextAspectRatio / currentAspectRatio));
      const movementPenalty = positions.reduce((sum, position, index) => {
        const item = orderedItems[index];
        return sum + Math.hypot(position.x - item.x, position.y - item.y);
      }, 0);
      const score = area + area * aspectPenalty * 0.85 + movementPenalty * 18;

      if (!bestLayout || score < bestLayout.score) {
        bestLayout = { positions, score };
      }
    }

    if (!bestLayout) {
      return;
    }

    const positionMap = new Map(bestLayout.positions.map((item) => [`${item.type}:${item.id}`, item]));

    setCanvasQuickMenu(null);
    closeFloatingTextEditing();
    setState((current) => ({
      ...current,
      blocks: current.blocks.map((block) => {
        const nextPosition = positionMap.get(`block:${block.id}`);
        return nextPosition ? { ...block, x: nextPosition.x, y: nextPosition.y } : block;
      }),
      symbols: current.symbols.map((symbol) => {
        const nextPosition = positionMap.get(`symbol:${symbol.id}`);
        return nextPosition ? { ...symbol, x: nextPosition.x, y: nextPosition.y } : symbol;
      }),
      textBoxes: current.textBoxes.map((textBox) => {
        const nextPosition = positionMap.get(`textBox:${textBox.id}`);
        return nextPosition ? { ...textBox, x: nextPosition.x, y: nextPosition.y } : textBox;
      }),
      strokes: current.strokes.map((stroke) => {
        const nextPosition = positionMap.get(`stroke:${stroke.id}`);

        if (!nextPosition) {
          return stroke;
        }

        const currentBounds = getStrokeBounds(stroke.points);
        const deltaX = nextPosition.x - currentBounds.x;
        const deltaY = nextPosition.y - currentBounds.y;

        return {
          ...stroke,
          points: stroke.points.map((point) => ({
            x: point.x + deltaX,
            y: point.y + deltaY
          }))
        };
      })
    }));
  }

  function startDragging(itemType: "block" | "symbol" | "textBox" | "stroke", itemId: string, x: number, y: number, event: ReactMouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    startDraggingAtPoint(itemType, itemId, x, y, event.clientX, event.clientY);
  }

  function startDraggingAtPoint(itemType: "block" | "symbol" | "textBox" | "stroke", itemId: string, x: number, y: number, clientX: number, clientY: number) {
    setCanvasQuickMenu(null);
    setIsCanvasInteracting(true);

    beginTransientHistorySession("drag");

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
          : itemType === "textBox"
            ? selectedTextBoxIdsRef.current.includes(itemId)
            : selectedStrokeIdsRef.current.includes(itemId);
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
    const currentStrokeIds = keepCurrentSelection
      ? selectedStrokeIdsRef.current
      : itemType === "stroke"
        ? [itemId]
        : [];

    dragRef.current = {
      itemType,
      itemId,
      pointerOffsetX: clientX - bounds.left - x,
      pointerOffsetY: clientY - bounds.top - y,
      groupBlockPositions: blocksRef.current
        .filter((block) => currentBlockIds.includes(block.id))
        .map((block) => ({ id: block.id, x: block.x, y: block.y })),
      groupSymbolPositions: symbolsRef.current
        .filter((symbol) => currentSymbolIds.includes(symbol.id))
        .map((symbol) => ({ id: symbol.id, x: symbol.x, y: symbol.y })),
      groupTextBoxPositions: textBoxesRef.current
        .filter((textBox) => currentTextBoxIds.includes(textBox.id))
        .map((textBox) => ({ id: textBox.id, x: textBox.x, y: textBox.y })),
      groupStrokePositions: strokesRef.current
        .filter((stroke) => currentStrokeIds.includes(stroke.id))
        .map((stroke) => {
          const strokeBounds = getStrokeBounds(stroke.points);
          return { id: stroke.id, x: strokeBounds.x, y: strokeBounds.y, points: stroke.points.map((point) => ({ ...point })) };
        }),
      anchorX: x,
      anchorY: y
    };

    if (!keepCurrentSelection) {
      if (itemType === "block") {
        selectSingleBlock(itemId);
      } else if (itemType === "symbol") {
        selectSingleSymbol(itemId);
      } else if (itemType === "textBox") {
        selectSingleTextBox(itemId);
      } else {
        selectSingleStroke(itemId);
      }
    }
  }

  function handleTouchDragStart(
    itemType: "block" | "symbol" | "textBox" | "stroke",
    itemId: string,
    x: number,
    y: number,
    event: ReactTouchEvent<Element>,
    disabled = false
  ) {
    if (disabled || event.touches.length === 0) {
      return;
    }

    const touch = event.touches[0];
    event.preventDefault();
    event.stopPropagation();
    startDraggingAtPoint(itemType, itemId, x, y, touch.clientX, touch.clientY);
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
    setPendingInsertTool(null);
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
    setSnapGuides({ x: null, y: null });
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
    const position = getCanvasDropPosition(
      event.clientX,
      event.clientY,
      toolbarDragMetaRef.current?.offsetX ?? 0,
      toolbarDragMetaRef.current?.offsetY ?? 0
    );
    setSnapGuides(position.guides);
  }

  function handleCanvasDragLeave(event: ReactDragEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setIsCanvasDropActive(false);
    setSnapGuides({ x: null, y: null });
  }

  function handleCanvasDrop(event: ReactDragEvent<HTMLElement>) {
    const rawPayload = event.dataTransfer.getData("application/x-maths-tool");

    if (!rawPayload) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsCanvasDropActive(false);
    setSnapGuides({ x: null, y: null });
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
      const block = { ...createBlock(payload.toolId), x: position.x, y: position.y };
      beginTransientHistorySession("edit");
      setState((current) => ({
        ...current,
        blocks: [...current.blocks, block]
      }));
      beginBlockEditingAfterInsert(block.id, getInlineStartField(payload.toolId));
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

  function renderBlockPreviewButton(blockId: string, field: string, content: ReactNode, className: string, onActivate?: () => void) {
    return (
      <button
        type="button"
        className={`math-preview-button ${className}`}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (onActivate) {
            onActivate();
            return;
          }

          beginBlockEditing(blockId, field);
        }}
      >
        {content}
      </button>
    );
  }

  function renderInteractiveColumnArithmeticPreview(block: AdditionBlock | SubtractionBlock | MultiplicationBlock) {
    const columns = getColumnArithmeticColumns(block);
    const operator = getArithmeticOperator(block);
    const renderCarryPreview = (line: ArithmeticLineField) => {
      const carryCells = getArithmeticCarryCells(block, line);
      const carryField = getCarryFieldForArithmeticLine(line);
      const activeOffset = getLastFilledArithmeticCarryOffset(carryCells);

      if (hasArithmeticCarryCells(carryCells)) {
        return (
          <div className="addition-line addition-line-carry">
            <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
            {renderBlockPreviewButton(
              block.id,
              carryField,
              renderArithmeticCarryRow(carryCells, columns, "addition-row addition-carry-row addition-row-preview", undefined, {
                field: carryField,
                struckCells: block.struckCells
              }),
              "addition-row-button",
              () => beginBlockEditing(block.id, activeOffset === null ? carryField : `${carryField}:${activeOffset}`)
            )}
          </div>
        );
      }

      return null;
    };
    const topCarryOverlay = renderCarryPreview("top");
    const bottomCarryOverlay = renderCarryPreview("bottom");
    const resultCarryOverlay = renderCarryPreview("result");

    return (
      <div className="math-layout addition-layout">
        <div className="addition-preview">
          <div className={`addition-line-stack ${topCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
            {topCarryOverlay ? <div className="addition-line-carry-overlay">{topCarryOverlay}</div> : null}
            <div className="addition-line">
              <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
              {renderBlockPreviewButton(block.id, "top", renderDivisionCellRow(block.top, columns, "addition-row addition-row-preview", "end", undefined, { field: "top", struckCells: block.struckCells }), "addition-row-button")}
            </div>
          </div>
          <div className={`addition-line-stack ${bottomCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
            {bottomCarryOverlay ? <div className="addition-line-carry-overlay">{bottomCarryOverlay}</div> : null}
            <div className="addition-line">
              <span className="addition-sign">{operator}</span>
              {renderBlockPreviewButton(block.id, "bottom", renderDivisionCellRow(block.bottom, columns, "addition-row addition-row-operation addition-row-preview", "end", undefined, { field: "bottom", struckCells: block.struckCells }), "addition-row-button")}
            </div>
          </div>
          <div className={`addition-line-stack ${resultCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
            {resultCarryOverlay ? <div className="addition-line-carry-overlay">{resultCarryOverlay}</div> : null}
            <div className="addition-line">
              <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
              {renderBlockPreviewButton(block.id, "result", renderDivisionCellRow(block.result, columns, "addition-row addition-row-result addition-row-preview", "end", undefined, { field: "result", struckCells: block.struckCells }), "addition-row-button")}
            </div>
          </div>
        </div>
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  function renderInteractiveMathPreview(block: MathBlock) {
    if (block.type === "fraction") {
      return (
        <div className="math-layout fraction-layout">
          <div className="fraction-preview">
            {renderBlockPreviewButton(block.id, "numerator", block.numerator || "numérateur", "fraction-line top")}
            <div className="fraction-bar" />
            {renderBlockPreviewButton(block.id, "denominator", block.denominator || "dénominateur", "fraction-line")}
          </div>
          {block.caption ? <p className="math-caption">{block.caption}</p> : null}
        </div>
      );
    }

    if (isColumnArithmeticBlock(block)) {
      return renderInteractiveColumnArithmeticPreview(block);
    }

    if (block.type === "division") {
      const leftColumns = getDivisionLeftColumns(block);
      const divisorColumns = getDivisionDivisorColumns(block);
      const quotientColumns = getDivisionQuotientColumns(block);
      const workLines = getDivisionVisibleWorkLines(block.work, block.quotient);
      return (
        <div className="math-layout division-layout">
        <div className="division-preview">
            <div className="division-left-column">
              <div className="division-work-line division-work-line-head">
                <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />
                {renderBlockPreviewButton(block.id, "dividend", renderDivisionCellRow(block.dividend, leftColumns, "division-dividend division-row-preview", "start", undefined, { field: "dividend", struckCells: block.struckCells }), "division-row-button")}
              </div>
              <div className="division-work-grid">
                {workLines.map((line, index) => (
                  <div
                    key={index}
                    className={`division-work-line ${index % 2 === 0 ? "division-work-line-operation" : "division-work-line-result"} ${line.trim().length === 0 ? "division-work-line-pending" : ""}`}
                  >
                    {index % 2 === 0 ? <span className="division-work-minus">-</span> : <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />}
                    {renderBlockPreviewButton(block.id, `work:${index}`, renderDivisionCellRow(line, leftColumns, "division-workpad division-row-preview", "start", undefined, { field: `work:${index}`, struckCells: block.struckCells }), "division-row-button")}
                  </div>
                ))}
              </div>
            </div>
            <div className="division-right-column">
              {renderBlockPreviewButton(block.id, "divisor", renderDivisionCellRow(block.divisor, divisorColumns, "division-divisor division-row-preview", "start", undefined, { field: "divisor", struckCells: block.struckCells }), "division-row-button")}
              {renderBlockPreviewButton(block.id, "quotient", renderDivisionCellRow(block.quotient, quotientColumns, "division-quotient division-row-preview", "start", undefined, { field: "quotient", struckCells: block.struckCells }), "division-row-button")}
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
            {renderBlockPreviewButton(block.id, "base", block.base || "base", "power-preview-main")}
            <sup>{renderBlockPreviewButton(block.id, "exponent", block.exponent || "exposant", "power-preview-exponent")}</sup>
          </p>
          {block.caption ? <p className="math-caption">{block.caption}</p> : null}
        </div>
      );
    }

    return (
      <div className="math-layout root-layout">
        <div className="root-preview">
          <span className="root-symbol">√</span>
          {renderBlockPreviewButton(block.id, "radicand", block.radicand || "radicande", "root-radicand")}
        </div>
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  function renderInlineBlockEditor(block: MathBlock) {
    const currentField = editingBlock?.blockId === block.id ? editingBlock.field : null;
    const isStrikeModeActive = strikeModeBlockId === block.id;
    const bindInlineInput = (field: string) => ({
      ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => {
        blockInputRefs.current[block.id] = {
          ...blockInputRefs.current[block.id],
          [field]: node
        };
      },
      className: "math-inline-input",
      onMouseDown: (event: ReactMouseEvent<HTMLInputElement | HTMLTextAreaElement>) => event.stopPropagation(),
      onFocus: () => setEditingBlock({ blockId: block.id, field }),
      onChange: (event: ReactChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateInlineBlockField(block.id, field, event.target.value),
      onKeyDown: (event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInlineBlockKeyDown(block.id, field, event),
      onBlur: (event: ReactFocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const nextTarget = event.relatedTarget as Node | null;

        if (nextTarget && blockNodeRefs.current[block.id]?.contains(nextTarget)) {
          return;
        }

        setTimeout(() => {
          const latestEditingBlock = editingBlockRef.current;

          if (latestEditingBlock?.blockId === block.id && latestEditingBlock.field === field) {
            finishBlockEditing(block.id);
          }
        }, 0);
      }
    });
    const renderInlineOperationMenu = (blockId: string) => (
      <div
        className="operation-edit-menu"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onTouchStart={(event) => {
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          className={`operation-edit-menu-button ${strikeModeBlockId === blockId ? "operation-edit-menu-button-active" : ""}`}
          aria-pressed={strikeModeBlockId === blockId}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={() => toggleInlineBlockStrikeMode(blockId)}
        >
          Barrer
        </button>
        {strikeModeBlockId === blockId ? <span className="operation-edit-menu-hint">Clique une case</span> : null}
      </div>
    );
    const wrapInlineOperationEditor = (blockId: string, content: ReactNode) => (
      <div className="operation-edit-shell">
        {content}
        {renderInlineOperationMenu(blockId)}
      </div>
    );

    const renderColumnArithmeticInlineEditor = (arithmeticBlock: AdditionBlock | SubtractionBlock | MultiplicationBlock) => {
      const columns = getColumnArithmeticColumns(arithmeticBlock);
      const operator = getArithmeticOperator(arithmeticBlock);
      const getCurrentLineTargetIndex = (line: ArithmeticLineField) => {
        const lineValue = arithmeticBlock[line];
        const caretKey = `${arithmeticBlock.id}:${line}`;
        const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(lineValue).length;
        return getAlignedCaretCellIndex(lineValue, columns, "end", caretPosition);
      };
      const activeLine = currentField === "top" || currentField?.startsWith("carryTop") ? "top" : currentField === "bottom" || currentField?.startsWith("carryBottom") ? "bottom" : currentField === "result" || currentField?.startsWith("carryResult") ? "result" : null;
      const activateCarryEditing = (field: ArithmeticCarryField, offsetFromRight: number) => {
        setEditingBlock({ blockId: arithmeticBlock.id, field: `${field}:${offsetFromRight}` });
      };
      const renderArithmeticNumericField = (
        field: ArithmeticCarryField | ArithmeticLineField,
        value: string,
        displayClassName: string
      ) => {
        const isActive = currentField === field;
        const caretKey = `${arithmeticBlock.id}:${field}`;
        const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(value).length;
        const targetCellIndex = getAlignedCaretCellIndex(value, columns, "end", caretPosition);
        const baseInputProps = bindInlineInput(field);

        return (
          <div
            className={`addition-number-field ${isActive ? "addition-number-field-active" : ""}`}
            style={{ ["--division-columns" as string]: columns } as ReactCSSProperties}
          >
            <input
              {...baseInputProps}
              value={value}
              inputMode="decimal"
              pattern="[0-9,]*"
              className={`addition-number-input ${isStrikeModeActive ? "addition-number-input-strike-mode" : ""}`}
              onFocus={(event) => {
                baseInputProps.onFocus();
              }}
              onClick={(event) => {
                updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(value).length);
              }}
              onKeyUp={(event) => {
                updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length);
              }}
              onSelect={(event) => {
                updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length);
              }}
              onChange={(event) => {
                const nextValue = normalizeDivisionDecimalInput(event.target.value);
                updateInlineBlockField(arithmeticBlock.id, field, nextValue);
                updateNumericCaretPosition(caretKey, event.target.selectionStart ?? Array.from(nextValue).length);
              }}
            />
            {renderDivisionCellRow(
              value,
              columns,
              `${displayClassName} addition-number-display ${isStrikeModeActive ? "addition-number-display-strike-mode" : ""}`,
              "end",
              isActive ? targetCellIndex : undefined,
              {
                field,
                struckCells: arithmeticBlock.struckCells,
                onCellToggle: isStrikeModeActive
                  ? (cellIndex, cellValue) => {
                      if (!cellValue.trim()) {
                        return;
                      }

                      toggleInlineBlockCellStrike(arithmeticBlock.id, field, cellIndex);
                    }
                  : undefined
              }
            )}
          </div>
        );
      };
      const renderCarryControl = (line: ArithmeticLineField) => {
        const carryField = getCarryFieldForArithmeticLine(line);
        const carryCells = arithmeticBlock[carryField];
        const activeCarryMatch = currentField?.match(new RegExp(`^${carryField}:(\\d+)$`));
        const activeOffset = activeCarryMatch ? Number.parseInt(activeCarryMatch[1] ?? "0", 10) : null;
        const targetCellIndex = line === activeLine ? getCurrentLineTargetIndex(line) : undefined;
        const targetOffset = typeof targetCellIndex === "number" ? columns - 1 - targetCellIndex : 0;
        const showCarryRow = hasArithmeticCarryCells(carryCells) || activeCarryMatch !== null;

        if (showCarryRow) {
          if (isStrikeModeActive) {
            return (
              <div className="addition-line addition-line-carry">
                <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
                {renderArithmeticCarryRow(carryCells, columns, "addition-row addition-carry-row", targetCellIndex, {
                  field: carryField,
                  struckCells: arithmeticBlock.struckCells,
                  onCellToggle: (cellIndex, cellValue) => {
                    if (!cellValue.trim()) {
                      return;
                    }

                    toggleInlineBlockCellStrike(arithmeticBlock.id, carryField, cellIndex);
                  }
                })}
              </div>
            );
          }

          return (
            <div className="addition-line addition-line-carry">
              <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
              <div className="division-cell-row addition-row addition-carry-row" style={{ ["--division-columns" as string]: columns } as ReactCSSProperties}>
                {Array.from({ length: columns }).map((_, index) => {
                  const offsetFromRight = columns - 1 - index;
                  const isActive = activeOffset === offsetFromRight;
                  const carryCellValue = getArithmeticCarryCell(carryCells, offsetFromRight);
                  const isStruck = hasStruckCell(arithmeticBlock.struckCells, carryField, offsetFromRight);

                  if (isActive) {
                    return (
                      <span key={index} className={`division-cell addition-carry-cell division-cell-target addition-carry-cell-editing ${isStruck ? "division-cell-struck" : ""}`}>
                        <span className="addition-carry-input-ghost" aria-hidden="true">
                          {carryCellValue}
                        </span>
                        <input
                          ref={(node) => {
                            blockInputRefs.current[arithmeticBlock.id] = {
                              ...blockInputRefs.current[arithmeticBlock.id],
                              [`${carryField}:${offsetFromRight}`]: node
                            };
                          }}
                          value={carryCellValue}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          className="addition-carry-input"
                          onMouseDown={(event) => event.stopPropagation()}
                          onFocus={() => activateCarryEditing(carryField, offsetFromRight)}
                          onBlur={(event) => {
                            const nextTarget = event.relatedTarget as Node | null;

                            if (nextTarget && blockNodeRefs.current[arithmeticBlock.id]?.contains(nextTarget)) {
                              return;
                            }

                            setTimeout(() => {
                              const latestEditingBlock = editingBlockRef.current;

                              if (latestEditingBlock?.blockId === arithmeticBlock.id && latestEditingBlock.field === `${carryField}:${offsetFromRight}`) {
                                finishBlockEditing(arithmeticBlock.id);
                              }
                            }, 0);
                          }}
                          onChange={(event) => {
                            const nextValue = event.target.value.replace(/\D+/g, "").slice(-1);
                            setState((current) => ({
                              ...current,
                              blocks: current.blocks.map((block) =>
                                block.id === arithmeticBlock.id && isColumnArithmeticBlock(block)
                                  ? ({ ...block, [carryField]: setArithmeticCarryCell(block[carryField], offsetFromRight, nextValue) } as MathBlock)
                                  : block
                              )
                            }));
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Tab" || event.key === "Enter") {
                              event.preventDefault();
                              setEditingBlock({ blockId: arithmeticBlock.id, field: line });
                            }
                          }}
                        />
                      </span>
                    );
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`division-cell division-cell-button addition-carry-cell ${typeof targetCellIndex === "number" && targetCellIndex === index ? "addition-carry-cell-target" : ""} ${isStruck ? "division-cell-struck" : ""}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        activateCarryEditing(carryField, offsetFromRight);
                      }}
                      onTouchStart={(event) => {
                        event.stopPropagation();
                        activateCarryEditing(carryField, offsetFromRight);
                      }}
                    >
                      {carryCellValue}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        if (currentField !== line || typeof targetCellIndex !== "number") {
          return null;
        }

        return (
          <div className="addition-line addition-line-carry addition-line-carry-toggle">
            <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
            <button
              type="button"
              className="addition-carry-toggle-button"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                activateCarryEditing(carryField, targetOffset);
              }}
              onTouchStart={(event) => {
                event.stopPropagation();
                activateCarryEditing(carryField, targetOffset);
              }}
            >
              + retenue
            </button>
          </div>
        );
      };
      const topCarryControl = renderCarryControl("top");
      const bottomCarryControl = renderCarryControl("bottom");
      const resultCarryControl = renderCarryControl("result");

      return wrapInlineOperationEditor(
        arithmeticBlock.id,
        <div className="math-layout addition-layout">
          <div className="addition-preview">
            <div className={`addition-line-stack ${topCarryControl ? "addition-line-stack-with-carry" : ""}`}>
              {topCarryControl ? <div className="addition-line-carry-overlay">{topCarryControl}</div> : null}
              <div className="addition-line">
                <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
                {renderArithmeticNumericField("top", arithmeticBlock.top, "addition-row")}
              </div>
            </div>
            <div className={`addition-line-stack ${bottomCarryControl ? "addition-line-stack-with-carry" : ""}`}>
              {bottomCarryControl ? <div className="addition-line-carry-overlay">{bottomCarryControl}</div> : null}
              <div className="addition-line">
                <span className="addition-sign">{operator}</span>
                {renderArithmeticNumericField("bottom", arithmeticBlock.bottom, "addition-row addition-row-operation")}
              </div>
            </div>
            <div className={`addition-line-stack ${resultCarryControl ? "addition-line-stack-with-carry" : ""}`}>
              {resultCarryControl ? <div className="addition-line-carry-overlay">{resultCarryControl}</div> : null}
              <div className="addition-line">
                <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
                {renderArithmeticNumericField("result", arithmeticBlock.result, "addition-row addition-row-result")}
              </div>
            </div>
          </div>
        </div>
      );
    };

    if (block.type === "fraction") {
      return (
        <div className="math-layout fraction-layout">
          <div className="fraction-preview fraction-preview-editing">
            <input {...bindInlineInput("numerator")} value={block.numerator} placeholder="a" className="math-inline-input fraction-inline-input" />
            <div className="fraction-bar" />
            <input {...bindInlineInput("denominator")} value={block.denominator} placeholder="b" className="math-inline-input fraction-inline-input" />
          </div>
        </div>
      );
    }

    if (isColumnArithmeticBlock(block)) {
      return renderColumnArithmeticInlineEditor(block);
    }

    if (block.type === "division") {
      const leftColumns = getDivisionLeftColumns(block);
      const divisorColumns = getDivisionDivisorColumns(block);
      const quotientColumns = getDivisionQuotientColumns(block);
      const divisionWorkLines = getDivisionVisibleWorkLines(block.work, block.quotient);
      const setDivisionCellRef = (field: string, index: number) => (node: HTMLInputElement | null) => {
        blockInputRefs.current[block.id] = {
          ...blockInputRefs.current[block.id],
          [field]: index === 0 ? node : blockInputRefs.current[block.id]?.[field] ?? null,
          [`${field}:${index}`]: node
        };
      };
      const focusDivisionCell = (field: string, index: number) => {
        setEditingBlock({ blockId: block.id, field: index === 0 ? field : `${field}:${index}` });
      };
      const moveDivisionCellFocus = (field: string, index: number, direction: "next" | "previous", maxColumns: number) => {
        const nextIndex = direction === "next" ? index + 1 : index - 1;

        if (nextIndex < 0 || nextIndex >= maxColumns) {
          return false;
        }

        const nextField = nextIndex === 0 ? field : `${field}:${nextIndex}`;
        setEditingBlock({ blockId: block.id, field: nextField });
        return true;
      };
      const renderDivisionEditableRow = (
        field: string,
        value: string,
        columns: number,
        className: string,
        onUpdate: (nextValue: string) => void
      ) => {
        const applyDivisionCellInput = (index: number, rawValue: string) => {
          const nextCharacters = Array.from(normalizeDivisionDecimalInput(rawValue));

          if (nextCharacters.length === 0) {
            onUpdate(setDivisionCellValue(value, index, ""));
            return;
          }

          const nextState = setDivisionCellValues(value, index, nextCharacters, columns);
          onUpdate(nextState.value);

          if (nextState.insertedCount > 0) {
            const nextIndex = Math.min(index + nextState.insertedCount, columns - 1);

            if (nextIndex !== index) {
              focusDivisionCell(field, nextIndex);
            }
          }
        };

        return (
          <div className={`division-cell-row ${className}`} style={{ ["--division-columns" as string]: columns } as ReactCSSProperties}>
            {Array.from({ length: columns }).map((_, index) => {
              const cellField = index === 0 ? field : `${field}:${index}`;
              const isActive = currentField === cellField || (index === 0 && currentField === field);

              return (
                <input
                  key={cellField}
                  ref={setDivisionCellRef(field, index)}
                  value={getDivisionCellValue(value, index)}
                  inputMode="numeric"
                  maxLength={1}
                  className={`division-cell-input ${isActive ? "division-cell-input-active" : ""} ${hasStruckCell(block.struckCells, field, index) ? "division-cell-input-struck" : ""}`}
                  onMouseDown={(event) => {
                    if (isStrikeModeActive) {
                      event.preventDefault();
                      event.stopPropagation();

                      if (getDivisionCellValue(value, index).trim()) {
                        toggleInlineBlockCellStrike(block.id, field, index);
                      }

                      return;
                    }

                    event.stopPropagation();
                  }}
                  onTouchStart={(event) => {
                    if (!isStrikeModeActive) {
                      return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    if (getDivisionCellValue(value, index).trim()) {
                      toggleInlineBlockCellStrike(block.id, field, index);
                    }
                  }}
                  onFocus={() => focusDivisionCell(field, index)}
                  onPaste={(event: ReactClipboardEvent<HTMLInputElement>) => {
                    event.preventDefault();
                    applyDivisionCellInput(index, event.clipboardData.getData("text"));
                  }}
                  onChange={(event) => {
                    applyDivisionCellInput(index, event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key.length === 1 && /[0-9,.]/.test(event.key)) {
                      event.preventDefault();
                      applyDivisionCellInput(index, event.key);
                      return;
                    }

                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      moveDivisionCellFocus(field, index, "previous", columns);
                      return;
                    }

                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      moveDivisionCellFocus(field, index, "next", columns);
                      return;
                    }

                    if (event.key === "Backspace" && !getDivisionCellValue(value, index)) {
                      event.preventDefault();
                      if (moveDivisionCellFocus(field, index, "previous", columns)) {
                        onUpdate(setDivisionCellValue(value, Math.max(0, index - 1), ""));
                      }
                      return;
                    }

                    if (event.key === "Enter") {
                      event.preventDefault();
                      if (field.startsWith("work:")) {
                        const lineIndex = Number.parseInt(field.slice(5), 10);
                        const visibleLines = getDivisionVisibleWorkLines(block.work, block.quotient);
                        const maxLines = getDivisionMaxWorkLines(block.quotient);

                        if (lineIndex < visibleLines.length - 1 || ((visibleLines[lineIndex] ?? "").trim().length > 0 && lineIndex < maxLines - 1)) {
                          setEditingBlock({ blockId: block.id, field: `work:${lineIndex + 1}` });
                        }
                        return;
                      }

                      const nextField =
                        field === "dividend"
                          ? "divisor"
                          : field === "divisor"
                            ? "quotient"
                            : field === "quotient"
                              ? "work:0"
                              : null;

                      if (nextField) {
                        setEditingBlock({ blockId: block.id, field: nextField });
                        return;
                      }

                      finishBlockEditing(block.id);
                      return;
                    }

                    if (event.key === "Tab") {
                      event.preventDefault();

                      if (event.shiftKey && moveDivisionCellFocus(field, index, "previous", columns)) {
                        return;
                      }

                      if (!event.shiftKey && moveDivisionCellFocus(field, index, "next", columns)) {
                        return;
                      }

                      const nextField =
                        field === "dividend"
                          ? event.shiftKey
                            ? null
                            : "divisor"
                          : field === "divisor"
                            ? event.shiftKey
                              ? "dividend"
                              : "quotient"
                            : field === "quotient"
                              ? event.shiftKey
                                ? "divisor"
                                : "work:0"
                              : field.startsWith("work:")
                                ? (() => {
                                    const lineIndex = Number.parseInt(field.slice(5), 10);
                                    return event.shiftKey ? (lineIndex > 0 ? `work:${lineIndex - 1}` : "quotient") : `work:${lineIndex + 1}`;
                                  })()
                                : null;

                      if (nextField) {
                        setEditingBlock({ blockId: block.id, field: nextField });
                        return;
                      }

                      finishBlockEditing(block.id);
                    }
                  }}
                />
              );
            })}
          </div>
        );
      };
      const renderDivisionNumericField = (
        field: "dividend" | "divisor" | "quotient",
        value: string,
        columns: number,
        wrapperClassName: string,
        inputClassName: string,
        displayClassName: string
      ) => {
        const isActive = currentField === field;
        const caretKey = `${block.id}:${field}`;
        const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(value).length;
        const align = field === "dividend" ? "start" : "end";
        const targetCellIndex = getAlignedCaretCellIndex(value, columns, align, caretPosition);
        const baseInputProps = bindInlineInput(field);

        return (
          <div
            className={`division-number-field ${wrapperClassName} ${isActive ? "division-number-field-active" : ""}`}
            style={{ ["--division-columns" as string]: columns } as ReactCSSProperties}
          >
            <input
              {...baseInputProps}
              value={value}
              inputMode="decimal"
              pattern="[0-9,]*"
              className={`${inputClassName} ${isStrikeModeActive ? "division-number-field-input-strike-mode" : ""}`}
              onFocus={(event) => {
                baseInputProps.onFocus();
              }}
              onClick={(event) => {
                updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(value).length);
              }}
              onKeyUp={(event) => {
                updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length);
              }}
              onSelect={(event) => {
                updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length);
              }}
              onChange={(event) => {
                const nextValue = normalizeDivisionDecimalInput(event.target.value);
                updateInlineBlockField(block.id, field, nextValue);
                updateNumericCaretPosition(caretKey, event.target.selectionStart ?? Array.from(nextValue).length);
              }}
            />
            {renderDivisionCellRow(
              value,
              columns,
              `${displayClassName} division-number-field-display ${isStrikeModeActive ? "division-number-field-display-strike-mode" : ""}`,
              align,
              isActive ? targetCellIndex : undefined,
              {
                field,
                struckCells: block.struckCells,
                onCellToggle: isStrikeModeActive
                  ? (cellIndex, cellValue) => {
                      if (!cellValue.trim()) {
                        return;
                      }

                      toggleInlineBlockCellStrike(block.id, field, cellIndex);
                    }
                  : undefined
              }
            )}
          </div>
        );
      };

      return wrapInlineOperationEditor(
        block.id,
        <div className="math-layout division-layout">
          <div className="division-preview">
            <div className="division-left-column">
              <div className="division-work-line division-work-line-head">
                <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />
                {renderDivisionNumericField("dividend", block.dividend, leftColumns, "division-dividend-field-shell", "division-dividend-field", "division-dividend")}
              </div>
              <div className="division-work-grid">
                {divisionWorkLines.map((line, index) => (
                  <div
                    key={index}
                    className={`division-work-line ${index % 2 === 0 ? "division-work-line-operation" : "division-work-line-result"} ${line.trim().length === 0 ? "division-work-line-pending" : ""}`}
                  >
                    {index % 2 === 0 ? <span className="division-work-minus">-</span> : <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />}
                    {renderDivisionEditableRow(`work:${index}`, line, leftColumns, "division-workpad", (nextValue) =>
                      updateInlineBlockField(block.id, "work", setDivisionWorkLine(block.work, index, nextValue))
                    )}
                  </div>
                  ))}
              </div>
            </div>
            <div className="division-right-column">
              {renderDivisionNumericField("divisor", block.divisor, divisorColumns, "division-divisor-field-shell", "division-divisor-field", "division-divisor")}
              {renderDivisionNumericField("quotient", block.quotient, quotientColumns, "division-quotient-field-shell", "division-quotient-field", "division-quotient")}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === "power") {
      return (
        <div className="math-layout power-layout">
          <p className="power-preview power-preview-editing">
            <input {...bindInlineInput("base")} value={block.base} placeholder="a" className="math-inline-input power-inline-base" />
            <sup>
              <input {...bindInlineInput("exponent")} value={block.exponent} placeholder="n" className="math-inline-input power-inline-exponent" />
            </sup>
          </p>
        </div>
      );
    }

    return (
      <div className="math-layout root-layout">
        <div className="root-preview root-preview-editing">
          <span className="root-symbol">√</span>
          <input {...bindInlineInput("radicand")} value={block.radicand} placeholder="a" className="math-inline-input root-inline-radicand" />
        </div>
      </div>
    );
  }

  function resetDocument() {
    setConfirmResetState({ open: true });
  }

  function confirmResetDocument() {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(createDefaultState());
    setOpenMenu(null);
    setCanvasQuickMenu(null);
    setModalState(null);
    setConfirmResetState(null);
    clearFloatingSelection();
    selectionRef.current = null;
    if (editorRef.current) {
      editorRef.current.innerHTML = DEFAULT_TEXT_HTML;
    }
  }

  function createExportSheetOverlay(sheetStyle: SheetStyle, width: number, height: number) {
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    overlay.setAttribute("class", "export-sheet-overlay");
    overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
    overlay.setAttribute("width", `${width}`);
    overlay.setAttribute("height", `${height}`);
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("preserveAspectRatio", "none");

    const addLine = (x1: number, y1: number, x2: number, y2: number, color: string) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "export-sheet-line");
      line.setAttribute("x1", `${x1}`);
      line.setAttribute("y1", `${y1}`);
      line.setAttribute("x2", `${x2}`);
      line.setAttribute("y2", `${y2}`);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "1");
      line.setAttribute("vector-effect", "non-scaling-stroke");
      line.setAttribute("shape-rendering", "crispEdges");
      overlay.append(line);
    };

    if (sheetStyle === "blank") {
      return overlay;
    }

    if (sheetStyle === "seyes") {
      const major = mmToPx(SEYES_MAJOR_MM);
      const minor = mmToPx(SEYES_MINOR_MM);
      const marginX = cmToPx(SEYES_MARGIN_CM);

      addLine(Math.round(marginX) - 0.5, 0, Math.round(marginX) - 0.5, height, "rgba(235, 146, 82, 0.45)");

      for (let y = minor; y < height; y += minor) {
        const isMajor = Math.abs((y / major) - Math.round(y / major)) < 0.02;
        const snappedY = Math.round(y) + 0.5;
        addLine(0, snappedY, width, snappedY, isMajor ? "rgba(162, 198, 228, 0.82)" : "rgba(190, 218, 239, 0.5)");
      }

      for (let x = marginX; x < width; x += major) {
        const snappedX = Math.round(x) + 0.5;
        addLine(snappedX, 0, snappedX, height, "rgba(162, 198, 228, 0.78)");
      }

      return overlay;
    }

    const major = sheetStyle === "large-grid" ? mmToPx(8) : mmToPx(4);
    const color = sheetStyle === "large-grid" ? "rgba(187, 209, 235, 0.72)" : "rgba(187, 209, 235, 0.62)";

    for (let y = major; y < height; y += major) {
      const snappedY = Math.round(y) + 0.5;
      addLine(0, snappedY, width, snappedY, color);
    }

    for (let x = major; x < width; x += major) {
      const snappedX = Math.round(x) + 0.5;
      addLine(snappedX, 0, snappedX, height, color);
    }

    return overlay;
  }

  function createExportCanvasNode() {
    if (!canvasRef.current) {
      return null;
    }

    const liveBounds = canvasRef.current.getBoundingClientRect();
    const exportWidth = Math.max(1, Math.round(liveBounds.width));
    const exportHeight = Math.max(1, Math.round(liveBounds.height));
    const wrapper = document.createElement("div");
    wrapper.className = "export-clone";

    const clone = canvasRef.current.cloneNode(true) as HTMLElement;
    clone.classList.remove("document-canvas-drop-active", "document-canvas-interacting", "document-canvas-draw-mode");
    clone.classList.add("export-sheet");
    clone.style.width = `${exportWidth}px`;
    clone.style.height = `${exportHeight}px`;
    clone.style.aspectRatio = "auto";
    clone.style.margin = "0";
    clone.style.borderRadius = "0";
    clone.style.boxShadow = "none";
    clone.style.background = "#fffdf9";
    clone.style.backgroundImage = "none";
    clone.style.setProperty("--canvas-type-size", `${getDefaultCanvasFontSize(state.sheetStyle)}rem`);
    clone.querySelectorAll(".canvas-snap-guide, .canvas-quick-menu, .canvas-quick-anchor").forEach((node) => node.remove());

    const overlay = createExportSheetOverlay(state.sheetStyle, exportWidth, exportHeight);
    clone.insertBefore(overlay, clone.firstChild);

    wrapper.append(clone);
    document.body.append(wrapper);

    return {
      node: clone,
      cleanup: () => wrapper.remove()
    };
  }

  async function exportPdf() {
    const exportNode = createExportCanvasNode();

    if (!exportNode) {
      return;
    }

    setIsExporting("pdf");

    try {
      const imageUrl = await toPng(exportNode.node, {
        backgroundColor: "#fffdf8",
        cacheBust: true,
        skipFonts: true,
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
      pdf.addImage(imageUrl, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save(`${safeFileName(state.title) || "maths-facile"}.pdf`);
    } finally {
      exportNode.cleanup();
      setIsExporting(null);
    }
  }

  async function exportPng() {
    const exportNode = createExportCanvasNode();

    if (!exportNode) {
      return;
    }

    const previewWindow = window.open("", "_blank");

    setIsExporting("png");

    try {
      const imageUrl = await toPng(exportNode.node, {
        backgroundColor: "#fffdf8",
        cacheBust: true,
        skipFonts: true,
        pixelRatio: 2
      });

      if (!previewWindow) {
        return;
      }

      const safeTitle = state.title || "maths-facile";
      previewWindow.document.title = `${safeTitle}.png`;
      previewWindow.document.body.style.margin = "0";
      previewWindow.document.body.style.background = "#1f2430";
      previewWindow.document.body.style.display = "grid";
      previewWindow.document.body.style.placeItems = "center";
      previewWindow.document.body.innerHTML = `<img src="${imageUrl}" alt="${safeTitle}" style="max-width:100vw;max-height:100vh;display:block;background:white;" />`;
      previewWindow.document.close();
    } finally {
      exportNode.cleanup();
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
            <span>Diviseur</span>
            <input value={block.divisor} onChange={(event) => updateModalField("divisor", event.target.value)} placeholder="7" />
          </label>
          <label>
            <span>Quotient</span>
            <input value={block.quotient} onChange={(event) => updateModalField("quotient", event.target.value)} placeholder="35" />
          </label>
          <label className="wide-field">
            <span>Dividende et calculs</span>
            <textarea value={block.work} onChange={(event) => updateModalField("work", event.target.value)} placeholder={"245\n21\n35\n0"} rows={4} />
          </label>
          <label className="wide-field">
            <span>Consigne ou remarque</span>
            <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder="Je vérifie avec 35 × 7" />
          </label>
        </div>
      );
    }

    if (block.type === "addition" || block.type === "subtraction" || block.type === "multiplication") {
      return (
        <div className="math-editor-grid">
          <label>
            <span>Premier terme</span>
            <input value={block.top} onChange={(event) => updateModalField("top", event.target.value)} placeholder="245" />
          </label>
          <label>
            <span>Deuxième terme</span>
            <input value={block.bottom} onChange={(event) => updateModalField("bottom", event.target.value)} placeholder="37" />
          </label>
          <label>
            <span>Résultat</span>
            <input value={block.result} onChange={(event) => updateModalField("result", event.target.value)} placeholder="282" />
          </label>
          <label>
            <span>Retenue haut</span>
            <input value={[...block.carryTop].reverse().join("")} onChange={(event) => updateModalField("carryTop", normalizeArithmeticCarryCells(event.target.value))} placeholder="1" />
          </label>
          <label>
            <span>Retenue milieu</span>
            <input value={[...block.carryBottom].reverse().join("")} onChange={(event) => updateModalField("carryBottom", normalizeArithmeticCarryCells(event.target.value))} placeholder="2" />
          </label>
          <label>
            <span>Retenue bas</span>
            <input value={[...block.carryResult].reverse().join("")} onChange={(event) => updateModalField("carryResult", normalizeArithmeticCarryCells(event.target.value))} placeholder="3" />
          </label>
          <label className="wide-field">
            <span>Consigne ou remarque</span>
            <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder={block.type === "addition" ? "Je pose l'addition" : block.type === "subtraction" ? "Je pose la soustraction" : "Je pose la multiplication"} />
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

  function toggleAdvancedToolMode(tool: AdvancedTool) {
    setPendingInsertTool(null);
    setAdvancedTool((current) => {
      const nextValue = current === tool ? null : tool;

      if (nextValue) {
        collapseToolsPanelForTablet();
      }

      return nextValue;
    });
  }

  function handleHeaderDelete() {
    if (selectedCount === 0) {
      return;
    }

    if (selectedCount > 1) {
      removeSelectedItems();
      return;
    }

    if (selectedBlock) {
      removeBlock(selectedBlock.id);
      return;
    }

    if (selectedSymbol) {
      removeSymbol(selectedSymbol.id);
      return;
    }

    if (selectedTextBox) {
      removeTextBox(selectedTextBox.id);
      return;
    }

    if (selectedStroke) {
      removeStroke(selectedStroke.id);
    }
  }

  function createToolbarShortcutSymbol(shortcutId: string) {
    const shortcut = findShortcutById(shortcutId);

    if (!shortcut) {
      return;
    }

    const defaultFontSize = getDefaultCanvasFontSize(state.sheetStyle);
    const estimatedWidth = Math.max(36, Math.round(shortcut.content.trim().length * defaultFontSize * 14));
    const estimatedHeight = Math.max(30, Math.round(defaultFontSize * 22));
    const position = getFirstAvailableCanvasObjectPosition(estimatedWidth, estimatedHeight);
    const symbol = createFloatingSymbol(shortcut, position.x, position.y);
    beginTransientHistorySession("edit");

    setState((current) => ({
      ...current,
      symbols: [...current.symbols, symbol]
    }));
    selectSingleSymbol(symbol.id);
    setCanvasQuickMenu(null);
  }

  return (
    <main className="editor-shell">
      {isToolsPanelOpen ? <button type="button" className="tools-drawer-backdrop" aria-label="Fermer les outils" onClick={() => setIsToolsPanelOpen(false)} /> : null}

      <header className={`top-toolbar ${isToolsPanelOpen ? "top-toolbar-open" : ""}`}>
        <div className="top-toolbar-inner">
          <div className="toolbar-row toolbar-row-secondary sidebar-block">
            <p className="sidebar-block-label">Opérations posées</p>
            <div className="toolbar-shortcut-group" aria-label="Outils d'insertion">
              {activeStructuredTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={`toolbar-shortcut toolbar-shortcut-symbol ${pendingInsertTool?.kind === "structured" && pendingInsertTool.toolId === tool.id ? "toolbar-shortcut-active" : ""}`}
                  aria-label={tool.label}
                  aria-pressed={pendingInsertTool?.kind === "structured" && pendingInsertTool.toolId === tool.id}
                  draggable
                  title={tool.hint}
                  onDragStart={(event) => handleToolDragStart({ kind: "structured", toolId: tool.id }, event)}
                  onDragEnd={handleToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    togglePendingInsertTool({ kind: "structured", toolId: tool.id });
                  }}
                >
                  {renderStructuredToolGlyph(tool.id)}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-row toolbar-row-secondary sidebar-block">
            <p className="sidebar-block-label">Symboles courants</p>
            <div className="toolbar-shortcut-group toolbar-shortcut-group-symbols" aria-label="Raccourcis symboles courants">
              {commonInlineShortcuts.map((shortcut) => (
                <button
                  key={shortcut.id}
                  type="button"
                  className={`toolbar-shortcut toolbar-shortcut-symbol ${pendingInsertTool?.kind === "shortcut" && pendingInsertTool.shortcutId === shortcut.id ? "toolbar-shortcut-active" : ""}`}
                  draggable
                  title={shortcut.hint}
                  aria-pressed={pendingInsertTool?.kind === "shortcut" && pendingInsertTool.shortcutId === shortcut.id}
                  onDragStart={(event) => handleToolDragStart({ kind: "shortcut", shortcutId: shortcut.id }, event)}
                  onDragEnd={handleToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    togglePendingInsertTool({ kind: "shortcut", shortcutId: shortcut.id });
                  }}
                >
                  {renderShortcutGlyph(shortcut)}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-row toolbar-row-secondary sidebar-block">
            <p className="sidebar-block-label">Outils lycée</p>
            <div className="toolbar-shortcut-group toolbar-shortcut-group-symbols" aria-label="Raccourcis lycée">
              {visibleLyceeInlineShortcuts.map((shortcut) => (
                <button
                  key={shortcut.id}
                  type="button"
                  className={`toolbar-shortcut toolbar-shortcut-symbol ${pendingInsertTool?.kind === "shortcut" && pendingInsertTool.shortcutId === shortcut.id ? "toolbar-shortcut-active" : ""}`}
                  draggable
                  title={shortcut.hint}
                  aria-pressed={pendingInsertTool?.kind === "shortcut" && pendingInsertTool.shortcutId === shortcut.id}
                  onDragStart={(event) => handleToolDragStart({ kind: "shortcut", shortcutId: shortcut.id }, event)}
                  onDragEnd={handleToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    togglePendingInsertTool({ kind: "shortcut", shortcutId: shortcut.id });
                  }}
                >
                  {renderShortcutGlyph(shortcut)}
                </button>
              ))}
            </div>
          </div>

          <div className="toolbar-row toolbar-row-format sidebar-block" aria-label="Mise en forme">
            <p className="sidebar-block-label">Mise en forme</p>
            <div className="editor-local-toolbar-group">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`color-chip ${state.activeColor === option.value ? "color-chip-active" : ""}`}
                  style={{ backgroundColor: option.value, color: option.value }}
                  aria-label={option.label}
                  title={option.label}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyActiveColor(option.value)}
                />
              ))}
            </div>

            <div className="editor-local-toolbar-group">
              <button type="button" className="chip-button chip-button-compact" aria-label="Gras" title="Gras" onMouseDown={(event) => event.preventDefault()} onClick={toggleCanvasBold}>
                B
              </button>
              <button type="button" className="chip-button chip-button-compact" aria-label="Italique" title="Italique" onMouseDown={(event) => event.preventDefault()} onClick={toggleCanvasItalic}>
                I
              </button>
              <button type="button" className="chip-button chip-button-compact" aria-label="Souligné" title="Souligné" onMouseDown={(event) => event.preventDefault()} onClick={toggleCanvasUnderline}>
                <span style={{ textDecoration: "underline" }}>U</span>
              </button>
              <button type="button" className="chip-button chip-button-compact" aria-label="Réduire" title="Réduire" onMouseDown={(event) => event.preventDefault()} onClick={() => adjustCanvasSize("down")}>
                A-
              </button>
              <button type="button" className="chip-button chip-button-compact" aria-label="Agrandir" title="Agrandir" onMouseDown={(event) => event.preventDefault()} onClick={() => adjustCanvasSize("up")}>
                A+
              </button>
              <div className="toolbar-highlight-shell">
                <button
                  type="button"
                  className={`chip-button toolbar-highlight-button ${openMenu === "highlight" || advancedTool === "highlight" ? "toolbar-highlight-button-active" : ""}`}
                  aria-label="Stabilo"
                  title="Stabilo"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => toggleMenu("highlight")}
                >
                  <span className="toolbar-highlight-marker" aria-hidden="true">
                    <span className="toolbar-highlight-marker-tip" />
                    <span className="toolbar-highlight-marker-body" />
                    <span className="toolbar-highlight-marker-line" style={{ backgroundColor: selectedHighlightColor ?? DEFAULT_HIGHLIGHT_TOOL_COLOR }} />
                  </span>
                  <span className="toolbar-highlight-caret" aria-hidden="true">▾</span>
                </button>

                {openMenu === "highlight" ? (
                  <div className="toolbar-highlight-panel" role="menu" aria-label="Choisir une couleur de stabilo">
                    {HIGHLIGHT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`toolbar-highlight-swatch ${(option.value || null) === state.activeHighlightColor && advancedTool === "highlight" ? "toolbar-highlight-swatch-active" : ""}`}
                        aria-label={option.label}
                        title={option.label}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => activateHighlightTool(option.value)}
                      >
                        <span className="toolbar-highlight-swatch-sample" style={option.value ? { backgroundColor: option.value } : undefined} />
                        <span className="toolbar-highlight-swatch-label">{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="editor-local-toolbar-group toolbar-advanced-group" aria-label="Outils avancés">
              <button
                type="button"
                className={`toolbar-shortcut toolbar-shortcut-symbol ${pendingInsertTool?.kind === "text" ? "toolbar-shortcut-active" : ""}`}
                aria-label="Texte"
                title="Ajouter une zone de texte"
                aria-pressed={pendingInsertTool?.kind === "text"}
                onClick={() => togglePendingInsertTool({ kind: "text" })}
              >
                T
              </button>
              <button
                type="button"
                className={`toolbar-shortcut toolbar-shortcut-symbol ${advancedTool === "note" ? "toolbar-shortcut-active" : ""}`}
                title="Petit texte"
                onClick={() => toggleAdvancedToolMode("note")}
              >
                t
              </button>
              <button
                type="button"
                className={`toolbar-shortcut toolbar-shortcut-symbol ${advancedTool === "draw" ? "toolbar-shortcut-active" : ""}`}
                title="Dessin libre"
                aria-label="Dessin libre"
                aria-pressed={advancedTool === "draw"}
                onClick={() => toggleAdvancedToolMode("draw")}
              >
                ✎
              </button>
              <button
                type="button"
                className={`toolbar-shortcut toolbar-shortcut-symbol ${advancedTool === "select" ? "sheet-tool-button-active" : ""}`}
                title="Sélection"
                aria-label="Sélection"
                aria-pressed={advancedTool === "select"}
                onClick={() => toggleAdvancedToolMode("select")}
              >
                <span className="selection-icon" aria-hidden="true" />
              </button>
              {selectedCount > 0 ? (
                <button
                  type="button"
                  className="toolbar-shortcut toolbar-shortcut-symbol"
                  title="Supprimer"
                  onClick={handleHeaderDelete}
                >
                  ×
                </button>
              ) : null}
            </div>
          </div>
        </div>

      </header>

      <section className="editor-stage">
        <div className="sheet-action-bar">
          <div className="sheet-action-group">
            <button type="button" className="toolbar-action ghost tablet-tools-toggle" onClick={() => setIsToolsPanelOpen(true)}>
              Outils
            </button>
            <button type="button" className="toolbar-action ghost" onClick={undoHistory} disabled={historyPast.length === 0}>
              Annuler
            </button>
            <button type="button" className="toolbar-action ghost" onClick={redoHistory} disabled={historyFuture.length === 0}>
              Refaire
            </button>
          </div>
          <div className="sheet-action-group">
            <button type="button" className="toolbar-action primary" onClick={exportPdf} disabled={isExporting !== null}>
              {isExporting === "pdf" ? "Création PDF..." : "PDF"}
            </button>
            <button type="button" className="toolbar-action secondary" onClick={exportPng} disabled={isExporting !== null}>
              {isExporting === "png" ? "Création PNG..." : "PNG"}
            </button>
            <button type="button" className="toolbar-action ghost" onClick={() => window.print()}>
              Imprimer
            </button>
            <button type="button" className="toolbar-action ghost" onClick={resetDocument}>
              Nouveau
            </button>
          </div>
        </div>

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
            <label className="sheet-style-picker">
              <span>Style de feuille</span>
              <select
                className="sheet-style-select"
                value={state.sheetStyle}
                onChange={(event) => setState((current) => ({ ...current, sheetStyle: event.target.value as SheetStyle }))}
                aria-label="Style de feuille"
              >
                {SHEET_STYLE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            className={`document-canvas document-canvas-${state.sheetStyle} ${isCanvasDropActive ? "document-canvas-drop-active" : ""} ${isCanvasInteracting ? "document-canvas-interacting" : ""} ${advancedTool === "draw" || advancedTool === "highlight" ? "document-canvas-draw-mode" : ""} ${advancedTool === "highlight" ? "document-canvas-highlight-mode" : ""} ${pendingInsertTool ? "document-canvas-insert-mode" : ""} ${advancedTool === "draw" || advancedTool === "highlight" || advancedTool === "select" || advancedTool === "move" || pendingInsertTool ? "document-canvas-touch-locked" : ""}`}
            style={{ "--canvas-type-size": `${getDefaultCanvasFontSize(state.sheetStyle)}rem` } as ReactCSSProperties}
            ref={canvasRef}
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            onMouseMove={(event) => updateInsertCursorPreview(event.clientX, event.clientY)}
            onMouseLeave={hideInsertCursorPreview}
            onTouchStart={(event) => handleSurfaceTouchStart(event, event.currentTarget)}
            onMouseDown={(event) => {
              if (pendingInsertTool && event.target === event.currentTarget) {
                event.preventDefault();
                event.stopPropagation();
                const point = getCanvasPoint(event.clientX, event.clientY);
                placePendingInsertToolAt(point.x, point.y);
                return;
              }

              if (canvasQuickMenu) {
                event.preventDefault();
                setCanvasQuickMenu(null);
                return;
              }

              const activeEditingBlockId = editingBlock?.blockId;

              if (activeEditingBlockId && shouldCloseEditingBlock(event.target)) {
                event.preventDefault();
                finishBlockEditing(activeEditingBlockId);
                return;
              }

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
              onMouseMove={(event) => updateInsertCursorPreview(event.clientX, event.clientY)}
              onMouseLeave={hideInsertCursorPreview}
              onMouseDown={(event) => {
                if (pendingInsertTool && event.target === event.currentTarget) {
                  event.preventDefault();
                  event.stopPropagation();
                  const point = getCanvasPoint(event.clientX, event.clientY);
                  placePendingInsertToolAt(point.x, point.y);
                  return;
                }

                if (canvasQuickMenu) {
                  event.preventDefault();
                  setCanvasQuickMenu(null);
                  return;
                }

                const activeEditingBlockId = editingBlock?.blockId;

                if (activeEditingBlockId && shouldCloseEditingBlock(event.target)) {
                  event.preventDefault();
                  finishBlockEditing(activeEditingBlockId);
                  return;
                }

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
              onTouchStart={(event) => handleSurfaceTouchStart(event, event.currentTarget, true)}
              onInput={syncText}
              onFocus={saveSelection}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onPaste={handlePaste}
            />

            {pendingInsertTool?.kind === "shortcut" && insertCursorPreview.visible ? (
              <div
                className="canvas-insert-anchor"
                style={{ left: `${insertCursorPreview.x}px`, top: `${insertCursorPreview.y}px`, color: state.activeColor }}
                aria-hidden="true"
              >
                {renderShortcutGlyph(findShortcutById(pendingInsertTool.shortcutId) ?? { id: pendingInsertTool.shortcutId, label: "?" })}
              </div>
            ) : null}

            {((pendingInsertTool && pendingInsertTool.kind !== "shortcut") || advancedTool === "highlight") && insertCursorPreview.visible ? (
              <div
                className={`canvas-insert-cursor ${advancedTool === "highlight" ? "canvas-insert-cursor-highlighter" : ""} ${pendingInsertTool?.kind === "shortcut" ? "canvas-insert-cursor-symbol" : ""}`}
                style={{
                  left: `${insertCursorPreview.x}px`,
                  top: `${insertCursorPreview.y}px`,
                  color: pendingInsertTool ? state.activeColor : state.activeHighlightColor || DEFAULT_HIGHLIGHT_TOOL_COLOR,
                  ["--highlight-cursor-size" as string]: `${HIGHLIGHT_STROKE_WIDTH}px`
                } as ReactCSSProperties}
                aria-hidden="true"
              >
                {advancedTool === "highlight" ? (
                  <span className="canvas-highlighter-cursor-mark" />
                ) : pendingInsertTool?.kind === "text" ? (
                  "T"
                ) : pendingInsertTool?.kind === "structured" ? (
                  renderStructuredToolGlyph(pendingInsertTool.toolId)
                ) : pendingInsertTool?.kind === "shortcut" ? (
                  renderShortcutGlyph(findShortcutById(pendingInsertTool.shortcutId) ?? { id: pendingInsertTool.shortcutId, label: "?" })
                ) : null}
              </div>
            ) : null}

            {pendingInsertTool ? (
              <div key={`${pendingInsertTool.kind}-${pendingInsertLabel}`} className="canvas-insert-hint" aria-live="polite">
                <span className="canvas-insert-hint-glyph" aria-hidden="true">
                  {pendingInsertTool.kind === "text" ? "T" : pendingInsertTool.kind === "structured" ? renderStructuredToolGlyph(pendingInsertTool.toolId) : renderShortcutGlyph(findShortcutById(pendingInsertTool.shortcutId) ?? { id: pendingInsertTool.shortcutId, label: "?" })}
                </span>
                <span>{`Clique ou touche la feuille pour placer ${pendingInsertLabel.toLowerCase()}.`}</span>
              </div>
            ) : null}

            {state.blocks.map((block) => (
              <article
                key={block.id}
                ref={(node) => {
                  blockNodeRefs.current[block.id] = node;
                }}
                className={`floating-math-block ${selectedBlockIds.includes(block.id) ? "floating-math-block-selected" : ""}`}
                style={{
                  left: `${block.x}px`,
                  top: `${block.y}px`,
                  color: block.color,
                  fontSize: `${block.fontSize}rem`,
                  fontWeight: block.fontWeight,
                  fontStyle: block.fontStyle,
                  textDecoration: block.underline ? "underline" : "none",
                  backgroundColor: block.highlightColor ?? undefined
                }}
                onMouseDown={(event) => {
                  startDragging("block", block.id, block.x, block.y, event);
                }}
                onTouchStart={(event) => {
                  handleTouchDragStart("block", block.id, block.x, block.y, event);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  openEditModal(block.id);
                }}
              >
                {editingBlock?.blockId === block.id ? (
                  renderInlineBlockEditor(block)
                ) : (
                  renderInteractiveMathPreview(block)
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
                style={{
                  left: `${symbol.x}px`,
                  top: `${symbol.y}px`,
                  color: symbol.color,
                  fontSize: `${symbol.fontSize}rem`,
                  fontWeight: symbol.fontWeight,
                  fontStyle: symbol.fontStyle,
                  textDecoration: symbol.underline ? "underline" : "none",
                  backgroundColor: symbol.highlightColor ?? undefined
                }}
                onMouseDown={(event) => {
                  startDragging("symbol", symbol.id, symbol.x, symbol.y, event);
                }}
                onTouchStart={(event) => {
                  handleTouchDragStart("symbol", symbol.id, symbol.x, symbol.y, event);
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
                className={`floating-text-box ${textBox.variant === "note" ? "floating-text-box-note" : ""} ${selectedTextBoxIds.includes(textBox.id) ? "floating-text-box-selected" : ""}`}
                style={{
                  left: `${textBox.x}px`,
                  top: `${textBox.y}px`,
                  width: `${textBox.width}px`,
                  color: textBox.color,
                  fontSize: `${textBox.fontSize}rem`,
                  fontWeight: textBox.fontWeight,
                  fontStyle: textBox.fontStyle,
                  textDecoration: textBox.underline ? "underline" : "none",
                  backgroundColor: textBox.highlightColor ?? undefined
                }}
                onMouseDown={(event) => {
                  if (editingTextBoxId === textBox.id) {
                    return;
                  }

                  startDragging("textBox", textBox.id, textBox.x, textBox.y, event);
                }}
                onTouchStart={(event) => {
                  handleTouchDragStart("textBox", textBox.id, textBox.x, textBox.y, event, editingTextBoxId === textBox.id);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  beginTextBoxEditing(textBox.id);
                }}
              >
                {editingTextBoxId === textBox.id ? (
                  <>
                    <div className="floating-text-shortcuts" onMouseDown={(event) => event.stopPropagation()}>
                      {textBoxShortcuts.map((shortcut) => (
                        <button
                          key={shortcut.id}
                          type="button"
                          className="floating-text-shortcut"
                          title={shortcut.hint}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => insertIntoEditingTextBox(textBox.id, shortcut.content)}
                        >
                          {renderShortcutGlyph(shortcut)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="floating-text-input"
                      value={textBox.text}
                      placeholder="Écris ici"
                      onMouseDown={(event) => {
                        setCanvasQuickMenu(null);
                        event.stopPropagation();
                        selectSingleTextBox(textBox.id);
                      }}
                      onFocus={() => {
                        selectSingleTextBox(textBox.id);
                      }}
                      onChange={(event) => {
                        const nextText = event.target.value;
                        const minimumWidth = textBox.variant === "note" ? 56 : 100;

                        updateTextBox(textBox.id, {
                          text: nextText,
                          width: Math.max(minimumWidth, getTextBoxWidth(nextText))
                        });
                      }}
                      onBlur={(event) => {
                        if (!event.currentTarget.value.trim()) {
                          removeTextBox(textBox.id);
                          setEditingTextBoxId(null);
                          scheduleTransientHistoryCommit("edit");
                          return;
                        }

                        updateTextBox(textBox.id, {
                          text: event.currentTarget.value.trim(),
                          width: Math.max(textBox.variant === "note" ? 56 : 36, getTextBoxWidth(event.currentTarget.value))
                        });
                        setEditingTextBoxId(null);
                        clearFloatingSelection();
                        scheduleTransientHistoryCommit("edit");
                      }}
                    />
                  </>
                ) : (
                  <div className="floating-text-content">
                    {textBox.text || "Zone de texte"}
                  </div>
                )}
              </article>
            ))}

            <svg
              className={`canvas-draw-layer ${advancedTool === "draw" || advancedTool === "highlight" ? "canvas-draw-layer-active" : ""}`}
              width="100%"
              height="100%"
              onMouseMove={(event) => {
                if (advancedTool === "highlight") {
                  updateInsertCursorPreview(event.clientX, event.clientY);
                }
              }}
              onMouseLeave={() => {
                if (advancedTool === "highlight") {
                  hideInsertCursorPreview();
                }
              }}
              onMouseDown={(event) => {
                if (advancedTool !== "draw" && advancedTool !== "highlight") {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();

                if (editingBlock?.blockId) {
                  finishBlockEditing(editingBlock.blockId);
                }

                if (editingTextBoxId) {
                  closeFloatingTextEditing();
                }

                beginFreehandDrawing(event.clientX, event.clientY);
              }}
              onTouchStart={(event) => {
                if ((advancedTool !== "draw" && advancedTool !== "highlight") || event.touches.length === 0) {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();

                if (editingBlock?.blockId) {
                  finishBlockEditing(editingBlock.blockId);
                }

                if (editingTextBoxId) {
                  closeFloatingTextEditing();
                }

                const touch = event.touches[0];
                beginFreehandDrawing(touch.clientX, touch.clientY);
              }}
            >
              {state.strokes.map((stroke) => {
                const strokeBounds = getStrokeBounds(stroke.points);

                return (
                  <g
                    key={stroke.id}
                    ref={(node) => {
                      strokeNodeRefs.current[stroke.id] = node;
                    }}
                    className={`canvas-draw-stroke-group ${selectedStrokeIds.includes(stroke.id) ? "canvas-draw-stroke-group-selected" : ""}`}
                    onMouseDown={(event) => {
                      if (advancedTool === "draw" || advancedTool === "highlight") {
                        return;
                      }

                      startDragging("stroke", stroke.id, strokeBounds.x, strokeBounds.y, event);
                    }}
                    onTouchStart={(event) => {
                      handleTouchDragStart("stroke", stroke.id, strokeBounds.x, strokeBounds.y, event, advancedTool === "draw" || advancedTool === "highlight");
                    }}
                  >
                    <path className="canvas-draw-hit" d={createStrokePath(stroke.points)} fill="none" />
                    <path className="canvas-draw-path" d={createStrokePath(stroke.points)} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeOpacity={stroke.opacity} />
                    {selectedStrokeIds.includes(stroke.id) ? (
                      <path className="canvas-draw-path canvas-draw-path-selected" d={createStrokePath(stroke.points)} fill="none" stroke="rgba(217, 119, 69, 0.8)" strokeWidth={5.2} />
                    ) : null}
                  </g>
                );
              })}
              {draftStroke && draftStroke.length >= 2 ? (
                <path
                  className="canvas-draw-path canvas-draw-path-draft"
                  d={createStrokePath(draftStroke)}
                  fill="none"
                  stroke={draftStrokeStyleRef.current.color}
                  strokeWidth={draftStrokeStyleRef.current.width}
                  strokeOpacity={draftStrokeStyleRef.current.opacity}
                />
              ) : null}
            </svg>

            {snapGuides.x !== null ? (
              <div className="canvas-snap-guide canvas-snap-guide-vertical" style={{ left: `${snapGuides.x}px` }} aria-hidden="true" />
            ) : null}

            {snapGuides.y !== null ? (
              <div className="canvas-snap-guide canvas-snap-guide-horizontal" style={{ top: `${snapGuides.y}px` }} aria-hidden="true" />
            ) : null}

            {multiSelectionMenuPosition ? (
              <div
                className="canvas-quick-menu canvas-selection-menu"
                style={{ left: `${multiSelectionMenuPosition.x}px`, top: `${multiSelectionMenuPosition.y}px` }}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="canvas-quick-action canvas-selection-action"
                  aria-label="Aligner"
                  title="Aligner"
                  onClick={alignSelectedItems}
                >
                  <span className="align-grid-icon" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
                <button
                  type="button"
                  className="canvas-quick-action canvas-selection-action"
                  aria-label="Supprimer"
                  title="Supprimer"
                  onClick={removeSelectedItems}
                >
                  ×
                </button>
              </div>
            ) : null}

            {selectedTextBoxMenuPosition ? (
              <div
                className="canvas-quick-menu canvas-text-format-menu"
                style={{ left: `${selectedTextBoxMenuPosition.x}px`, top: `${selectedTextBoxMenuPosition.y}px` }}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="canvas-quick-close"
                  aria-label="Fermer le menu"
                  title="Fermer"
                  onClick={clearFloatingSelection}
                >
                  ×
                </button>
                <button type="button" className="canvas-quick-action canvas-text-format-action" aria-label="Gras" title="Gras" onClick={toggleCanvasBold}>
                  B
                </button>
                <button type="button" className="canvas-quick-action canvas-text-format-action" aria-label="Italique" title="Italique" onClick={toggleCanvasItalic}>
                  I
                </button>
                <button type="button" className="canvas-quick-action canvas-text-format-action" aria-label="Souligné" title="Souligné" onClick={toggleCanvasUnderline}>
                  <span style={{ textDecoration: "underline" }}>U</span>
                </button>
                <button type="button" className="canvas-quick-action canvas-text-format-action" aria-label="Réduire" title="Réduire" onClick={() => adjustCanvasSize("down")}>
                  A-
                </button>
                <button type="button" className="canvas-quick-action canvas-text-format-action" aria-label="Agrandir" title="Agrandir" onClick={() => adjustCanvasSize("up")}>
                  A+
                </button>
                {HIGHLIGHT_OPTIONS.filter((option) => option.value).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`canvas-quick-action canvas-text-highlight-chip ${(option.value || null) === selectedHighlightColor ? "canvas-text-highlight-chip-active" : ""}`}
                    aria-label={`Surlignage ${option.label}`}
                    title={`Surlignage ${option.label}`}
                    onClick={() => applyCanvasHighlight((option.value || null) === selectedHighlightColor ? "" : option.value)}
                  >
                    <span className="canvas-text-highlight-sample" style={{ backgroundColor: option.value }} />
                  </button>
                ))}
              </div>
            ) : null}

            {canvasQuickMenu ? (
              <>
                <div
                  className="canvas-quick-anchor"
                  style={{ left: `${canvasQuickMenu.clickX}px`, top: `${canvasQuickMenu.clickY}px` }}
                  aria-hidden="true"
                />
                <div
                  className="canvas-quick-menu"
                  style={{ left: `${canvasQuickMenu.x}px`, top: `${canvasQuickMenu.y}px` }}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="canvas-quick-close"
                    aria-label="Fermer le menu"
                    title="Fermer"
                    onClick={() => setCanvasQuickMenu(null)}
                  >
                    ×
                  </button>
                  <button type="button" className="canvas-quick-action" onClick={() => createTextBoxAt(canvasQuickMenu.clickX, canvasQuickMenu.clickY)}>
                    T
                  </button>
                  {activeStructuredTools.map((tool) => (
                    <button
                      key={`quick-${tool.id}`}
                      type="button"
                      className="canvas-quick-action"
                      title={tool.label}
                      onClick={() => createStructuredToolAt(tool.id, canvasQuickMenu.clickX, canvasQuickMenu.clickY)}
                    >
                      {renderStructuredToolGlyph(tool.id)}
                    </button>
                  ))}
                  {activeInlineShortcuts
                    .flatMap((group) => group.items)
                    .slice(0, 6)
                    .map((shortcut) => (
                      <button
                      key={`quick-symbol-${shortcut.id}`}
                      type="button"
                      className="canvas-quick-action"
                      title={shortcut.hint}
                      onClick={() => createShortcutSymbolAt(shortcut.id, canvasQuickMenu.clickX, canvasQuickMenu.clickY)}
                    >
                      {renderShortcutGlyph(shortcut)}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

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

      {confirmResetState ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirmResetState(null)}>
          <section className="block-modal" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="block-modal-head">
              <div>
                <p className="card-kind">Confirmation</p>
                <h2 id="reset-modal-title">Créer un nouveau document ?</h2>
                <p className="toolbar-helper">La feuille actuelle sera effacée et remplacée par un nouveau devoir.</p>
              </div>
              <div className="card-actions">
                <button type="button" className="small-action" onClick={() => setConfirmResetState(null)}>
                  Annuler
                </button>
                <button type="button" className="small-action primary-inline-action" onClick={confirmResetDocument}>
                  Nouveau
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
