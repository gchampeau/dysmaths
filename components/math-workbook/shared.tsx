import {
  type CSSProperties as ReactCSSProperties,
  type ReactNode
} from "react";
import {type AppLocale} from "@/i18n/routing";
export type StudyMode = "middleSchool" | "highSchool";
export type SheetStyle = "seyes" | "large-grid" | "small-grid" | "lined" | "blank";
export type StructuredTool = "fraction" | "addition" | "subtraction" | "multiplication" | "division" | "power" | "root";
export type UtilityMenu = "highlight" | "settings" | "install" | null;
export type GeometryTool = "point" | "segment" | "line" | "ray" | "circle" | "measure" | "protractor" | "compass";

export type FractionBlock = {
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

export type DivisionBlock = {
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

export type AdditionBlock = {
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

export type SubtractionBlock = {
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

export type MultiplicationBlock = {
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

export type PowerBlock = {
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

export type RootBlock = {
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

export type FloatingSymbol = {
  id: string;
  type: "symbol";
  label: string;
  content: string;
  kind?: "text" | "sum" | "integral";
  size?: number;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
};

export type HeaderField = "fullName" | "className" | "date";

export type FloatingTextBox = {
  id: string;
  type: "textBox";
  variant?: "default" | "note";
  notation?: "plain" | "angle";
  hidden?: boolean;
  headerField?: HeaderField;
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

export type FreehandPoint = {
  x: number;
  y: number;
};

export type FreehandStroke = {
  id: string;
  color: string;
  width: number;
  opacity: number;
  points: FreehandPoint[];
};

export type GeometryPointShape = {
  id: string;
  type: "geometry";
  kind: "point";
  xMm: number;
  yMm: number;
  label: string;
  color: string;
  strokeWidthMm: number;
};

export type GeometryLinearShape = {
  id: string;
  type: "geometry";
  kind: "segment" | "line" | "ray" | "graduated-line";
  axMm: number;
  ayMm: number;
  bxMm: number;
  byMm: number;
  startValue?: number;
  sections?: number;
  color: string;
  strokeWidthMm: number;
};

export type GeometryCircleShape = {
  id: string;
  type: "geometry";
  kind: "circle";
  cxMm: number;
  cyMm: number;
  radiusMm: number;
  color: string;
  strokeWidthMm: number;
};

export type GeometryArcShape = {
  id: string;
  type: "geometry";
  kind: "arc";
  cxMm: number;
  cyMm: number;
  radiusMm: number;
  startAngle: number;
  endAngle: number;
  color: string;
  strokeWidthMm: number;
};

export type GraduatedLineModalShape = GeometryLinearShape & {
  kind: "graduated-line";
  sections: number;
};

export type MathBlock = FractionBlock | AdditionBlock | SubtractionBlock | MultiplicationBlock | DivisionBlock | PowerBlock | RootBlock;
export type GeometryShape = GeometryPointShape | GeometryLinearShape | GeometryCircleShape | GeometryArcShape | GraduatedLineModalShape;

export type WriterState = {
  schemaVersion: number;
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
  geometry: GeometryShape[];
};

export type ModalState =
  | {
      mode: "insert" | "edit";
      block: MathBlock;
    }
  | null;

export type GraduatedLineDraft = {
  start: GeometryPointCoordinate;
  current: GeometryPointCoordinate;
};

export type GraduatedLineModalState = {
  start: GeometryPointCoordinate;
  end: GeometryPointCoordinate;
  startValue: string;
  sections: string;
} | null;

export type GraduatedLineModalSettings = {
  startValue: string;
  sections: string;
} | null;

export type ConfirmResetState = {
  open: boolean;
} | null;

export type InlineShortcutItem = {
  id: string;
  label: string;
  hint: string;
  content: string;
  modes: StudyMode[];
};

export type InlineShortcutGroup = {
  name: string;
  items: InlineShortcutItem[];
};

export type DragState = {
  itemType: "block" | "symbol" | "textBox" | "stroke" | "geometry";
  itemId: string;
  pointerOffsetX: number;
  pointerOffsetY: number;
  pointerOriginX: number;
  pointerOriginY: number;
  groupBlockPositions: Array<{ id: string; x: number; y: number }>;
  groupSymbolPositions: Array<{ id: string; x: number; y: number }>;
  groupTextBoxPositions: Array<{ id: string; x: number; y: number }>;
  groupStrokePositions: Array<{ id: string; x: number; y: number; points: FreehandPoint[] }>;
  groupGeometryShapes: GeometryShape[];
  anchorX: number;
  anchorY: number;
} | null;

export type SelectionRect = {
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
} | null;

export type PendingSelection = {
  originX: number;
  originY: number;
  started: boolean;
} | null;

export type ToolbarDragPayload =
  | { kind: "structured"; toolId: StructuredTool }
  | { kind: "shortcut"; shortcutId: string };

export type PendingInsertTool =
  | { kind: "text" }
  | { kind: "structured"; toolId: StructuredTool }
  | { kind: "shortcut"; shortcutId: string }
  | null;

export type InsertCursorPreview = {
  x: number;
  y: number;
  visible: boolean;
};

export type ToolbarDragMeta = {
  offsetX: number;
  offsetY: number;
  previewNode: HTMLElement | null;
};

export type EditingBlockState =
  | {
      blockId: string;
      field: string;
    }
  | null;

export type CanvasQuickMenu =
  | {
      left?: number;
      right?: number;
      top?: number;
      bottom?: number;
      clickX: number;
      clickY: number;
    }
  | null;

export type FloatingTextShortcutLayout = {
  className: string;
  style: ReactCSSProperties;
};

export type DefaultDocumentLabels = {
  title: string;
  fullName: string;
  className: string;
  date: string;
};

export type WorkbookTranslator = (key: string, values?: Record<string, string | number>) => string;

export type ColorOption = {
  id: "ink" | "orange" | "blue" | "green" | "pink";
  label: string;
  value: string;
};

export type HighlightOption = {
  id: "yellow" | "green" | "blue" | "pink";
  label: string;
  value: string;
};

export type SheetStyleOption = {
  id: SheetStyle;
  label: string;
};

export type GeometryToolOption = {
  id: GeometryTool;
  label: string;
  hint: string;
  glyph: string;
};

export type StructuredToolOption = {
  id: StructuredTool;
  label: string;
  hint: string;
  modes: StudyMode[];
};

export type GeometryPointCoordinate = {
  xMm: number;
  yMm: number;
};

export type GeometryDraft = {
  tool: GeometryTool;
  start: GeometryPointCoordinate;
  current: GeometryPointCoordinate;
};

export type GeometryDraftIndicator = {
  x: number;
  y: number;
  label: string;
};

export type GeometryMeasurement = {
  start: GeometryPointCoordinate;
  end: GeometryPointCoordinate;
};

export type GeometryProtractorDraft = {
  firstPoint: GeometryPointCoordinate;
  vertex: GeometryPointCoordinate | null;
  current: GeometryPointCoordinate;
};

export type GeometryAngleMeasurement = {
  vertex: GeometryPointCoordinate;
  baseline: GeometryPointCoordinate;
  end: GeometryPointCoordinate;
};

export type GeometryCompassDraft = {
  phase: "radius" | "arc";
  center: GeometryPointCoordinate;
  startPoint: GeometryPointCoordinate | null;
  radiusMm: number | null;
  startAngle: number | null;
  currentAngle: number | null;
  accumulatedSweep: number;
  current: GeometryPointCoordinate;
};

export type SnapGuides = {
  x: number | null;
  y: number | null;
};

export type AdvancedTool = "select" | "move" | "note" | "draw" | "highlight" | "graduated-line" | null;
export type SymbolResizeHandle = "nw" | "se";
export type SymbolResizeState = {
  symbolId: string;
  handle: SymbolResizeHandle;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startSize: number;
};

export const STORAGE_KEY = "maths-facile-free-layout-v1";
export const PROFILE_STORAGE_KEY = "dysmaths-profiles-v1";
export const WRITER_STATE_SCHEMA_VERSION = 2;
export const FLOATING_TEXTBOX_Y_OFFSET = 10;
export const CANVAS_QUICK_MENU_OFFSET_X = 30;
export const MAX_HISTORY_STEPS = 80;
export const DEFAULT_CANVAS_FONT_SIZE_REM = 1.18;
export const PAPER_LINE_STEP_REM = 2.95;
export const CANVAS_GRID_LEFT_REM = 4.8;
export const CANVAS_GRID_TOP_REM = PAPER_LINE_STEP_REM;
export const MAX_SNAP_THRESHOLD_PX = 10;
export const CANVAS_LINE_BASELINE_OFFSET_PX = 5;
export const DEFAULT_ACTIVE_COLOR = "#1f2d3d";
export const DEFAULT_HIGHLIGHT_TOOL_COLOR = "rgb(255 226 92)";
export const DEFAULT_SUM_SYMBOL_SIZE = 54;
export const DEFAULT_INTEGRAL_SYMBOL_SIZE = 60;
export const DEFAULT_GEOMETRY_STROKE_WIDTH_MM = 0.55;
export const GEOMETRY_POINT_RADIUS_MM = 1.15;
export const GEOMETRY_HIT_RADIUS_PX = 14;
export const GEOMETRY_LINE_EXTENT_PX = 2400;
export const HIGHLIGHT_STROKE_OPACITY = 0.4;
export const HIGHLIGHT_STROKE_WIDTH = 10;
export const MM_TO_PX = 96 / 25.4;
export const SEYES_MAJOR_MM = 8;
export const SEYES_MINOR_MM = 2;
export const SMALL_GRID_MM = 5;
export const SEYES_MARGIN_CM = 4;

export function mmToPx(mm: number) {
  return mm * MM_TO_PX;
}

export function cmToPx(cm: number) {
  return mmToPx(cm * 10);
}

export function pxToMm(px: number) {
  return px / MM_TO_PX;
}

export function getDefaultCanvasFontSize(sheetStyle: SheetStyle) {
  switch (sheetStyle) {
    case "seyes":
    case "lined":
      return 1.02;
    case "small-grid":
      return 0.96;
    case "large-grid":
    case "blank":
    default:
      return DEFAULT_CANVAS_FONT_SIZE_REM;
  }
}

export function getDefaultNoteFontSize(sheetStyle: SheetStyle) {
  return Math.max(0.84, Number((getDefaultCanvasFontSize(sheetStyle) - 0.18).toFixed(2)));
}

export const DEFAULT_TEXT_HTML = "";
export const DEFAULT_DOCUMENT_LABELS: DefaultDocumentLabels = {
  title: "My math assignment",
  fullName: "Full name:",
  className: "Class:",
  date: "Date:"
};

export type HeaderFieldPosition = {
  x: number;
  y: number;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  preferredSheetStyle: SheetStyle;
  preferredMode: StudyMode;
  showName: boolean;
  showClass: boolean;
  showDate: boolean;
  highlightOnHover: boolean;
  headerPositions?: Record<HeaderField, HeaderFieldPosition>;
};

export type ProfileStore = {
  profiles: UserProfile[];
  activeProfileId: string | null;
};

export function parseStoredProfiles(raw: string): ProfileStore | null {
  try {
    const parsed = JSON.parse(raw) as ProfileStore;

    if (!Array.isArray(parsed.profiles)) {
      return null;
    }

    const profiles = parsed.profiles
      .filter(
        (p) =>
          typeof p.id === "string" &&
          typeof p.firstName === "string" &&
          typeof p.lastName === "string" &&
          typeof p.className === "string" &&
          typeof p.preferredSheetStyle === "string" &&
          typeof p.preferredMode === "string"
      )
      .map((p): UserProfile => ({
        ...p,
        showName: typeof p.showName === "boolean" ? p.showName : true,
        showClass: typeof p.showClass === "boolean" ? p.showClass : true,
        showDate: typeof p.showDate === "boolean" ? p.showDate : true,
        highlightOnHover: typeof p.highlightOnHover === "boolean" ? p.highlightOnHover : true
      }));

    return {
      profiles,
      activeProfileId: typeof parsed.activeProfileId === "string" ? parsed.activeProfileId : null
    };
  } catch {
    return null;
  }
}

export function formatDateForLocale(date: Date, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export function getDocumentLabelsForProfile(
  profile: UserProfile | null,
  defaultLabels: DefaultDocumentLabels,
  locale: AppLocale
): DefaultDocumentLabels {
  if (!profile) {
    return defaultLabels;
  }

  return {
    title: defaultLabels.title,
    fullName: `${profile.firstName} ${profile.lastName}`,
    className: profile.className,
    date: formatDateForLocale(new Date(), locale)
  };
}

export function getDefaultSheetStyleForLocale(locale: AppLocale): SheetStyle {
  switch (locale) {
    case "fr":
      return "seyes";
    case "es":
      return "small-grid";
    case "en":
    default:
      return "lined";
  }
}

export function createDefaultHeaderTextBoxes(sheetStyle: SheetStyle, labels: DefaultDocumentLabels = DEFAULT_DOCUMENT_LABELS): FloatingTextBox[] {
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
      headerField: "fullName" as const,
      text: labels.fullName,
      color: DEFAULT_ACTIVE_COLOR,
      fontSize,
      fontWeight: 500,
      fontStyle: "normal",
      underline: false,
      highlightColor: null,
      x: Math.round(startX),
      y: Math.round(firstBaseline - fieldHeight + 5),
      width: getTextBoxWidth(labels.fullName, fontSize)
    },
    {
      id: createId("text"),
      type: "textBox",
      variant: "default",
      headerField: "className" as const,
      text: labels.className,
      color: DEFAULT_ACTIVE_COLOR,
      fontSize,
      fontWeight: 500,
      fontStyle: "normal",
      underline: false,
      highlightColor: null,
      x: Math.round(startX),
      y: Math.round(secondBaseline - fieldHeight + 5),
      width: getTextBoxWidth(labels.className, fontSize)
    },
    {
      id: createId("text"),
      type: "textBox",
      variant: "default",
      headerField: "date" as const,
      text: labels.date,
      color: DEFAULT_ACTIVE_COLOR,
      fontSize,
      fontWeight: 500,
      fontStyle: "normal",
      underline: false,
      highlightColor: null,
      x: Math.round(dateX),
      y: Math.round(secondBaseline - fieldHeight + 5),
      width: getTextBoxWidth(labels.date, fontSize)
    }
  ];
}

export function createDefaultState(sheetStyle: SheetStyle = "seyes", labels: DefaultDocumentLabels = DEFAULT_DOCUMENT_LABELS): WriterState {
  return {
    schemaVersion: WRITER_STATE_SCHEMA_VERSION,
    title: labels.title,
    mode: "middleSchool",
    sheetStyle,
    activeColor: DEFAULT_ACTIVE_COLOR,
    activeHighlightColor: "rgba(255, 226, 92, 0.58)",
    textHtml: DEFAULT_TEXT_HTML,
    blocks: [],
    symbols: [],
    textBoxes: createDefaultHeaderTextBoxes(sheetStyle, labels),
    strokes: [],
    geometry: []
  };
}

export const COLOR_OPTION_VALUES = [
  { id: "ink", value: "#1f2d3d" },
  { id: "orange", value: "#d56f3c" },
  { id: "blue", value: "#2169b3" },
  { id: "green", value: "#2f8f57" },
  { id: "pink", value: "#b54d7a" }
] as const;

export const HIGHLIGHT_OPTION_VALUES = [
  { id: "yellow", value: "rgb(255 226 92)" },
  { id: "green", value: "rgb(144 219 171)" },
  { id: "blue", value: "rgb(160 208 255)" },
  { id: "pink", value: "rgb(255 184 210)" }
] as const;

export const GRADUATED_LINE_PRESET_VALUES = [2, 5, 10, 20, 40] as const;

export const SHEET_STYLE_OPTION_IDS = [
  { id: "seyes", key: "seyes" },
  { id: "large-grid", key: "largeGrid" },
  { id: "small-grid", key: "smallGrid" },
  { id: "lined", key: "lined" },
  { id: "blank", key: "blank" }
] as const;

export const GEOMETRY_TOOL_DEFINITIONS = [
  { id: "point", key: "point", glyph: "•" },
  { id: "segment", key: "segment", glyph: "AB" },
  { id: "line", key: "line", glyph: "↔" },
  { id: "ray", key: "ray", glyph: "→" },
  { id: "circle", key: "circle", glyph: "◯" },
  { id: "compass", key: "compass", glyph: "⌒" },
  { id: "measure", key: "measure", glyph: "cm" },
  { id: "protractor", key: "protractor", glyph: "protractor" }
] as const;

export const STRUCTURED_TOOL_DEFINITIONS = [
  { id: "fraction", key: "fraction", modes: ["middleSchool", "highSchool"] as StudyMode[] },
  { id: "addition", key: "addition", modes: ["middleSchool", "highSchool"] as StudyMode[] },
  { id: "subtraction", key: "subtraction", modes: ["middleSchool", "highSchool"] as StudyMode[] },
  { id: "multiplication", key: "multiplication", modes: ["middleSchool", "highSchool"] as StudyMode[] },
  { id: "division", key: "division", modes: ["middleSchool", "highSchool"] as StudyMode[] },
  { id: "power", key: "power", modes: ["middleSchool", "highSchool"] as StudyMode[] },
  { id: "root", key: "root", modes: ["middleSchool", "highSchool"] as StudyMode[] }
] as const;

export const INLINE_SHORTCUT_DEFINITIONS: Array<{
  nameKey: "essentials" | "geometry" | "highSchool" | "variables";
  items: Array<InlineShortcutItem & {hintKey: keyof ReturnType<typeof createWorkbookUi>["shortcutHints"]}>;
}> = [
  {
    nameKey: "essentials",
    items: [
      { id: "equal", label: "=", hintKey: "equal", hint: "", content: " = ", modes: ["middleSchool", "highSchool"] },
      { id: "neq", label: "≠", hintKey: "neq", hint: "", content: " ≠ ", modes: ["middleSchool", "highSchool"] },
      { id: "lt", label: "<", hintKey: "lt", hint: "", content: " < ", modes: ["middleSchool", "highSchool"] },
      { id: "gt", label: ">", hintKey: "gt", hint: "", content: " > ", modes: ["middleSchool", "highSchool"] },
      { id: "leq", label: "≤", hintKey: "leq", hint: "", content: " ≤ ", modes: ["middleSchool", "highSchool"] },
      { id: "geq", label: "≥", hintKey: "geq", hint: "", content: " ≥ ", modes: ["middleSchool", "highSchool"] },
      { id: "minus", label: "-", hintKey: "minus", hint: "", content: " - ", modes: ["middleSchool", "highSchool"] },
      { id: "times", label: "×", hintKey: "times", hint: "", content: " × ", modes: ["middleSchool", "highSchool"] },
      { id: "div", label: "÷", hintKey: "div", hint: "", content: " ÷ ", modes: ["middleSchool", "highSchool"] },
      { id: "lbracket", label: "[", hintKey: "lbracket", hint: "", content: "[", modes: ["middleSchool", "highSchool"] },
      { id: "rbracket", label: "]", hintKey: "rbracket", hint: "", content: "]", modes: ["middleSchool", "highSchool"] },
      { id: "percent", label: "%", hintKey: "percent", hint: "", content: "%", modes: ["middleSchool", "highSchool"] },
      { id: "pi", label: "π", hintKey: "pi", hint: "", content: "π", modes: ["middleSchool", "highSchool"] }
    ]
  },
  {
    nameKey: "geometry",
    items: [
      { id: "angle", label: "∠ABC", hintKey: "angle", hint: "", content: "∠ABC", modes: ["middleSchool", "highSchool"] },
      { id: "parallel", label: "∥", hintKey: "parallel", hint: "", content: " ∥ ", modes: ["middleSchool", "highSchool"] },
      { id: "perpendicular", label: "⟂", hintKey: "perpendicular", hint: "", content: " ⟂ ", modes: ["middleSchool", "highSchool"] },
      { id: "degree", label: "°", hintKey: "degree", hint: "", content: "°", modes: ["middleSchool", "highSchool"] }
    ]
  },
  {
    nameKey: "highSchool",
    items: [
      { id: "sum", label: "Σ", hintKey: "sum", hint: "", content: "Σ(k=1→n)", modes: ["highSchool"] },
      { id: "integral", label: "∫", hintKey: "integral", hint: "", content: "∫[a;b]", modes: ["highSchool"] }
    ]
  },
  {
    nameKey: "variables",
    items: [
      { id: "scriptX", label: "𝓍", hintKey: "scriptX", hint: "", content: "𝓍", modes: ["middleSchool", "highSchool"] },
      { id: "scriptY", label: "𝓎", hintKey: "scriptY", hint: "", content: "𝓎", modes: ["middleSchool", "highSchool"] },
      { id: "scriptZ", label: "𝓏", hintKey: "scriptZ", hint: "", content: "𝓏", modes: ["middleSchool", "highSchool"] }
    ]
  }
];

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function renderShortcutGlyph(shortcut: Pick<InlineShortcutItem, "id" | "label">) {
  return (
    <span className={`math-shortcut-glyph ${shortcut.id === "parallel" ? "math-shortcut-glyph-parallel" : ""}`}>
      {shortcut.label}
    </span>
  );
}

export function createWorkbookUi(t: WorkbookTranslator) {
  const colorOptions: ColorOption[] = COLOR_OPTION_VALUES.map((option) => ({
    ...option,
    label: t(`colors.${option.id}`)
  }));
  const highlightOptions: HighlightOption[] = HIGHLIGHT_OPTION_VALUES.map((option) => ({
    ...option,
    label: t(`highlights.${option.id}`)
  }));
  const sheetStyleOptions: SheetStyleOption[] = SHEET_STYLE_OPTION_IDS.map((option) => ({
    id: option.id,
    label: t(`sheetStyles.${option.key}`)
  }));
  const geometryTools: GeometryToolOption[] = GEOMETRY_TOOL_DEFINITIONS.map((tool) => ({
    id: tool.id,
    glyph: tool.glyph,
    label: t(`geometryTools.${tool.key}.label`),
    hint: t(`geometryTools.${tool.key}.hint`)
  }));
  const structuredTools: StructuredToolOption[] = STRUCTURED_TOOL_DEFINITIONS.map((tool) => ({
    id: tool.id,
    modes: tool.modes,
    label: t(`structuredTools.${tool.key}.label`),
    hint: t(`structuredTools.${tool.key}.hint`)
  }));
  const shortcutHints = {
    equal: t("shortcuts.equal"),
    neq: t("shortcuts.neq"),
    lt: t("shortcuts.lt"),
    gt: t("shortcuts.gt"),
    leq: t("shortcuts.leq"),
    geq: t("shortcuts.geq"),
    minus: t("shortcuts.minus"),
    times: t("shortcuts.times"),
    div: t("shortcuts.div"),
    lbracket: t("shortcuts.lbracket"),
    rbracket: t("shortcuts.rbracket"),
    percent: t("shortcuts.percent"),
    pi: t("shortcuts.pi"),
    angle: t("shortcuts.angle"),
    parallel: t("shortcuts.parallel"),
    perpendicular: t("shortcuts.perpendicular"),
    degree: t("shortcuts.degree"),
    sum: t("shortcuts.sum"),
    integral: t("shortcuts.integral"),
    scriptX: t("shortcuts.scriptX"),
    scriptY: t("shortcuts.scriptY"),
    scriptZ: t("shortcuts.scriptZ")
  } as const;
  const inlineShortcutGroups: InlineShortcutGroup[] = INLINE_SHORTCUT_DEFINITIONS.map((group) => ({
    name: t(`shortcutGroups.${group.nameKey}`),
    items: group.items.map((item) => ({
      ...item,
      hint: shortcutHints[item.hintKey]
    }))
  }));

  return {
    defaultDocumentLabels: {
      title: t("document.defaultTitle"),
      fullName: t("document.defaultFullName"),
      className: t("document.defaultClass"),
      date: t("document.defaultDate")
    } satisfies DefaultDocumentLabels,
    colorOptions,
    highlightOptions,
    sheetStyleOptions,
    geometryTools,
    structuredTools,
    inlineShortcutGroups,
    shortcutHints,
    blockTitles: {
      fraction: t("blockTitles.fraction"),
      addition: t("blockTitles.addition"),
      subtraction: t("blockTitles.subtraction"),
      multiplication: t("blockTitles.multiplication"),
      division: t("blockTitles.division"),
      power: t("blockTitles.power"),
      root: t("blockTitles.root"),
      default: t("blockTitles.default")
    }
  };
}

export function renderStructuredToolGlyph(toolId: StructuredTool) {
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
    return "aⁿ";
  }

  return "√";
}

export function renderGeometryToolGlyph(tool: Pick<GeometryToolOption, "id" | "glyph">) {
  if (tool.id !== "protractor") {
    return tool.glyph;
  }

  return (
    <span className="geometry-tool-protractor-glyph" aria-hidden="true">
      <svg viewBox="0 0 100 60" focusable="false">
        <path d="M10 50A40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M50 50L50 18" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M26 50L31 36" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M74 50L69 36" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function renderGraduatedLineGlyph() {
  return (
    <span className="geometry-tool-graduated-line-glyph" aria-hidden="true">
      <svg viewBox="0 0 100 40" focusable="false">
        <path d="M14 20H86" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 28V10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M44 30V8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M64 28V10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M84 30V6" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function renderSumSymbolSvg(size: number) {
  const strokeWidth = Math.max(4, Math.round(size * 0.08));

  return (
    <svg viewBox="0 0 100 120" aria-hidden="true" focusable="false">
      <path
        d="M72 18H28L57 60L28 102H72"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function renderIntegralSymbolSvg(size: number) {
  const strokeWidth = Math.max(4, Math.round(size * 0.075));

  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" focusable="false">
      <path
        d="M60 16C48 16 40 25 40 38V102C40 116 32 126 20 126"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

let _textMeasureCtx: CanvasRenderingContext2D | null = null;
function getTextMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!_textMeasureCtx) _textMeasureCtx = document.createElement("canvas").getContext("2d");
  return _textMeasureCtx;
}

export function getTextBoxWidth(text: string, fontSizeRem = DEFAULT_CANVAS_FONT_SIZE_REM) {
  const lines = text.split("\n");
  const ctx = getTextMeasureCtx();
  let maxPx = 0;
  if (ctx) {
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    ctx.font = `500 ${fontSizeRem * rootPx}px "Segoe UI", "Candara", "Trebuchet MS", sans-serif`;
    for (const line of lines) {
      const w = ctx.measureText(line.trim()).width;
      if (w > maxPx) maxPx = w;
    }
  } else {
    const longest = lines.reduce((a, b) => (a.length > b.length ? a : b), "");
    maxPx = longest.trim().length * fontSizeRem * 9;
  }
  const min = text.trim() ? 36 : 100;
  return Math.max(min, Math.min(920, Math.ceil(maxPx) + 12));
}

export function getSheetMetrics(sheetStyle: SheetStyle, rem: number) {
  const seyesStep = mmToPx(SEYES_MAJOR_MM);
  const seyesMinorStep = mmToPx(SEYES_MINOR_MM);
  const smallGridStep = mmToPx(SMALL_GRID_MM);

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
        snapXStep: smallGridStep,
        snapYStep: smallGridStep,
        originX: smallGridStep,
        originY: smallGridStep,
        baselineOffset: CANVAS_LINE_BASELINE_OFFSET_PX,
        snapX: true,
        snapY: true
      };
    case "lined":
      return {
        snapXStep: seyesStep / 2,
        snapYStep: seyesStep,
        originX: CANVAS_GRID_LEFT_REM * rem,
        originY: seyesStep,
        baselineOffset: CANVAS_LINE_BASELINE_OFFSET_PX,
        snapX: false,
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

export function getStrokeBounds(points: FreehandPoint[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
    height: Math.max(1, Math.max(...ys) - Math.min(...ys))
  };
}

export function createStrokePath(points: FreehandPoint[]): string {
  if (points.length === 0) {
    return "";
  }

  const [firstPoint, ...otherPoints] = points;
  return `M ${firstPoint.x} ${firstPoint.y} ${otherPoints.map((point) => `L ${point.x} ${point.y}`).join(" ")}`;
}

export function getPointDistance(left: FreehandPoint, right: FreehandPoint): number {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

export function getStrokeLength(points: FreehandPoint[]): number {
  let length = 0;

  for (let index = 1; index < points.length; index += 1) {
    length += getPointDistance(points[index - 1], points[index]);
  }

  return length;
}

export function getDistanceToSegment(point: FreehandPoint, start: FreehandPoint, end: FreehandPoint): number {
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

export function simplifyStrokePoints(points: FreehandPoint[], epsilon: number): FreehandPoint[] {
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

export function getPolygonArea(points: FreehandPoint[]): number {
  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area) / 2;
}

export function isNearRightAngle(previous: FreehandPoint, current: FreehandPoint, next: FreehandPoint): boolean {
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

export function createCirclePoints(centerX: number, centerY: number, radius: number, segments = 28): FreehandPoint[] {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / segments;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  });
}

export function normalizeStrokeShape(points: FreehandPoint[]): FreehandPoint[] {
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

export function getGeometryLinearDirection(shape: GeometryLinearShape) {
  const dx = shape.bxMm - shape.axMm;
  const dy = shape.byMm - shape.ayMm;
  const length = Math.hypot(dx, dy);

  if (length <= 0.0001) {
    return { dx: 1, dy: 0, length: 0 };
  }

  return {
    dx: dx / length,
    dy: dy / length,
    length
  };
}

export function getGeometryAngleFromCenter(center: GeometryPointCoordinate, point: GeometryPointCoordinate) {
  return Math.atan2(point.yMm - center.yMm, point.xMm - center.xMm);
}

export function normalizeSignedAngleDelta(delta: number) {
  let normalized = delta;

  while (normalized <= -Math.PI) {
    normalized += Math.PI * 2;
  }

  while (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }

  return normalized;
}

export function getGeometryArcRadiusPx(shape: Pick<GeometryArcShape, "radiusMm">) {
  return mmToPx(shape.radiusMm);
}

export function getGeometryArcPathData(center: GeometryPointCoordinate, radiusMm: number, startAngle: number, endAngle: number) {
  const radiusPx = mmToPx(radiusMm);
  const delta = Math.max(-Math.PI * 2, Math.min(Math.PI * 2, endAngle - startAngle));

  if (Math.abs(delta) >= Math.PI * 2 - 0.001) {
    const start = getGeometryPolarPoint(center, radiusPx, startAngle);
    const mid = getGeometryPolarPoint(center, radiusPx, startAngle + Math.PI);
    return {
      radiusPx,
      delta,
      start,
      end: start,
      path: `M ${start.x} ${start.y} A ${radiusPx} ${radiusPx} 0 1 1 ${mid.x} ${mid.y} A ${radiusPx} ${radiusPx} 0 1 1 ${start.x} ${start.y}`
    };
  }

  const start = getGeometryPolarPoint(center, radiusPx, startAngle);
  const end = getGeometryPolarPoint(center, radiusPx, startAngle + delta);
  const largeArcFlag = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweepFlag = delta >= 0 ? 1 : 0;

  return {
    radiusPx,
    delta,
    start,
    end,
    path: `M ${start.x} ${start.y} A ${radiusPx} ${radiusPx} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
  };
}

export function dedupeGeometryRenderPoints(points: Array<{ x: number; y: number; t: number }>) {
  return points.filter(
    (point, index) =>
      points.findIndex(
        (candidate) =>
          Math.abs(candidate.x - point.x) < 0.5 &&
          Math.abs(candidate.y - point.y) < 0.5 &&
          Math.abs(candidate.t - point.t) < 0.0001
      ) === index
  );
}

export function getRenderedLinearGeometryPx(shape: GeometryLinearShape, canvasWidth: number, canvasHeight: number) {
  const ax = mmToPx(shape.axMm);
  const ay = mmToPx(shape.ayMm);
  const bx = mmToPx(shape.bxMm);
  const by = mmToPx(shape.byMm);

  if (shape.kind === "segment" || shape.kind === "graduated-line") {
    return { x1: ax, y1: ay, x2: bx, y2: by };
  }

  const dx = bx - ax;
  const dy = by - ay;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return null;
  }

  const candidates: Array<{ x: number; y: number; t: number }> = [];
  const pushCandidate = (x: number, y: number, t: number) => {
    if (x >= -0.5 && x <= canvasWidth + 0.5 && y >= -0.5 && y <= canvasHeight + 0.5) {
      candidates.push({ x, y, t });
    }
  };

  if (Math.abs(dx) > 0.001) {
    const tLeft = (0 - ax) / dx;
    pushCandidate(0, ay + tLeft * dy, tLeft);
    const tRight = (canvasWidth - ax) / dx;
    pushCandidate(canvasWidth, ay + tRight * dy, tRight);
  }

  if (Math.abs(dy) > 0.001) {
    const tTop = (0 - ay) / dy;
    pushCandidate(ax + tTop * dx, 0, tTop);
    const tBottom = (canvasHeight - ay) / dy;
    pushCandidate(ax + tBottom * dx, canvasHeight, tBottom);
  }

  const unique = dedupeGeometryRenderPoints(candidates).sort((left, right) => left.t - right.t);

  if (shape.kind === "line") {
    if (unique.length >= 2) {
      const first = unique[0];
      const last = unique[unique.length - 1];
      return { x1: first.x, y1: first.y, x2: last.x, y2: last.y };
    }

    const direction = getGeometryLinearDirection(shape);
    return {
      x1: ax - direction.dx * GEOMETRY_LINE_EXTENT_PX,
      y1: ay - direction.dy * GEOMETRY_LINE_EXTENT_PX,
      x2: ax + direction.dx * GEOMETRY_LINE_EXTENT_PX,
      y2: ay + direction.dy * GEOMETRY_LINE_EXTENT_PX
    };
  }

  const insideCanvas = ax >= 0 && ax <= canvasWidth && ay >= 0 && ay <= canvasHeight;
  const visibleCandidates = unique.filter((candidate) => candidate.t >= 0);

  if (insideCanvas) {
    const last = visibleCandidates[visibleCandidates.length - 1];

    if (last) {
      return { x1: ax, y1: ay, x2: last.x, y2: last.y };
    }
  }

  if (visibleCandidates.length >= 2) {
    const first = visibleCandidates[0];
    const last = visibleCandidates[visibleCandidates.length - 1];
    return { x1: first.x, y1: first.y, x2: last.x, y2: last.y };
  }

  const direction = getGeometryLinearDirection(shape);
  return {
    x1: ax,
    y1: ay,
    x2: ax + direction.dx * GEOMETRY_LINE_EXTENT_PX,
    y2: ay + direction.dy * GEOMETRY_LINE_EXTENT_PX
  };
}

export function getGeometryShapeBoundsPx(shape: GeometryShape, canvasWidth: number, canvasHeight: number) {
  if (shape.kind === "point") {
    const radius = mmToPx(GEOMETRY_POINT_RADIUS_MM) + 10;
    const x = mmToPx(shape.xMm);
    const y = mmToPx(shape.yMm);
    return {
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2
    };
  }

  if (shape.kind === "circle") {
    const radius = mmToPx(shape.radiusMm);
    const x = mmToPx(shape.cxMm);
    const y = mmToPx(shape.cyMm);
    return {
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2
    };
  }

  if (shape.kind === "arc") {
    const radius = mmToPx(shape.radiusMm);
    const x = mmToPx(shape.cxMm);
    const y = mmToPx(shape.cyMm);
    return {
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2
    };
  }

  const rendered = getRenderedLinearGeometryPx(shape as GeometryLinearShape | GraduatedLineModalShape, canvasWidth, canvasHeight);

  if (!rendered) {
    const x = mmToPx(shape.axMm);
    const y = mmToPx(shape.ayMm);
    return { x, y, width: 1, height: 1 };
  }

  return {
    x: Math.min(rendered.x1, rendered.x2),
    y: Math.min(rendered.y1, rendered.y2),
    width: Math.max(1, Math.abs(rendered.x2 - rendered.x1)),
    height: Math.max(1, Math.abs(rendered.y2 - rendered.y1))
  };
}

export function translateGeometryShape(shape: GeometryShape, deltaXMm: number, deltaYMm: number): GeometryShape {
  if (shape.kind === "point") {
    return {
      ...shape,
      xMm: shape.xMm + deltaXMm,
      yMm: shape.yMm + deltaYMm
    };
  }

  if (shape.kind === "circle") {
    return {
      ...shape,
      cxMm: shape.cxMm + deltaXMm,
      cyMm: shape.cyMm + deltaYMm
    };
  }

  if (shape.kind === "arc") {
    return {
      ...shape,
      cxMm: shape.cxMm + deltaXMm,
      cyMm: shape.cyMm + deltaYMm
    };
  }

  return {
    ...shape,
    axMm: shape.axMm + deltaXMm,
    ayMm: shape.ayMm + deltaYMm,
    bxMm: shape.bxMm + deltaXMm,
    byMm: shape.byMm + deltaYMm
  };
}

export function getGeometrySelectionMeasurement(shape: GeometryShape) {
  if (shape.kind === "segment") {
    return `${Math.round(Math.hypot(shape.bxMm - shape.axMm, shape.byMm - shape.ayMm))} mm`;
  }

  if (shape.kind === "circle") {
    return `Ø ${Math.round(shape.radiusMm * 2)} mm`;
  }

  return null;
}

export function getGraduatedLineSectionCount(value: string) {
  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ""), 10);

  if (!Number.isFinite(parsed)) {
    return 10;
  }

  return Math.max(1, Math.min(200, parsed));
}

export function getGraduatedLineStartValue(value: string) {
  const parsed = Number.parseInt(value.replace(/[^0-9-]/g, ""), 10);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function getGraduatedLineEndpointLabel(shape: GeometryLinearShape, index: number) {
  const sections = Math.max(1, Math.round(shape.sections ?? 10));
  const startValue = Math.round(shape.startValue ?? 0);
  return index === 0 ? startValue : startValue + sections;
}

export function isGraduatedLineVertical(ax: number, ay: number, bx: number, by: number) {
  return Math.abs(by - ay) > Math.abs(bx - ax);
}

export function getGraduatedLineLabelPosition(ax: number, ay: number, bx: number, by: number, index: number) {
  const labelOffset = 22;
  const isVertical = isGraduatedLineVertical(ax, ay, bx, by);
  const baseX = index === 0 ? ax : bx;
  const baseY = index === 0 ? ay : by;

  return isVertical
    ? {
        x: baseX + labelOffset,
        y: baseY,
        textAnchor: "start" as const,
        dominantBaseline: "middle" as const
      }
    : {
        x: baseX,
        y: baseY - labelOffset,
        textAnchor: "middle" as const,
        dominantBaseline: "auto" as const
      };
}

export function getGraduatedLineTickLengthPx(index: number, sections: number) {
  if (index === 0 || index === sections || index % 10 === 0) {
    return 18;
  }

  if (index % 5 === 0) {
    return 12;
  }

  return 8;
}

export function getGraduatedLineTickStrokeWidth(index: number, sections: number) {
  if (index === 0 || index === sections || index % 10 === 0) {
    return 2;
  }

  if (index % 5 === 0) {
    return 1.6;
  }

  return 1.2;
}

export function getGraduatedLineDraftNormal(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy) || 1;

  return {
    ux: dx / length,
    uy: dy / length,
    nx: dy / length,
    ny: -dx / length
  };
}

export function getGraduatedLineTickPath(ax: number, ay: number, bx: number, by: number, index: number, sections: number) {
  const progress = sections <= 0 ? 0 : index / sections;
  const baseX = ax + (bx - ax) * progress;
  const baseY = ay + (by - ay) * progress;
  const { nx, ny } = getGraduatedLineDraftNormal(ax, ay, bx, by);
  const length = getGraduatedLineTickLengthPx(index, sections);

  return {
    x1: baseX,
    y1: baseY,
    x2: baseX + nx * length,
    y2: baseY + ny * length,
    strokeWidth: getGraduatedLineTickStrokeWidth(index, sections)
  };
}

export function getGraduatedLineRenderTicks(shape: GeometryLinearShape, canvasWidth: number, canvasHeight: number) {
  const rendered = getRenderedLinearGeometryPx(shape, canvasWidth, canvasHeight);

  if (!rendered) {
    return [];
  }

  const sections = Math.max(1, Math.round(shape.sections ?? 10));

  return Array.from({ length: sections + 1 }, (_, index) => getGraduatedLineTickPath(rendered.x1, rendered.y1, rendered.x2, rendered.y2, index, sections));
}

export function getGraduatedLineAxisLockedPoint(start: GeometryPointCoordinate, point: { xMm: number; yMm: number }, guides: { x: number | null; y: number | null }) {
  const deltaX = Math.abs(point.xMm - start.xMm);
  const deltaY = Math.abs(point.yMm - start.yMm);

  if (deltaX >= deltaY) {
    return {
      xMm: point.xMm,
      yMm: start.yMm,
      guides: {
        x: guides.x,
        y: mmToPx(start.yMm)
      }
    };
  }

  return {
    xMm: start.xMm,
    yMm: point.yMm,
    guides: {
      x: mmToPx(start.xMm),
      y: guides.y
    }
  };
}

export function getGeometryAngleDegrees(vertex: GeometryPointCoordinate, baseline: GeometryPointCoordinate, end: GeometryPointCoordinate) {
  const baselineAngle = Math.atan2(baseline.yMm - vertex.yMm, baseline.xMm - vertex.xMm);
  const endAngle = Math.atan2(end.yMm - vertex.yMm, end.xMm - vertex.xMm);
  let delta = Math.abs(((endAngle - baselineAngle) * 180) / Math.PI);

  while (delta > 360) {
    delta -= 360;
  }

  if (delta > 180) {
    delta = 360 - delta;
  }

  return delta;
}

export function getGeometrySignedAngleDelta(vertex: GeometryPointCoordinate, baseline: GeometryPointCoordinate, end: GeometryPointCoordinate) {
  const baselineAngle = Math.atan2(baseline.yMm - vertex.yMm, baseline.xMm - vertex.xMm);
  const endAngle = Math.atan2(end.yMm - vertex.yMm, end.xMm - vertex.xMm);
  let delta = endAngle - baselineAngle;

  while (delta <= -Math.PI) {
    delta += Math.PI * 2;
  }

  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }

  return delta;
}

export function getGeometryProtractorRadiusPx(vertex: GeometryPointCoordinate, baseline: GeometryPointCoordinate, end: GeometryPointCoordinate) {
  const baselineLength = Math.hypot(mmToPx(baseline.xMm - vertex.xMm), mmToPx(baseline.yMm - vertex.yMm));
  const endLength = Math.hypot(mmToPx(end.xMm - vertex.xMm), mmToPx(end.yMm - vertex.yMm));

  return Math.max(42, Math.min(96, Math.min(baselineLength, endLength) * 0.72));
}

export function getGeometryPolarPoint(vertex: GeometryPointCoordinate, radiusPx: number, angle: number) {
  return {
    x: mmToPx(vertex.xMm) + Math.cos(angle) * radiusPx,
    y: mmToPx(vertex.yMm) + Math.sin(angle) * radiusPx
  };
}

export function getGeometryProtractorPaths(vertex: GeometryPointCoordinate, baseline: GeometryPointCoordinate, end: GeometryPointCoordinate) {
  const baselineAngle = Math.atan2(baseline.yMm - vertex.yMm, baseline.xMm - vertex.xMm);
  const delta = getGeometrySignedAngleDelta(vertex, baseline, end);
  const radius = getGeometryProtractorRadiusPx(vertex, baseline, end);
  const measuredRadius = radius;
  const outerStart = getGeometryPolarPoint(vertex, radius, baselineAngle);
  const outerEnd = getGeometryPolarPoint(vertex, radius, baselineAngle + (delta >= 0 ? Math.PI : -Math.PI));
  const arcStart = getGeometryPolarPoint(vertex, measuredRadius, baselineAngle);
  const arcEnd = getGeometryPolarPoint(vertex, measuredRadius, baselineAngle + delta);
  const largeArcFlag = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweepFlag = delta >= 0 ? 1 : 0;
  const semiSweepFlag = delta >= 0 ? 1 : 0;
  const centerX = mmToPx(vertex.xMm);
  const centerY = mmToPx(vertex.yMm);

  return {
    radius,
    baselineAngle,
    protractorPath: `M ${centerX} ${centerY} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 0 ${semiSweepFlag} ${outerEnd.x} ${outerEnd.y} Z`,
    measuredArcPath: `M ${arcStart.x} ${arcStart.y} A ${measuredRadius} ${measuredRadius} 0 ${largeArcFlag} ${sweepFlag} ${arcEnd.x} ${arcEnd.y}`
  };
}

export function isGeometryConstructionTool(tool: GeometryTool | null) {
  return tool === "point" || tool === "segment" || tool === "line" || tool === "ray" || tool === "circle" || tool === "compass";
}

export function getSnapPointOnRayPx(pointX: number, pointY: number, vertex: GeometryPointCoordinate, rayPoint: GeometryPointCoordinate) {
  const vx = mmToPx(vertex.xMm);
  const vy = mmToPx(vertex.yMm);
  const rx = mmToPx(rayPoint.xMm);
  const ry = mmToPx(rayPoint.yMm);
  const dx = rx - vx;
  const dy = ry - vy;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= 0.0001) {
    return null;
  }

  const projection = ((pointX - vx) * dx + (pointY - vy) * dy) / lengthSquared;
  const clampedProjection = Math.max(0, projection);

  return {
    x: vx + dx * clampedProjection,
    y: vy + dy * clampedProjection,
    distance: Math.hypot(pointX - (vx + dx * clampedProjection), pointY - (vy + dy * clampedProjection))
  };
}

export function getSnapPointOnLinePx(pointX: number, pointY: number, vertex: GeometryPointCoordinate, linePoint: GeometryPointCoordinate) {
  const vx = mmToPx(vertex.xMm);
  const vy = mmToPx(vertex.yMm);
  const lx = mmToPx(linePoint.xMm);
  const ly = mmToPx(linePoint.yMm);
  const dx = lx - vx;
  const dy = ly - vy;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= 0.0001) {
    return null;
  }

  const projection = ((pointX - vx) * dx + (pointY - vy) * dy) / lengthSquared;

  return {
    x: vx + dx * projection,
    y: vy + dy * projection,
    distance: Math.hypot(pointX - (vx + dx * projection), pointY - (vy + dy * projection))
  };
}

export function cloneWriterState(value: WriterState) {
  return JSON.parse(JSON.stringify(value)) as WriterState;
}

export function areWriterStatesEqual(left: WriterState, right: WriterState) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function getGridDimensions(count: number, columns: number) {
  return {
    columns,
    rows: Math.ceil(count / columns)
  };
}

export function getRemPixels() {
  if (typeof window === "undefined") {
    return 16;
  }

  return Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
}

export function parseStoredState(raw: string, fallbackSheetStyle: SheetStyle, labels: DefaultDocumentLabels): WriterState | null {
  try {
    const parsed = JSON.parse(raw) as WriterState;
    const parsedSchemaVersion =
      typeof (parsed as { schemaVersion?: unknown }).schemaVersion === "number"
        ? (parsed as { schemaVersion: number }).schemaVersion
        : 1;
    const parsedSheetStyle =
      (parsed as { sheetStyle?: unknown }).sheetStyle === "large-grid" ||
      (parsed as { sheetStyle?: unknown }).sheetStyle === "small-grid" ||
      (parsed as { sheetStyle?: unknown }).sheetStyle === "lined" ||
      (parsed as { sheetStyle?: unknown }).sheetStyle === "blank" ||
      (parsed as { sheetStyle?: unknown }).sheetStyle === "seyes"
        ? (parsed as { sheetStyle: SheetStyle }).sheetStyle
        : createDefaultState(fallbackSheetStyle, labels).sheetStyle;
    const defaultState = createDefaultState(parsedSheetStyle, labels);
    const defaultFontSize = getDefaultCanvasFontSize(parsedSheetStyle);
    const defaultNoteFontSize = getDefaultNoteFontSize(parsedSheetStyle);

    if (
      typeof parsed.title !== "string" ||
      (parsed.mode !== "middleSchool" && parsed.mode !== "highSchool") ||
      typeof parsed.textHtml !== "string" ||
      !Array.isArray(parsed.blocks)
    ) {
      return null;
    }

    return {
      ...parsed,
      schemaVersion: WRITER_STATE_SCHEMA_VERSION,
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
                migrateArithmeticCarryCells(
                  typeof (block as { carryTop?: unknown }).carryTop !== "undefined"
                    ? (block as { carryTop?: unknown }).carryTop
                    : (block as { carry?: unknown }).carry,
                  parsedSchemaVersion
                ),
              carryBottom: migrateArithmeticCarryCells((block as { carryBottom?: unknown }).carryBottom, parsedSchemaVersion),
              carryResult: migrateArithmeticCarryCells((block as { carryResult?: unknown }).carryResult, parsedSchemaVersion),
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
            kind:
              (symbol as { kind?: unknown }).kind === "sum"
                ? "sum"
                : (symbol as { kind?: unknown }).kind === "integral"
                  ? "integral"
                  : "text",
            size:
              typeof (symbol as { size?: unknown }).size === "number"
                ? (symbol as { size: number }).size
                : (symbol as { kind?: unknown }).kind === "sum"
                  ? DEFAULT_SUM_SYMBOL_SIZE
                  : (symbol as { kind?: unknown }).kind === "integral"
                    ? DEFAULT_INTEGRAL_SYMBOL_SIZE
                    : undefined,
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
        : [],
      geometry: Array.isArray((parsed as { geometry?: unknown }).geometry)
        ? (parsed as { geometry: GeometryShape[] }).geometry
            .filter((shape) => Boolean(shape) && typeof shape.id === "string" && typeof shape.type === "string" && shape.type === "geometry")
            .reduce<GeometryShape[]>((accumulator, shape) => {
              if (shape.kind === "point") {
                if (typeof shape.xMm === "number" && typeof shape.yMm === "number") {
                  accumulator.push({
                    ...shape,
                    label: typeof shape.label === "string" ? shape.label : "",
                    color: typeof shape.color === "string" ? shape.color : DEFAULT_ACTIVE_COLOR,
                    strokeWidthMm: typeof shape.strokeWidthMm === "number" ? shape.strokeWidthMm : DEFAULT_GEOMETRY_STROKE_WIDTH_MM
                  } satisfies GeometryPointShape);
                }

                return accumulator;
              }

              if (shape.kind === "circle") {
                if (typeof shape.cxMm === "number" && typeof shape.cyMm === "number" && typeof shape.radiusMm === "number") {
                  accumulator.push({
                    ...shape,
                    color: typeof shape.color === "string" ? shape.color : DEFAULT_ACTIVE_COLOR,
                    radiusMm: Math.max(0.5, shape.radiusMm),
                    strokeWidthMm: typeof shape.strokeWidthMm === "number" ? shape.strokeWidthMm : DEFAULT_GEOMETRY_STROKE_WIDTH_MM
                  } satisfies GeometryCircleShape);
                }

                return accumulator;
              }

              if (shape.kind === "arc") {
                if (
                  typeof shape.cxMm === "number" &&
                  typeof shape.cyMm === "number" &&
                  typeof shape.radiusMm === "number" &&
                  typeof shape.startAngle === "number" &&
                  typeof shape.endAngle === "number"
                ) {
                  accumulator.push({
                    ...shape,
                    color: typeof shape.color === "string" ? shape.color : DEFAULT_ACTIVE_COLOR,
                    radiusMm: Math.max(0.5, shape.radiusMm),
                    strokeWidthMm: typeof shape.strokeWidthMm === "number" ? shape.strokeWidthMm : DEFAULT_GEOMETRY_STROKE_WIDTH_MM
                  } satisfies GeometryArcShape);
                }

                return accumulator;
              }

              if (
                typeof shape.axMm === "number" &&
                typeof shape.ayMm === "number" &&
                typeof shape.bxMm === "number" &&
                typeof shape.byMm === "number"
              ) {
                accumulator.push({
                  ...shape,
                  startValue: typeof (shape as { startValue?: unknown }).startValue === "number" ? (shape as { startValue: number }).startValue : 0,
                  sections:
                    shape.kind === "graduated-line"
                      ? typeof (shape as { sections?: unknown }).sections === "number"
                        ? Math.max(1, Math.round((shape as { sections: number }).sections))
                        : 10
                      : typeof (shape as { sections?: unknown }).sections === "number"
                        ? (shape as { sections: number }).sections
                        : undefined,
                  color: typeof shape.color === "string" ? shape.color : DEFAULT_ACTIVE_COLOR,
                  strokeWidthMm: typeof shape.strokeWidthMm === "number" ? shape.strokeWidthMm : DEFAULT_GEOMETRY_STROKE_WIDTH_MM
                } satisfies GeometryLinearShape);
              }

              return accumulator;
            }, [])
        : []
    };
  } catch {
    return null;
  }
}

export function getBlockTitle(block: MathBlock, blockTitles: ReturnType<typeof createWorkbookUi>["blockTitles"]) {
  switch (block.type) {
    case "fraction":
      return blockTitles.fraction;
    case "addition":
      return blockTitles.addition;
    case "subtraction":
      return blockTitles.subtraction;
    case "multiplication":
      return blockTitles.multiplication;
    case "division":
      return blockTitles.division;
    case "power":
      return blockTitles.power;
    case "root":
      return blockTitles.root;
    default:
      return blockTitles.default;
  }
}

export function getDefaultWidth(type: MathBlock["type"]) {
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

export function getDivisionWorkLines(work: string) {
  const lines = work.split("\n");
  return lines.length > 0 ? lines : [""];
}

export function getDivisionQuotientDigits(quotient: string) {
  const digitsOnly = quotient.replace(/\D+/g, "");
  return Math.max(1, digitsOnly.length);
}

export function getCellTextLength(value: string) {
  return value.replace(/\s+$/g, "").length;
}

export function normalizeDivisionDecimalInput(value: string) {
  const normalized = value.replace(/\./g, ",").replace(/[^0-9, ]/g, "");
  const firstCommaIndex = normalized.indexOf(",");

  if (firstCommaIndex === -1) {
    return normalized.replace(/\s+$/g, "");
  }

  return `${normalized.slice(0, firstCommaIndex + 1)}${normalized.slice(firstCommaIndex + 1).replace(/,/g, "")}`.replace(/\s+$/g, "");
}

export function getDivisionMaxWorkLines(quotient: string) {
  return Math.max(8, getDivisionQuotientDigits(quotient) * 2 + 1);
}

export function getDivisionVisibleWorkLines(work: string, quotient: string) {
  const rawLines = getDivisionWorkLines(work);
  const maxLines = getDivisionMaxWorkLines(quotient);
  let completedPrefix = 0;

  while (completedPrefix < maxLines && (rawLines[completedPrefix] ?? "").trim().length > 0) {
    completedPrefix += 1;
  }

  const visibleCount = Math.min(maxLines, Math.max(1, completedPrefix + 1));
  return Array.from({ length: visibleCount }, (_, index) => rawLines[index] ?? "");
}

export function setDivisionWorkLine(work: string, lineIndex: number, value: string) {
  const lines = getDivisionWorkLines(work);

  while (lines.length <= lineIndex) {
    lines.push("");
  }

  lines[lineIndex] = value;

  while (lines.length > 1 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
}

export function serializeDivisionWorkLines(lines: string[]) {
  const nextLines = [...lines];

  while (nextLines.length > 1 && nextLines[nextLines.length - 1] === "") {
    nextLines.pop();
  }

  return nextLines.join("\n");
}

export function getDivisionCellValue(value: string, index: number) {
  return Array.from(value)[index] ?? "";
}

export function setDivisionCellValue(value: string, index: number, nextCharacter: string) {
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

export function setDivisionCellValues(value: string, startIndex: number, nextCharacters: string[], maxColumns: number) {
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

export function getDivisionLeftColumns(block: DivisionBlock) {
  const workLines = getDivisionWorkLines(block.work);
  return Math.max(1, getCellTextLength(block.dividend), ...workLines.map((line) => getCellTextLength(line)));
}

export function getDivisionDivisorColumns(block: DivisionBlock) {
  return Math.max(1, getCellTextLength(block.divisor));
}

export function getDivisionQuotientColumns(block: DivisionBlock) {
  return Math.max(1, getCellTextLength(block.quotient));
}

export function isColumnArithmeticBlock(block: MathBlock): block is AdditionBlock | SubtractionBlock | MultiplicationBlock {
  return block.type === "addition" || block.type === "subtraction" || block.type === "multiplication";
}

export function isCellStrikeBlock(block: MathBlock): block is AdditionBlock | SubtractionBlock | MultiplicationBlock | DivisionBlock {
  return isColumnArithmeticBlock(block) || block.type === "division";
}

export function getArithmeticOperator(block: AdditionBlock | SubtractionBlock | MultiplicationBlock) {
  return block.type === "addition" ? "+" : block.type === "subtraction" ? "-" : "×";
}

export type ArithmeticLineField = "top" | "bottom" | "result";
export type ArithmeticCarryField = "carryTop" | "carryBottom" | "carryResult";

export function getCarryFieldForArithmeticLine(field: ArithmeticLineField): ArithmeticCarryField {
  if (field === "top") {
    return "carryTop";
  }

  if (field === "bottom") {
    return "carryBottom";
  }

  return "carryResult";
}

export function getArithmeticLineForCarryField(field: ArithmeticCarryField): ArithmeticLineField {
  if (field === "carryTop") {
    return "top";
  }

  if (field === "carryBottom") {
    return "bottom";
  }

  return "result";
}

export function normalizeArithmeticCarryCells(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item.slice(-1) : "")).filter((item, index, array) => item !== "" || index < array.length - 1);
  }

  if (typeof value === "string") {
    return Array.from(value.replace(/\s+/g, "")).map((item) => item.slice(-1));
  }

  return [] as string[];
}

export function migrateArithmeticCarryCells(value: unknown, schemaVersion: number) {
  const normalized = normalizeArithmeticCarryCells(value);
  return schemaVersion < WRITER_STATE_SCHEMA_VERSION ? [...normalized].reverse() : normalized;
}

export function normalizeStruckCells(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0)));
}

export function getStruckCellKey(field: string, cellIndex: number) {
  return `${field}::${cellIndex}`;
}

export function hasStruckCell(struckCells: string[], field: string, cellIndex: number) {
  return struckCells.includes(getStruckCellKey(field, cellIndex));
}

export function toggleStruckCell(struckCells: string[], field: string, cellIndex: number) {
  const key = getStruckCellKey(field, cellIndex);

  if (struckCells.includes(key)) {
    return struckCells.filter((item) => item !== key);
  }

  return [...struckCells, key];
}

export function getStrokeStyleForTool(tool: AdvancedTool, activeColor: string, activeHighlightColor: string | null) {
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

export function hasArithmeticCarryCells(cells: string[]) {
  return cells.some((cell) => cell.trim().length > 0);
}

export function getArithmeticCarryCells(block: AdditionBlock | SubtractionBlock | MultiplicationBlock, line: ArithmeticLineField) {
  return block[getCarryFieldForArithmeticLine(line)];
}

export function getArithmeticCarryCell(cells: string[], cellIndex: number) {
  return cells[cellIndex] ?? "";
}

export function getLastFilledArithmeticCarryOffset(cells: string[]) {
  for (let index = cells.length - 1; index >= 0; index -= 1) {
    if ((cells[index] ?? "").trim().length > 0) {
      return index;
    }
  }

  return null;
}

export function setArithmeticCarryCell(cells: string[], cellIndex: number, nextValue: string) {
  const nextCells = [...cells];

  while (nextCells.length <= cellIndex) {
    nextCells.push("");
  }

  nextCells[cellIndex] = nextValue.slice(-1);

  while (nextCells.length > 0 && nextCells[nextCells.length - 1] === "") {
    nextCells.pop();
  }

  return nextCells;
}

export function getColumnArithmeticColumns(block: AdditionBlock | SubtractionBlock | MultiplicationBlock) {
  return Math.max(
    1,
    getCellTextLength(block.top),
    getCellTextLength(block.bottom),
    getCellTextLength(block.result),
    block.carryTop.length,
    block.carryBottom.length,
    block.carryResult.length
  );
}

export function getAlignedCaretCellIndex(value: string, columns: number, align: "start" | "end", caretPosition: number) {
  const characters = Array.from(value);
  const offset = align === "end" ? Math.max(0, columns - characters.length) : 0;
  return Math.max(0, Math.min(columns - 1, offset + caretPosition));
}

export function getAlignedCellSelectionRange(
  value: string,
  columns: number,
  align: "start" | "end",
  cellIndex: number
) {
  const characters = Array.from(value);
  const offset = align === "end" ? Math.max(0, columns - characters.length) : 0;
  const characterIndex = cellIndex - offset;

  if (characterIndex < 0) {
    return { start: 0, end: 0 };
  }

  if (characterIndex >= characters.length) {
    return { start: characters.length, end: characters.length };
  }

  return { start: characterIndex, end: characterIndex + 1 };
}

export function getAlignedCellCharacter(
  value: string,
  columns: number,
  align: "start" | "end",
  cellIndex: number
) {
  const characters = Array.from(value);
  const offset = align === "end" ? Math.max(0, columns - characters.length) : 0;
  return characters[cellIndex - offset] ?? "";
}

export function setAlignedCellCharacter(
  value: string,
  columns: number,
  align: "start" | "end",
  cellIndex: number,
  nextCharacter: string
) {
  const characters = Array.from(value);
  const offset = align === "end" ? Math.max(0, columns - characters.length) : 0;
  const cells = Array.from({ length: columns }, (_, index) => characters[index - offset] ?? "");

  cells[cellIndex] = nextCharacter;

  const nextValue = cells.join("");
  return normalizeDivisionDecimalInput(nextValue);
}

export type DivisionCellRowOptions = {
  field?: string;
  struckCells?: string[];
  onCellToggle?: (cellIndex: number, cellValue: string) => void;
};

export function renderDivisionCellRow(
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
        const cellIndex = index;
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

export function renderArithmeticCarryRow(
  cells: string[],
  columns: number,
  className: string,
  targetCellIndex?: number,
  options?: DivisionCellRowOptions
) {
  return (
    <div className={`division-cell-row ${className}`} style={{ ["--division-columns" as string]: columns } as ReactCSSProperties}>
      {Array.from({ length: columns }).map((_, index) => {
        const cellValue = getArithmeticCarryCell(cells, index);
        const isStruck = options?.field ? hasStruckCell(options.struckCells ?? [], options.field, index) : false;
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
              options.onCellToggle?.(index, cellValue);
            }}
            onTouchStart={(event) => {
              event.preventDefault();
              event.stopPropagation();
              options.onCellToggle?.(index, cellValue);
            }}
          >
            {cellValue}
          </button>
        );
      })}
    </div>
  );
}

export function renderColumnArithmeticPreview(block: AdditionBlock | SubtractionBlock | MultiplicationBlock) {
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
            {renderDivisionCellRow(block.result, columns, "addition-row addition-row-result addition-row-preview", "start", undefined, { field: "result", struckCells: block.struckCells })}
          </div>
        </div>
      </div>
      {block.caption ? <p className="math-caption">{block.caption}</p> : null}
    </div>
  );
}

export function renderMathPreview(block: MathBlock) {
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
                  (() => {
                    if (index % 2 === 0 && line.trim().length === 0) {
                      return null;
                    }

                    const shouldShowResultLine = index % 2 === 0 && (workLines[index + 1] ?? "").trim().length > 0;
                    return (
                  <div
                    key={index}
                    className={`division-work-line ${index % 2 === 0 ? "division-work-line-operation" : "division-work-line-result"} ${shouldShowResultLine ? "division-work-line-operation-complete" : ""} ${line.trim().length === 0 ? "division-work-line-pending" : ""}`}
                  >
                    {index % 2 === 0 ? <span className="division-work-minus">-</span> : <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />}
                    {renderDivisionCellRow(line, leftColumns, "division-workpad division-row-preview", "start", undefined, { field: `work:${index}`, struckCells: block.struckCells })}
                  </div>
                    );
                  })()
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

export function getInlineStartField(type: StructuredTool) {
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

export function getInlineFieldSequence(type: StructuredTool) {
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

export function getNextInlineField(block: MathBlock, field: string) {
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

export function getPreviousInlineField(block: MathBlock, field: string) {
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

export function isBlockEmpty(block: MathBlock) {
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


