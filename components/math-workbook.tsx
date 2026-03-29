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
import {useLocale, useTranslations} from "next-intl";
import {toBlob} from "html-to-image";
import {type AppLocale} from "@/i18n/routing";
import {usePathname, useRouter} from "@/i18n/navigation";
import {PWA_INSTALLABLE_EVENT, PWA_INSTALLED_EVENT} from "@/components/pwa-registration";
import {exportWorkbookPdf, exportWorkbookPng, printWorkbook} from "@/components/math-workbook/export-utils";
import {DrawCanvasLayer, GeometryCanvasLayer} from "@/components/math-workbook/canvas-layers";
import {FloatingMathBlockItem, FloatingMathSymbolItem, FloatingTextBoxItem} from "@/components/math-workbook/canvas-items";
import {renderArithmeticInlineEditor} from "@/components/math-workbook/inline-editor-arithmetic";
import {renderBasicInlineEditor} from "@/components/math-workbook/inline-editor-basic";
import {renderDivisionInlineEditor} from "@/components/math-workbook/inline-editor-division";
import {
  renderBlockModalFields as renderBlockModalFieldsView,
  renderGraduatedLinePreview as renderGraduatedLinePreviewView,
  renderProtractorOverlay as renderProtractorOverlayView
} from "@/components/math-workbook/renderers";
import {
  CanvasQuickInsertMenu,
  ConfirmResetModal,
  ProfileModal,
  GeometrySettingsMenu,
  GraduatedLineModal,
  GuidedBlockModal,
  SelectionMenu,
  SelectionRectOverlay,
  TextFormatMenu,
  WorkbookActionBar,
  WorkbookSidebar
} from "@/components/math-workbook/presentational";
import {
  type PageIndex,
  loadPageIndex,
  savePageIndex,
  loadPageState,
  savePageState,
  createPage,
  deletePage,
  migrateFromLegacyStorage,
  exportPageToFile,
  parseImportedFile
} from "@/components/math-workbook/document-store";
import type {
  StudyMode,
  SheetStyle,
  StructuredTool,
  UtilityMenu,
  GeometryTool,
  FractionBlock,
  DivisionBlock,
  AdditionBlock,
  SubtractionBlock,
  MultiplicationBlock,
  PowerBlock,
  RootBlock,
  FloatingSymbol,
  FloatingTextBox,
  FreehandPoint,
  FreehandStroke,
  GeometryPointShape,
  GeometryLinearShape,
  GeometryCircleShape,
  GeometryArcShape,
  GraduatedLineModalShape,
  MathBlock,
  GeometryShape,
  WriterState,
  ModalState,
  GraduatedLineDraft,
  GraduatedLineModalState,
  GraduatedLineModalSettings,
  ConfirmResetState,
  InlineShortcutItem,
  InlineShortcutGroup,
  DragState,
  SelectionRect,
  PendingSelection,
  ToolbarDragPayload,
  PendingInsertTool,
  InsertCursorPreview,
  ToolbarDragMeta,
  EditingBlockState,
  CanvasQuickMenu,
  FloatingTextShortcutLayout,
  DefaultDocumentLabels,
  WorkbookTranslator,
  ColorOption,
  HighlightOption,
  SheetStyleOption,
  GeometryToolOption,
  StructuredToolOption,
  GeometryPointCoordinate,
  GeometryDraft,
  GeometryDraftIndicator,
  GeometryMeasurement,
  GeometryProtractorDraft,
  GeometryAngleMeasurement,
  GeometryCompassDraft,
  SnapGuides,
  AdvancedTool,
  SymbolResizeHandle,
  SymbolResizeState,
  ArithmeticLineField,
  ArithmeticCarryField,
  DivisionCellRowOptions,
  UserProfile,
  ProfileStore
} from "@/components/math-workbook/shared";
import {
  PROFILE_STORAGE_KEY,
  FLOATING_TEXTBOX_Y_OFFSET,
  CANVAS_QUICK_MENU_OFFSET_X,
  MAX_HISTORY_STEPS,
  DEFAULT_CANVAS_FONT_SIZE_REM,
  PAPER_LINE_STEP_REM,
  CANVAS_GRID_LEFT_REM,
  CANVAS_GRID_TOP_REM,
  MAX_SNAP_THRESHOLD_PX,
  CANVAS_LINE_BASELINE_OFFSET_PX,
  SCRIPT_CHARS,
  DOUBLE_TAP_DELAY,
  DEFAULT_ACTIVE_COLOR,
  DEFAULT_HIGHLIGHT_TOOL_COLOR,
  DEFAULT_SUM_SYMBOL_SIZE,
  DEFAULT_INTEGRAL_SYMBOL_SIZE,
  DEFAULT_GEOMETRY_STROKE_WIDTH_MM,
  GEOMETRY_POINT_RADIUS_MM,
  GEOMETRY_HIT_RADIUS_PX,
  GEOMETRY_LINE_EXTENT_PX,
  HIGHLIGHT_STROKE_OPACITY,
  HIGHLIGHT_STROKE_WIDTH,
  MM_TO_PX,
  DEFAULT_TEXT_HTML,
  DEFAULT_DOCUMENT_LABELS,
  COLOR_OPTION_VALUES,
  HIGHLIGHT_OPTION_VALUES,
  SHEET_STYLE_OPTION_IDS,
  GEOMETRY_TOOL_DEFINITIONS,
  STRUCTURED_TOOL_DEFINITIONS,
  INLINE_SHORTCUT_DEFINITIONS,
  mmToPx,
  cmToPx,
  pxToMm,
  getDefaultCanvasFontSize,
  getDefaultNoteFontSize,
  getDefaultSheetStyleForLocale,
  createDefaultHeaderTextBoxes,
  createDefaultState,
  createId,
  renderShortcutGlyph,
  createWorkbookUi,
  renderStructuredToolGlyph,
  renderGeometryToolGlyph,
  renderGraduatedLineGlyph,
  getTextBoxWidth,
  getSheetMetrics,
  getStrokeBounds,
  createStrokePath,
  getPointDistance,
  getStrokeLength,
  getDistanceToSegment,
  simplifyStrokePoints,
  getPolygonArea,
  isNearRightAngle,
  createCirclePoints,
  normalizeStrokeShape,
  getGeometryLinearDirection,
  getGeometryAngleFromCenter,
  normalizeSignedAngleDelta,
  getGeometryArcRadiusPx,
  getGeometryArcPathData,
  dedupeGeometryRenderPoints,
  getRenderedLinearGeometryPx,
  getGeometryShapeBoundsPx,
  translateGeometryShape,
  getGeometrySelectionMeasurement,
  getGraduatedLineSectionCount,
  getGraduatedLineStartValue,
  getGraduatedLineEndpointLabel,
  isGraduatedLineVertical,
  getGraduatedLineLabelPosition,
  getGraduatedLineTickLengthPx,
  getGraduatedLineTickStrokeWidth,
  getGraduatedLineDraftNormal,
  getGraduatedLineTickPath,
  getGraduatedLineRenderTicks,
  getGraduatedLineAxisLockedPoint,
  getGeometryAngleDegrees,
  getGeometrySignedAngleDelta,
  getGeometryProtractorRadiusPx,
  getGeometryPolarPoint,
  getGeometryProtractorPaths,
  isGeometryConstructionTool,
  getSnapPointOnRayPx,
  getSnapPointOnLinePx,
  cloneWriterState,
  areWriterStatesEqual,
  getGridDimensions,
  getRemPixels,
  parseStoredProfiles,
  getDocumentLabelsForProfile,
  getDefaultWidth,
  getDivisionWorkLines,
  getDivisionQuotientDigits,
  getCellTextLength,
  normalizeDivisionDecimalInput,
  getDivisionMaxWorkLines,
  getDivisionVisibleWorkLines,
  setDivisionWorkLine,
  serializeDivisionWorkLines,
  getDivisionCellValue,
  setDivisionCellValue,
  setDivisionCellValues,
  getDivisionLeftColumns,
  getDivisionDivisorColumns,
  getDivisionQuotientColumns,
  isColumnArithmeticBlock,
  isCellStrikeBlock,
  getArithmeticOperator,
  getCarryFieldForArithmeticLine,
  getArithmeticLineForCarryField,
  normalizeArithmeticCarryCells,
  migrateArithmeticCarryCells,
  normalizeStruckCells,
  getStruckCellKey,
  hasStruckCell,
  toggleStruckCell,
  getStrokeStyleForTool,
  hasArithmeticCarryCells,
  getArithmeticCarryCells,
  getArithmeticCarryCell,
  getLastFilledArithmeticCarryOffset,
  setArithmeticCarryCell,
  getColumnArithmeticColumns,
  getAlignedCaretCellIndex,
  getAlignedCellSelectionRange,
  getAlignedCellCharacter,
  setAlignedCellCharacter,
  renderDivisionCellRow,
  renderArithmeticCarryRow,
  renderColumnArithmeticPreview,
  getInlineStartField,
  getInlineFieldSequence,
  getNextInlineField,
  getPreviousInlineField,
  isBlockEmpty
} from "@/components/math-workbook/shared";

export function MathWorkbook() {
  const t = useTranslations("Workbook");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const workbookUi = useMemo(() => createWorkbookUi(t), [t]);
  const defaultSheetStyle = useMemo(() => getDefaultSheetStyleForLocale(locale), [locale]);
  const [state, setState] = useState<WriterState>(() => createDefaultState(defaultSheetStyle, workbookUi.defaultDocumentLabels));
  const [historyPast, setHistoryPast] = useState<WriterState[]>([]);
  const [historyFuture, setHistoryFuture] = useState<WriterState[]>([]);
  const [openMenu, setOpenMenu] = useState<UtilityMenu>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [confirmResetState, setConfirmResetState] = useState<ConfirmResetState>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [selectedSymbolIds, setSelectedSymbolIds] = useState<string[]>([]);
  const [selectedTextBoxIds, setSelectedTextBoxIds] = useState<string[]>([]);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [selectedGeometryIds, setSelectedGeometryIds] = useState<string[]>([]);
  const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<EditingBlockState>(null);
  const [strikeModeBlockId, setStrikeModeBlockId] = useState<string | null>(null);
  const [numericFieldCaretPositions, setNumericFieldCaretPositions] = useState<Record<string, number>>({});
  const [advancedTool, setAdvancedTool] = useState<AdvancedTool>(null);
  const [activeGeometryTool, setActiveGeometryTool] = useState<GeometryTool | null>(null);
  const [geometryDraft, setGeometryDraft] = useState<GeometryDraft | null>(null);
  const [geometryMeasurement, setGeometryMeasurement] = useState<GeometryMeasurement | null>(null);
  const [geometryProtractorDraft, setGeometryProtractorDraft] = useState<GeometryProtractorDraft | null>(null);
  const [geometryAngleMeasurement, setGeometryAngleMeasurement] = useState<GeometryAngleMeasurement | null>(null);
  const [geometryCompassDraft, setGeometryCompassDraft] = useState<GeometryCompassDraft | null>(null);
  const [pendingInsertTool, setPendingInsertTool] = useState<PendingInsertTool>(null);
  const [insertCursorPreview, setInsertCursorPreview] = useState<InsertCursorPreview>({ x: 0, y: 0, visible: false });
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [draftStroke, setDraftStroke] = useState<FreehandPoint[] | null>(null);
  const [graduatedLineDraft, setGraduatedLineDraft] = useState<GraduatedLineDraft | null>(null);
  const [graduatedLineModalState, setGraduatedLineModalState] = useState<GraduatedLineModalState>(null);
  const [graduatedLineModalSettings, setGraduatedLineModalSettings] = useState<GraduatedLineModalSettings>(null);
  const [selectedGraduatedLineSettings, setSelectedGraduatedLineSettings] = useState<{ startValue: string; sections: string } | null>(null);
  const [canvasQuickMenu, setCanvasQuickMenu] = useState<CanvasQuickMenu>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuides>({ x: null, y: null });
  const [selectedElementMenuPosition, setSelectedElementMenuPosition] = useState<{ x: number; y: number; placement: "above" | "below" } | null>(null);
  const [selectedGeometryMenuPosition, setSelectedGeometryMenuPosition] = useState<{ x: number; y: number; placement: "above" | "below" } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "png" | "print" | null>(null);
  const [isCanvasDropActive, setIsCanvasDropActive] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRect>(null);
  const [isCanvasInteracting, setIsCanvasInteracting] = useState(false);
  const [canInstallApp, setCanInstallApp] = useState(false);
  const [isInstalledApp, setIsInstalledApp] = useState(false);
  const [profileStore, setProfileStore] = useState<ProfileStore>({ profiles: [], activeProfileId: null });
  const [profileEditMode, setProfileEditMode] = useState<"create" | "edit" | null>(null);
  const [pageIndex, setPageIndex] = useState<PageIndex>({ version: 1, activePageId: null, pages: [] });
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeProfile = useMemo(
    () => profileStore.profiles.find((p) => p.id === profileStore.activeProfileId) ?? null,
    [profileStore]
  );
  const activeFont = activeProfile?.preferredFont ?? "default";
  const editorRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<Range | null>(null);
  const dragRef = useRef<DragState>(null);
  const pendingSelectionRef = useRef<PendingSelection>(null);
  const blocksRef = useRef<MathBlock[]>([]);
  const symbolsRef = useRef<FloatingSymbol[]>([]);
  const textBoxesRef = useRef<FloatingTextBox[]>([]);
  const strokesRef = useRef<FreehandStroke[]>([]);
  const geometryRef = useRef<GeometryShape[]>([]);
  const strikeModeBlockIdRef = useRef<string | null>(null);
  const selectedBlockIdsRef = useRef<string[]>([]);
  const selectedSymbolIdsRef = useRef<string[]>([]);
  const selectedTextBoxIdsRef = useRef<string[]>([]);
  const selectedStrokeIdsRef = useRef<string[]>([]);
  const selectedGeometryIdsRef = useRef<string[]>([]);
  const isDrawingStrokeRef = useRef(false);
  const draftStrokeRef = useRef<FreehandPoint[]>([]);
  const draftStrokeStyleRef = useRef<{ color: string; width: number; opacity: number }>({
    color: DEFAULT_ACTIVE_COLOR,
    width: 2.6,
    opacity: 1
  });
  const graduatedLineDraftRef = useRef<GraduatedLineDraft | null>(null);
  const graduatedLineModalStateRef = useRef<GraduatedLineModalState>(null);
  const graduatedLineModalSettingsRef = useRef<GraduatedLineModalSettings>(null);
  const graduatedLinePointerSessionRef = useRef<{ isPointerDown: boolean; hasMoved: boolean }>({ isPointerDown: false, hasMoved: false });
  const selectedGraduatedLineSettingsRef = useRef<{ startValue: string; sections: string } | null>(null);
  const lastGraduatedLineSectionsRef = useRef(10);
  const graduatedLineMenuSuppressedIdRef = useRef<string | null>(null);
  const toolbarDragUntilRef = useRef(0);
  const toolbarDragMetaRef = useRef<ToolbarDragMeta | null>(null);
  const advancedToolRef = useRef<AdvancedTool>(null);
  const activeGeometryToolRef = useRef<GeometryTool | null>(null);
  const geometryDraftRef = useRef<GeometryDraft | null>(null);
  const geometryProtractorDraftRef = useRef<GeometryProtractorDraft | null>(null);
  const geometryAngleMeasurementRef = useRef<GeometryAngleMeasurement | null>(null);
  const geometryCompassDraftRef = useRef<GeometryCompassDraft | null>(null);
  const editingBlockRef = useRef<EditingBlockState>(null);
  const recentInlineBlockInteractionRef = useRef<{ blockId: string; timeStamp: number } | null>(null);
  const symbolResizeRef = useRef<SymbolResizeState | null>(null);
  const blockNodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const symbolNodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const textBoxNodeRefs = useRef<Record<string, HTMLElement | null>>({});
  const strokeNodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const geometryNodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const pendingFocusTextBoxIdRef = useRef<string | null>(null);
  const blockInputRefs = useRef<Record<string, Record<string, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const selectedElementMenuRef = useRef<HTMLDivElement | null>(null);
  const selectedGeometryMenuRef = useRef<HTMLDivElement | null>(null);
  const pendingNumericSelectionRef = useRef<{ blockId: string; field: string; start: number; end: number } | null>(null);
  const inlineLastKeyRef = useRef<{ key: string; time: number } | null>(null);
  const [activeResultCell, setActiveResultCell] = useState<{ blockId: string; cellIndex: number } | null>(null);
  const historyInitializedRef = useRef(false);
  const skipHistoryRef = useRef(false);
  const previousStateRef = useRef<WriterState>(cloneWriterState(createDefaultState(defaultSheetStyle, workbookUi.defaultDocumentLabels)));
  const stateRef = useRef<WriterState>(cloneWriterState(createDefaultState(defaultSheetStyle, workbookUi.defaultDocumentLabels)));
  const profileStoreRef = useRef<ProfileStore>(profileStore);
  const transientHistorySnapshotRef = useRef<WriterState | null>(null);
  const transientHistoryKindRef = useRef<"drag" | "edit" | null>(null);
  const suspendHistoryRef = useRef(false);

  const activeInlineShortcuts = useMemo(() => workbookUi.inlineShortcutGroups, [workbookUi]);
  const activeStructuredTools = useMemo(() => workbookUi.structuredTools, [workbookUi]);
  const rootStructuredTool = useMemo(() => activeStructuredTools.find((tool) => tool.id === "root") ?? null, [activeStructuredTools]);
  const operationStructuredTools = useMemo(() => activeStructuredTools.filter((tool) => tool.id !== "root"), [activeStructuredTools]);
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
  const commonInlineShortcuts = useMemo(() => activeInlineShortcuts.flatMap((group) => group.items).filter((item) => item.modes.includes("middleSchool")), [activeInlineShortcuts]);
  const visibleHighSchoolInlineShortcuts = useMemo(
    () => activeInlineShortcuts.flatMap((group) => group.items).filter((item) => item.modes.length === 1 && item.modes[0] === "highSchool"),
    [activeInlineShortcuts]
  );
  const selectedBlockId =
    selectedBlockIds.length === 1 && selectedSymbolIds.length === 0 && selectedTextBoxIds.length === 0 && selectedStrokeIds.length === 0 && selectedGeometryIds.length === 0
      ? selectedBlockIds[0]
      : null;
  const selectedSymbolId =
    selectedSymbolIds.length === 1 && selectedBlockIds.length === 0 && selectedTextBoxIds.length === 0 && selectedStrokeIds.length === 0 && selectedGeometryIds.length === 0
      ? selectedSymbolIds[0]
      : null;
  const selectedTextBoxId =
    selectedTextBoxIds.length === 1 && selectedBlockIds.length === 0 && selectedSymbolIds.length === 0 && selectedStrokeIds.length === 0 && selectedGeometryIds.length === 0
      ? selectedTextBoxIds[0]
      : null;
  const selectedStrokeId =
    selectedStrokeIds.length === 1 && selectedBlockIds.length === 0 && selectedSymbolIds.length === 0 && selectedTextBoxIds.length === 0 && selectedGeometryIds.length === 0
      ? selectedStrokeIds[0]
      : null;
  const selectedGeometryId =
    selectedGeometryIds.length === 1 && selectedBlockIds.length === 0 && selectedSymbolIds.length === 0 && selectedTextBoxIds.length === 0 && selectedStrokeIds.length === 0
      ? selectedGeometryIds[0]
      : null;
  const selectedCount = selectedBlockIds.length + selectedSymbolIds.length + selectedTextBoxIds.length + selectedStrokeIds.length + selectedGeometryIds.length;
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
  const selectedGeometry = useMemo(
    () => state.geometry.find((shape) => shape.id === selectedGeometryId) ?? null,
    [selectedGeometryId, state.geometry]
  );
  const geometryPanelHelper = useMemo(() => {
    if (!activeGeometryTool) {
      return t("geometryHelper.idle");
    }

    if (activeGeometryTool === "protractor") {
      if (!geometryProtractorDraft) {
        return t("geometryHelper.protractorFirstSide");
      }

      if (!geometryProtractorDraft.vertex) {
        return t("geometryHelper.protractorVertex");
      }

      return t("geometryHelper.protractorSecondSide");
    }

    if (activeGeometryTool === "compass") {
      if (!geometryCompassDraft) {
        return t("geometryHelper.compassCenter");
      }

      if (geometryCompassDraft.phase === "radius") {
        return t("geometryHelper.compassRadius");
      }

      return t("geometryHelper.compassArc");
    }

    if (geometryDraft) {
      if (activeGeometryTool === "measure") {
        return t("geometryHelper.measureSecondPoint");
      }

      return t("geometryHelper.finishShape");
    }

    if (activeGeometryTool === "measure") {
      return t("geometryHelper.measureTwoPoints");
    }

    return activeGeometryTool === "point"
      ? t("geometryHelper.placePoint")
      : activeGeometryTool === "circle"
        ? t("geometryHelper.placeCircleCenter")
        : t("geometryHelper.placeFirstPoint");
  }, [activeGeometryTool, geometryCompassDraft, geometryDraft, geometryProtractorDraft, t]);
  const geometryDraftIndicator = useMemo<GeometryDraftIndicator | null>(() => {
    if (activeGeometryTool === "protractor" && geometryProtractorDraft?.vertex) {
      const currentX = mmToPx(geometryProtractorDraft.current.xMm);
      const currentY = mmToPx(geometryProtractorDraft.current.yMm);

      return {
        x: currentX,
        y: currentY,
        label: `${Math.round(getGeometryAngleDegrees(geometryProtractorDraft.vertex, geometryProtractorDraft.firstPoint, geometryProtractorDraft.current))}°`
      };
    }

    if (activeGeometryTool === "compass" && geometryCompassDraft) {
      const currentX = mmToPx(geometryCompassDraft.current.xMm);
      const currentY = mmToPx(geometryCompassDraft.current.yMm);

      if (geometryCompassDraft.phase === "radius") {
        return {
          x: currentX,
          y: currentY,
          label: `r ${Math.round(
            Math.hypot(geometryCompassDraft.current.xMm - geometryCompassDraft.center.xMm, geometryCompassDraft.current.yMm - geometryCompassDraft.center.yMm)
          )} mm`
        };
      }

      return {
        x: currentX,
        y: currentY,
        label: `${Math.round((Math.abs(geometryCompassDraft.accumulatedSweep) * 180) / Math.PI)}°`
      };
    }

    if (!geometryDraft) {
      return null;
    }

    const currentX = mmToPx(geometryDraft.current.xMm);
    const currentY = mmToPx(geometryDraft.current.yMm);
    const lengthMm = Math.hypot(geometryDraft.current.xMm - geometryDraft.start.xMm, geometryDraft.current.yMm - geometryDraft.start.yMm);

    if (geometryDraft.tool === "circle") {
      return {
        x: currentX,
        y: currentY,
        label: `Ø ${Math.max(0, Math.round(lengthMm * 2))} mm`
      };
    }

    return {
      x: currentX,
      y: currentY,
      label: `${Math.max(0, Math.round(lengthMm))} mm`
    };
  }, [activeGeometryTool, geometryCompassDraft, geometryDraft, geometryProtractorDraft]);
  const selectedHighlightColor = useMemo(() => {
    const selectedItems = [
      ...state.blocks.filter((block) => selectedBlockIds.includes(block.id)).map((block) => block.highlightColor ?? ""),
      ...state.symbols.filter((symbol) => selectedSymbolIds.includes(symbol.id)).map((symbol) => symbol.highlightColor ?? ""),
      ...state.textBoxes.filter((textBox) => selectedTextBoxIds.includes(textBox.id)).map((textBox) => textBox.highlightColor ?? "")
    ];

    if (selectedItems.length === 0) {
      return state.activeTextHighlightColor;
    }

    return selectedItems.every((value) => value === selectedItems[0]) ? selectedItems[0] || null : state.activeTextHighlightColor;
  }, [selectedBlockIds, selectedSymbolIds, selectedTextBoxIds, state.activeTextHighlightColor, state.blocks, state.symbols, state.textBoxes]);
  const multiSelectionMenuPosition = useMemo(() => {
    if (selectedCount <= 1 || isCanvasInteracting || selectionRect || !canvasRef.current) {
      return null;
    }

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const selectedNodes = [
      ...selectedBlockIds.map((id) => blockNodeRefs.current[id]),
      ...selectedSymbolIds.map((id) => symbolNodeRefs.current[id]),
      ...selectedTextBoxIds.map((id) => textBoxNodeRefs.current[id]),
      ...selectedStrokeIds.map((id) => strokeNodeRefs.current[id]),
      ...selectedGeometryIds.map((id) => geometryNodeRefs.current[id])
    ].filter((node): node is HTMLElement | SVGGElement => Boolean(node));

    if (selectedNodes.length === 0) {
      return null;
    }

    const bounds = selectedNodes.map((node) => node.getBoundingClientRect());
    const minLeft = Math.min(...bounds.map((rect) => rect.left - canvasBounds.left));
    const maxRight = Math.max(...bounds.map((rect) => rect.right - canvasBounds.left));
    const minTop = Math.min(...bounds.map((rect) => rect.top - canvasBounds.top));
    const maxBottom = Math.max(...bounds.map((rect) => rect.bottom - canvasBounds.top));
    const centerX = (minLeft + maxRight) / 2;
    const menuWidth = 124;
    const menuHeight = 52;
    const horizontalGutter = 18;
    const menuOffset = 12;
    const minCenterX = horizontalGutter + menuWidth / 2;
    const maxCenterX = canvasBounds.width - horizontalGutter - menuWidth / 2;
    const x = minCenterX <= maxCenterX ? Math.min(Math.max(centerX, minCenterX), maxCenterX) : centerX;
    const aboveY = minTop - menuHeight - menuOffset;
    const belowY = maxBottom + menuOffset;
    const placement: "above" | "below" = aboveY >= horizontalGutter ? "above" : "below";

    return {
      x,
      y: placement === "above" ? Math.max(18, minTop - menuOffset) : Math.max(18, belowY),
      placement
    };
  }, [isCanvasInteracting, selectedBlockIds, selectedCount, selectedGeometryIds, selectedStrokeIds, selectedSymbolIds, selectedTextBoxIds, selectionRect, state.blocks, state.geometry, state.strokes, state.symbols, state.textBoxes]);
  const selectedFormatElement = useMemo(() => {
    const block = selectedBlockId ? state.blocks.find((b) => b.id === selectedBlockId) : null;
    if (block) return block;
    const symbol = selectedSymbolId ? state.symbols.find((s) => s.id === selectedSymbolId) : null;
    if (symbol) return symbol;
    const textBox = selectedTextBoxId ? state.textBoxes.find((t) => t.id === selectedTextBoxId) : null;
    if (textBox) return textBox;
    const stroke = selectedStrokeId ? state.strokes.find((s) => s.id === selectedStrokeId) : null;
    if (stroke) return { ...stroke, fontWeight: stroke.width >= 4 ? 700 : 500, fontStyle: "normal" as const, underline: false, highlightColor: null };
    return null;
  }, [selectedBlockId, selectedSymbolId, selectedTextBoxId, selectedStrokeId, state.blocks, state.symbols, state.textBoxes, state.strokes]);

  useEffect(() => {
    const hasFormatElement = selectedBlock || selectedSymbol || selectedTextBox || selectedStroke;
    if (!hasFormatElement || (selectedTextBox && editingTextBoxId === selectedTextBox.id) || selectedCount !== 1 || isCanvasInteracting || selectionRect || !canvasRef.current) {
      setSelectedElementMenuPosition(null);
      return;
    }

    const updateMenuPosition = () => {
      const canvasNode = canvasRef.current;
      const elementNode: HTMLElement | SVGGElement | null | undefined =
        selectedBlockId ? blockNodeRefs.current[selectedBlockId]
        : selectedSymbolId ? symbolNodeRefs.current[selectedSymbolId]
        : selectedTextBoxId ? textBoxNodeRefs.current[selectedTextBoxId]
        : selectedStrokeId ? strokeNodeRefs.current[selectedStrokeId]
        : null;

      if (!canvasNode || !elementNode) {
        setSelectedElementMenuPosition(null);
        return;
      }

      const canvasBounds = canvasNode.getBoundingClientRect();
      const elementBounds = elementNode.getBoundingClientRect();
      const menuNode = selectedElementMenuRef.current;
      const menuOffset = 12;
      const horizontalGutter = 18;
      const estimatedMenuWidth = menuNode?.offsetWidth ?? 236;
      const estimatedMenuHeight = menuNode?.offsetHeight ?? 52;
      const canvasWidth = canvasNode.clientWidth;
      const canvasHeight = canvasNode.clientHeight;
      const boxLeft = elementBounds.left - canvasBounds.left;
      const boxTop = elementBounds.top - canvasBounds.top;
      const boxWidth = elementBounds.width;
      const boxHeight = elementBounds.height;
      const boxBottom = boxTop + boxHeight;
      const preferredCenterX = boxLeft + boxWidth / 2;
      const minCenterX = horizontalGutter + estimatedMenuWidth / 2;
      const maxCenterX = canvasWidth - horizontalGutter - estimatedMenuWidth / 2;
      const x = minCenterX <= maxCenterX
        ? Math.min(Math.max(preferredCenterX, minCenterX), maxCenterX)
        : preferredCenterX;
      const aboveY = boxTop - estimatedMenuHeight - menuOffset;
      const belowY = boxBottom + menuOffset;
      const fitsAbove = aboveY >= horizontalGutter;
      const fitsBelow = belowY + estimatedMenuHeight <= canvasHeight - horizontalGutter;
      const placement: "above" | "below" = fitsAbove || !fitsBelow ? "above" : "below";
      const y = placement === "above" ? Math.max(horizontalGutter, boxTop - menuOffset) : Math.min(Math.max(horizontalGutter, belowY), Math.max(horizontalGutter, canvasHeight - horizontalGutter));

      setSelectedElementMenuPosition((current) =>
        current && current.x === x && current.y === y && current.placement === placement
          ? current
          : { x, y, placement }
      );
    };

    updateMenuPosition();

    const frameId = window.requestAnimationFrame(updateMenuPosition);
    const resizeHandler = () => updateMenuPosition();

    window.addEventListener("resize", resizeHandler);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeHandler);
    };
  }, [editingTextBoxId, isCanvasInteracting, selectedBlock, selectedBlockId, selectedCount, selectedStroke, selectedStrokeId, selectedSymbol, selectedSymbolId, selectedTextBox, selectedTextBoxId, selectionRect]);
  useEffect(() => {
    if (!selectedGeometry || selectedCount !== 1 || isCanvasInteracting || selectionRect || !canvasRef.current || activeGeometryTool) {
      setSelectedGeometryMenuPosition(null);
      return;
    }

    if (selectedGeometry.kind === "graduated-line" && graduatedLineMenuSuppressedIdRef.current === selectedGeometry.id) {
      graduatedLineMenuSuppressedIdRef.current = null;
      setSelectedGeometryMenuPosition(null);
      return;
    }

    const canvasNode = canvasRef.current;
    const geometryNode = geometryNodeRefs.current[selectedGeometry.id];

    if (!canvasNode || !geometryNode) {
      setSelectedGeometryMenuPosition(null);
      return;
    }

    const updateMenuPosition = () => {
      const menuNode = selectedGeometryMenuRef.current;
      const menuOffset = 12;
      const horizontalGutter = 18;
      const estimatedMenuWidth = menuNode?.offsetWidth ?? 220;
      const estimatedMenuHeight = menuNode?.offsetHeight ?? 110;
      const canvasWidth = canvasNode.clientWidth;
      const canvasHeight = canvasNode.clientHeight;
      const boxLeft = geometryNode.getBBox ? geometryNode.getBBox().x : geometryNode.getBoundingClientRect().left;
      const boxTop = geometryNode.getBBox ? geometryNode.getBBox().y : geometryNode.getBoundingClientRect().top;
      const boxWidth = geometryNode.getBBox ? geometryNode.getBBox().width : geometryNode.getBoundingClientRect().width;
      const boxHeight = geometryNode.getBBox ? geometryNode.getBBox().height : geometryNode.getBoundingClientRect().height;
      const boxBottom = boxTop + boxHeight;
      const preferredCenterX = boxLeft + boxWidth / 2;
      const minCenterX = horizontalGutter + estimatedMenuWidth / 2;
      const maxCenterX = canvasWidth - horizontalGutter - estimatedMenuWidth / 2;
      const x = minCenterX <= maxCenterX ? Math.min(Math.max(preferredCenterX, minCenterX), maxCenterX) : preferredCenterX;
      const aboveY = boxTop - estimatedMenuHeight - menuOffset;
      const belowY = boxBottom + menuOffset;
      const fitsAbove = aboveY >= horizontalGutter;
      const fitsBelow = belowY + estimatedMenuHeight <= canvasHeight - horizontalGutter;
      const placement: "above" | "below" = fitsAbove || !fitsBelow ? "above" : "below";
      const y = placement === "above" ? Math.max(horizontalGutter, boxTop - menuOffset) : Math.min(Math.max(horizontalGutter, belowY), Math.max(horizontalGutter, canvasHeight - horizontalGutter));

      setSelectedGeometryMenuPosition((current) =>
        current && current.x === x && current.y === y && current.placement === placement ? current : { x, y, placement }
      );
    };

    updateMenuPosition();

    const frameId = window.requestAnimationFrame(updateMenuPosition);
    const resizeHandler = () => updateMenuPosition();

    window.addEventListener("resize", resizeHandler);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeHandler);
    };
  }, [activeGeometryTool, isCanvasInteracting, selectedCount, selectedGeometry, selectionRect]);
  const pendingInsertLabel = useMemo(() => {
    if (!pendingInsertTool) {
      return "";
    }

    if (pendingInsertTool.kind === "text") {
      return t("canvas.emptyTextBox");
    }

    if (pendingInsertTool.kind === "structured") {
      return activeStructuredTools.find((tool) => tool.id === pendingInsertTool.toolId)?.label ?? workbookUi.blockTitles.default;
    }

    if (pendingInsertTool.kind === "scriptLetter") {
      return pendingInsertTool.label;
    }

    return findShortcutById(pendingInsertTool.shortcutId)?.hint ?? findShortcutById(pendingInsertTool.shortcutId)?.label ?? workbookUi.blockTitles.default;
  }, [pendingInsertTool, activeInlineShortcuts, activeStructuredTools, t, workbookUi.blockTitles.default]);

  useEffect(() => {
    let index = loadPageIndex();

    if (index.pages.length === 0) {
      index = migrateFromLegacyStorage(defaultSheetStyle, workbookUi.defaultDocumentLabels);
    }

    if (index.pages.length === 0) {
      const defaultState = createDefaultState(defaultSheetStyle, workbookUi.defaultDocumentLabels);
      createPage(workbookUi.defaultDocumentLabels.title, defaultState);
      index = loadPageIndex();
    }

    const activeId = index.activePageId ?? index.pages[0]?.id;

    if (activeId) {
      const loaded = loadPageState(activeId, defaultSheetStyle, workbookUi.defaultDocumentLabels);

      if (loaded) {
        setState(loaded);
      }

      index = { ...index, activePageId: activeId };
      savePageIndex(index);
    }

    setPageIndex(index);
    setIsHydrated(true);
  }, [defaultSheetStyle, workbookUi.defaultDocumentLabels]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1180px)");
    const updateCompactViewport = () => setIsCompactViewport(mediaQuery.matches);

    updateCompactViewport();
    mediaQuery.addEventListener("change", updateCompactViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateCompactViewport);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || !pageIndex.activePageId) {
      return;
    }

    savePageState(pageIndex.activePageId, state);
  }, [isHydrated, state, pageIndex.activePageId]);

  useEffect(() => {
    const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);

    if (saved) {
      const parsed = parseStoredProfiles(saved);

      if (parsed) {
        setProfileStore(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileStore));
  }, [isHydrated, profileStore]);

  useEffect(() => {
    const handleInstallable = (event: Event) => {
      const customEvent = event as CustomEvent<{available?: boolean}>;
      setCanInstallApp(Boolean(customEvent.detail?.available));
    };

    const handleInstalled = () => {
      setCanInstallApp(false);
      setIsInstalledApp(true);
    };

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & {standalone?: boolean}).standalone === true;

    setIsInstalledApp(isStandalone);
    setCanInstallApp(Boolean(window.__dysmathsDeferredInstallPrompt) && !isStandalone);

    window.addEventListener(PWA_INSTALLABLE_EVENT, handleInstallable as EventListener);
    window.addEventListener(PWA_INSTALLED_EVENT, handleInstalled);

    return () => {
      window.removeEventListener(PWA_INSTALLABLE_EVENT, handleInstallable as EventListener);
      window.removeEventListener(PWA_INSTALLED_EVENT, handleInstalled);
    };
  }, []);

  useEffect(() => {
    blocksRef.current = state.blocks;
    symbolsRef.current = state.symbols;
    textBoxesRef.current = state.textBoxes;
    strokesRef.current = state.strokes;
    geometryRef.current = state.geometry;
  }, [state.blocks, state.geometry, state.strokes, state.symbols, state.textBoxes]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    profileStoreRef.current = profileStore;
  }, [profileStore]);

  useEffect(() => {
    graduatedLineDraftRef.current = graduatedLineDraft;
  }, [graduatedLineDraft]);

  useEffect(() => {
    graduatedLineModalStateRef.current = graduatedLineModalState;
  }, [graduatedLineModalState]);

  useEffect(() => {
    graduatedLineModalSettingsRef.current = graduatedLineModalSettings;
  }, [graduatedLineModalSettings]);

  useEffect(() => {
    if (!selectedGeometry || selectedGeometry.kind !== "graduated-line") {
      selectedGraduatedLineSettingsRef.current = null;
      setSelectedGraduatedLineSettings(null);
      return;
    }

    const nextSettings = {
      startValue: String(selectedGeometry.startValue ?? 0),
      sections: String(selectedGeometry.sections ?? 10)
    };
    selectedGraduatedLineSettingsRef.current = nextSettings;
    setSelectedGraduatedLineSettings(nextSettings);
  }, [selectedGeometryId, selectedGeometry?.kind]);

  useEffect(() => {
    advancedToolRef.current = advancedTool;
  }, [advancedTool]);

  useEffect(() => {
    activeGeometryToolRef.current = activeGeometryTool;
  }, [activeGeometryTool]);

  useEffect(() => {
    geometryDraftRef.current = geometryDraft;
  }, [geometryDraft]);

  useEffect(() => {
    geometryProtractorDraftRef.current = geometryProtractorDraft;
  }, [geometryProtractorDraft]);

  useEffect(() => {
    geometryAngleMeasurementRef.current = geometryAngleMeasurement;
  }, [geometryAngleMeasurement]);

  useEffect(() => {
    geometryCompassDraftRef.current = geometryCompassDraft;
  }, [geometryCompassDraft]);

  useEffect(() => {
    editingBlockRef.current = editingBlock;
  }, [editingBlock]);

  useEffect(() => {
    strikeModeBlockIdRef.current = strikeModeBlockId;
  }, [strikeModeBlockId]);

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

      if (event.key === "Escape") {
        if (graduatedLineModalStateRef.current) {
          event.preventDefault();
          cancelGraduatedLineModal();
          return;
        }

        if (graduatedLineDraftRef.current) {
          event.preventDefault();
          clearGraduatedLineDraftState();
          setIsCanvasInteracting(false);
          return;
        }

        if (geometryDraftRef.current) {
          event.preventDefault();
          clearGeometryDraftState();
          return;
        }

        if (activeGeometryToolRef.current) {
          event.preventDefault();
          setActiveGeometryTool(null);
          setGeometryAngleMeasurement(null);
          setGeometryMeasurement(null);
          setSnapGuides({ x: null, y: null });
          return;
        }

        if (advancedToolRef.current) {
          event.preventDefault();
          setAdvancedTool(null);
          setPendingInsertTool(null);
          return;
        }
      }

      if (
        canvasQuickMenu &&
        event.key.length === 1 &&
        !isModifierPressed &&
        !event.altKey
      ) {
        event.preventDefault();
        createTextBoxAt(canvasQuickMenu.clickX, canvasQuickMenu.clickY, "exact", event.key);
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedCount > 0) {
        event.preventDefault();
        handleHeaderDelete();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [canvasQuickMenu, selectedCount, historyPast.length, historyFuture.length, selectedBlock, selectedGeometry, selectedSymbol, selectedTextBox, selectedStroke]);

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (advancedToolRef.current !== "highlight") {
        return;
      }

      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (canvasRef.current?.contains(target)) {
        return;
      }

      if (target.closest(".toolbar-highlight-shell") || target.closest(".toolbar-highlight-panel")) {
        return;
      }

      setAdvancedTool(null);
      setOpenMenu(null);
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => document.removeEventListener("mousedown", handleDocumentMouseDown);
  }, []);

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
    selectedGeometryIdsRef.current = selectedGeometryIds;
  }, [selectedBlockIds, selectedGeometryIds, selectedStrokeIds, selectedSymbolIds, selectedTextBoxIds]);

  useEffect(() => {
    if (!pendingFocusTextBoxIdRef.current || editingTextBoxId !== pendingFocusTextBoxIdRef.current) {
      return;
    }

    const node = textBoxNodeRefs.current[pendingFocusTextBoxIdRef.current]?.querySelector("textarea, input") as HTMLTextAreaElement | HTMLInputElement | null;

    if (!node) {
      return;
    }

    node.focus();
    const cursorPosition = node.value.length;
    node.setSelectionRange(cursorPosition, cursorPosition);
    pendingFocusTextBoxIdRef.current = null;
  }, [editingTextBoxId, state.textBoxes]);

  useEffect(() => {
    if (!editingBlock) {
      setActiveResultCell(null);
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
      const targetCellIndex = getAlignedCaretCellIndex(lineValue, columns, "start", caretPosition);

      setEditingBlock({ blockId: block.id, field: `${carryField}:${targetCellIndex}` });
      return;
    }

    if (block && isColumnArithmeticBlock(block) && editingBlock.field === "result") {
      const columns = getColumnArithmeticColumns(block);
      const defaultCellIndex = Math.min(columns - 1, Array.from(block.result).length);

      setActiveResultCell((current) =>
        current?.blockId === block.id ? current : { blockId: block.id, cellIndex: defaultCellIndex }
      );
    } else {
      setActiveResultCell((current) => (current ? null : current));
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
      (editingBlock.field === "top" || editingBlock.field === "bottom");
    const isArithmeticResultField = block && isColumnArithmeticBlock(block) && editingBlock.field === "result";
    const isDivisionNumericField =
      block &&
      block.type === "division" &&
      (editingBlock.field === "dividend" || editingBlock.field === "divisor" || editingBlock.field === "quotient" || editingBlock.field.startsWith("work:"));

    if (isArithmeticResultField) {
      input.setSelectionRange(0, input.value.length);
      return;
    }

    if (isArithmeticNumericField || isDivisionNumericField) {
      let numericValue = "";

      if (isArithmeticNumericField) {
        numericValue = block[editingBlock.field as ArithmeticLineField];
      } else if (isDivisionNumericField) {
        numericValue =
          editingBlock.field.startsWith("work:")
            ? getDivisionWorkLines(block.work)[Number.parseInt(editingBlock.field.slice(5), 10)] ?? ""
            : block[editingBlock.field as "dividend" | "divisor" | "quotient"];
      }

      const caretKey = `${editingBlock.blockId}:${editingBlock.field}`;
      const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(numericValue).length;
      const pendingSelection = pendingNumericSelectionRef.current;

      if (pendingSelection && pendingSelection.blockId === editingBlock.blockId && pendingSelection.field === editingBlock.field) {
        input.setSelectionRange(pendingSelection.start, pendingSelection.end);
        pendingNumericSelectionRef.current = null;
        return;
      }

      input.setSelectionRange(caretPosition, caretPosition);
      return;
    }

    if (document.activeElement === input) {
      return;
    }

    input.select();
  }, [activeResultCell, editingBlock, numericFieldCaretPositions, strikeModeBlockId]);

  useEffect(() => {
    const element = editorRef.current;

    if (element && document.activeElement !== element && element.innerHTML !== state.textHtml) {
      element.innerHTML = state.textHtml;
    }
  }, [state.textHtml]);

  useEffect(() => {
    function handlePointerMove(clientX: number, clientY: number) {
      if (symbolResizeRef.current) {
        updateSymbolResize(clientX, clientY);
        return;
      }

      if (updateGeometryToolPreview(clientX, clientY)) {
        return;
      }

      if (updateGraduatedLineDraft(clientX, clientY)) {
        return;
      }

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

      if (dragRef.current.itemType === "geometry") {
        const pointer = getPreciseCanvasPoint(clientX, clientY);
        const deltaX = pointer.x - dragRef.current.pointerOriginX;
        const deltaY = pointer.y - dragRef.current.pointerOriginY;
        const intrinsic = getCanvasIntrinsicSize();
        const measuredGeometry = dragRef.current.groupGeometryShapes.map((shape) => ({
          id: shape.id,
          bounds: getGeometryShapeBoundsPx(shape, intrinsic.width, intrinsic.height)
        }));

        if (measuredGeometry.length === 0) {
          return;
        }

        const groupBounds = {
          left: Math.min(...measuredGeometry.map((item) => item.bounds.x)),
          top: Math.min(...measuredGeometry.map((item) => item.bounds.y)),
          right: Math.max(...measuredGeometry.map((item) => item.bounds.x + item.bounds.width)),
          bottom: Math.max(...measuredGeometry.map((item) => item.bounds.y + item.bounds.height))
        };
        const clampedDeltaX = Math.max(18 - groupBounds.left, Math.min(intrinsic.width - 18 - groupBounds.right, deltaX));
        const clampedDeltaY = Math.max(18 - groupBounds.top, Math.min(intrinsic.height - 18 - groupBounds.bottom, deltaY));

        setState((current) => ({
          ...current,
          geometry: current.geometry.map((shape) => {
            const dragged = dragRef.current?.groupGeometryShapes.find((item) => item.id === shape.id);

            if (!dragged) {
              return shape;
            }

            return translateGeometryShape(dragged, pxToMm(clampedDeltaX), pxToMm(clampedDeltaY));
          })
        }));
        setSnapGuides({ x: null, y: null });
        return;
      }

      const nextAnchorX = clientX - bounds.left - dragRef.current.pointerOffsetX;
      const nextAnchorY = clientY - bounds.top - dragRef.current.pointerOffsetY;
      const draggedNode =
        dragRef.current.itemType === "block"
          ? blockNodeRefs.current[dragRef.current.itemId]
          : dragRef.current.itemType === "symbol"
            ? symbolNodeRefs.current[dragRef.current.itemId]
            : dragRef.current.itemType === "textBox"
              ? textBoxNodeRefs.current[dragRef.current.itemId]
              : dragRef.current.itemType === "stroke"
                ? strokeNodeRefs.current[dragRef.current.itemId]
                : geometryNodeRefs.current[dragRef.current.itemId];
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
        }),
        geometry: current.geometry
      }));
    }

    function handleMouseMove(event: MouseEvent) {
      handlePointerMove(event.clientX, event.clientY);
    }

    function handleTouchMove(event: TouchEvent) {
      if (
        !isDrawingStrokeRef.current &&
        !graduatedLineDraftRef.current &&
        !pendingSelectionRef.current &&
        !dragRef.current &&
        !symbolResizeRef.current &&
        !geometryDraftRef.current &&
        !geometryProtractorDraftRef.current &&
        !geometryCompassDraftRef.current
      ) {
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
      if (symbolResizeRef.current) {
        symbolResizeRef.current = null;
        commitTransientHistorySession("drag");
        setIsCanvasInteracting(false);
        setSnapGuides({ x: null, y: null });
        return;
      }

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

      if (graduatedLineDraftRef.current && !graduatedLineModalStateRef.current) {
        isDrawingStrokeRef.current = false;
        const graduatedLineSession = graduatedLinePointerSessionRef.current;

        if (graduatedLineSession.isPointerDown && graduatedLineSession.hasMoved) {
          graduatedLinePointerSessionRef.current = { isPointerDown: false, hasMoved: false };
          openGraduatedLineModal();
          setIsCanvasInteracting(false);
          return;
        }

        if (graduatedLineSession.isPointerDown) {
          graduatedLinePointerSessionRef.current = { isPointerDown: false, hasMoved: false };
          setIsCanvasInteracting(false);
          return;
        }
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
    const defaultFontSize = state.activeFontSize;
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
        fontWeight: state.activeFontWeight,
        fontStyle: state.activeFontStyle,
        underline: state.activeUnderline,
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
        fontWeight: state.activeFontWeight,
        fontStyle: state.activeFontStyle,
        underline: state.activeUnderline,
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
        fontWeight: state.activeFontWeight,
        fontStyle: state.activeFontStyle,
        underline: state.activeUnderline,
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
        fontWeight: state.activeFontWeight,
        fontStyle: state.activeFontStyle,
        underline: state.activeUnderline,
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
        fontWeight: state.activeFontWeight,
        fontStyle: state.activeFontStyle,
        underline: state.activeUnderline,
        highlightColor: null,
        ...position
      } satisfies MathBlock;
    }

    if (type === "power") {
      return { id: createId("power"), type, base: "", exponent: "", result: "", caption: "", color: state.activeColor, fontSize: defaultFontSize, fontWeight: state.activeFontWeight, fontStyle: state.activeFontStyle, underline: state.activeUnderline, highlightColor: null, ...position } satisfies MathBlock;
    }

    return { id: createId("root"), type, radicand: "", result: "", caption: "", color: state.activeColor, fontSize: defaultFontSize, fontWeight: state.activeFontWeight, fontStyle: state.activeFontStyle, underline: state.activeUnderline, highlightColor: null, ...position } satisfies MathBlock;
  }

  function createFloatingSymbol(shortcut: InlineShortcutItem, x: number, y: number) {
    const defaultFontSize = state.activeFontSize;

    if (shortcut.id === "sum") {
      return {
        id: createId("symbol"),
        type: "symbol",
        label: shortcut.label,
        content: shortcut.label,
        kind: "sum",
        size: DEFAULT_SUM_SYMBOL_SIZE,
        x,
        y,
        color: state.activeColor,
        fontSize: defaultFontSize,
        fontWeight: state.activeFontWeight,
        fontStyle: state.activeFontStyle,
        underline: state.activeUnderline,
        highlightColor: null
      } satisfies FloatingSymbol;
    }

    if (shortcut.id === "integral") {
      return {
        id: createId("symbol"),
        type: "symbol",
        label: shortcut.label,
        content: shortcut.label,
        kind: "integral",
        size: DEFAULT_INTEGRAL_SYMBOL_SIZE,
        x,
        y,
        color: state.activeColor,
        fontSize: defaultFontSize,
        fontWeight: state.activeFontWeight,
        fontStyle: state.activeFontStyle,
        underline: state.activeUnderline,
        highlightColor: null
      } satisfies FloatingSymbol;
    }

    return {
      id: createId("symbol"),
      type: "symbol",
      label: shortcut.label,
      content: shortcut.content.trim() || shortcut.label,
      kind: "text",
      x,
      y,
      color: state.activeColor,
      fontSize: defaultFontSize,
      fontWeight: state.activeFontWeight,
      fontStyle: state.activeFontStyle,
      underline: state.activeUnderline,
      highlightColor: null
    } satisfies FloatingSymbol;
  }

  function getFloatingSymbolMeasure(symbol: FloatingSymbol) {
    if (symbol.kind === "sum" || symbol.kind === "integral") {
      const size = symbol.size ?? (symbol.kind === "integral" ? DEFAULT_INTEGRAL_SYMBOL_SIZE : DEFAULT_SUM_SYMBOL_SIZE);
      return {
        width: size,
        height: size
      };
    }

    const defaultFontSize = getDefaultCanvasFontSize(state.sheetStyle);
    const textMeasure = Math.max(24, Math.round((symbol.fontSize || defaultFontSize) * 18));

    return {
      width: textMeasure,
      height: Math.max(24, Math.round((symbol.fontSize || defaultFontSize) * 20))
    };
  }

  function createFloatingTextBox(
    x: number,
    y: number,
    variant: "default" | "note" = "default",
    notation: "plain" | "angle" = "plain",
    yOffset = FLOATING_TEXTBOX_Y_OFFSET
  ) {
    const defaultFontSize = state.activeFontSize;
    const defaultNoteFontSize = getDefaultNoteFontSize(state.sheetStyle);
    return {
      id: createId("text"),
      type: "textBox",
      variant,
      notation,
      text: "",
      color: state.activeColor,
      fontSize: variant === "note" ? defaultNoteFontSize : defaultFontSize,
      fontWeight: state.activeFontWeight,
      fontStyle: state.activeFontStyle,
      underline: state.activeUnderline,
      highlightColor: null,
      x,
      y: Math.max(18, y - yOffset),
      width: variant === "note" ? 72 : 100
    } satisfies FloatingTextBox;
  }

  function createAngleTextBox(x: number, y: number) {
    const initialText = "ABC";

    return {
      ...createFloatingTextBox(x, y, "default", "angle"),
      text: initialText,
      width: getTextBoxWidth(initialText, state.activeFontSize, activeFont)
    } satisfies FloatingTextBox;
  }

  function getExactTextBoxVerticalOffset(variant: "default" | "note" = "default") {
    const rem = getRemPixels();
    const fontSize = variant === "note" ? getDefaultNoteFontSize(state.sheetStyle) : getDefaultCanvasFontSize(state.sheetStyle);
    const estimatedHeightPx = rem * fontSize * 1.4;

    return Math.max(8, Math.round(estimatedHeightPx / 2));
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
    setSelectedGeometryIds([]);
  }

  function selectSingleBlock(blockId: string) {
    setSelectedBlockIds([blockId]);
    setSelectedSymbolIds([]);
    setSelectedTextBoxIds([]);
    setSelectedStrokeIds([]);
    setSelectedGeometryIds([]);
  }

  function selectSingleSymbol(symbolId: string) {
    setSelectedSymbolIds([symbolId]);
    setSelectedBlockIds([]);
    setSelectedTextBoxIds([]);
    setSelectedStrokeIds([]);
    setSelectedGeometryIds([]);
  }

  function startSymbolResize(symbolId: string, handle: SymbolResizeHandle, clientX: number, clientY: number) {
    const symbol = stateRef.current.symbols.find((item) => item.id === symbolId);

    if (!symbol || (symbol.kind !== "sum" && symbol.kind !== "integral")) {
      return;
    }

    selectSingleSymbol(symbolId);
    setCanvasQuickMenu(null);
    beginTransientHistorySession("drag");
    symbolResizeRef.current = {
      symbolId,
      handle,
      startClientX: clientX,
      startClientY: clientY,
      startX: symbol.x,
      startY: symbol.y,
      startSize: symbol.size ?? DEFAULT_SUM_SYMBOL_SIZE
    };
    setIsCanvasInteracting(true);
  }

  function updateSymbolResize(clientX: number, clientY: number) {
    const resize = symbolResizeRef.current;

    if (!resize) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const dx = clientX - resize.startClientX;
    const dy = clientY - resize.startClientY;
    const delta = resize.handle === "se" ? Math.max(dx, dy) : Math.max(-dx, -dy);
    const nextSize = Math.max(24, Math.min(220, Math.round(resize.startSize + delta)));
    const nextX = resize.handle === "se" ? resize.startX : resize.startX + (resize.startSize - nextSize);
    const nextY = resize.handle === "se" ? resize.startY : resize.startY + (resize.startSize - nextSize);

    setState((current) => ({
      ...current,
      symbols: current.symbols.map((symbol) =>
        symbol.id === resize.symbolId && (symbol.kind === "sum" || symbol.kind === "integral")
          ? { ...symbol, x: Math.max(18, Math.min(bounds.width - 24, nextX)), y: Math.max(18, Math.min(bounds.height - 24, nextY)), size: nextSize }
          : symbol
      )
    }));
  }

  function selectSingleTextBox(textBoxId: string) {
    setSelectedTextBoxIds([textBoxId]);
    setSelectedBlockIds([]);
    setSelectedSymbolIds([]);
    setSelectedStrokeIds([]);
    setSelectedGeometryIds([]);
  }

  function selectSingleStroke(strokeId: string) {
    setSelectedStrokeIds([strokeId]);
    setSelectedBlockIds([]);
    setSelectedSymbolIds([]);
    setSelectedTextBoxIds([]);
    setSelectedGeometryIds([]);
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

  function getCanvasIntrinsicSize() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        width: Math.round(mmToPx(210)),
        height: Math.round(mmToPx(297))
      };
    }

    return {
      width: canvas.clientWidth || Math.round(mmToPx(210)),
      height: canvas.clientHeight || Math.round(mmToPx(297))
    };
  }

  function getPreciseCanvasPoint(clientX: number, clientY: number) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const bounds = canvas.getBoundingClientRect();
    const intrinsic = getCanvasIntrinsicSize();

    return {
      x: Math.max(0, Math.min(intrinsic.width, clientX - bounds.left)),
      y: Math.max(0, Math.min(intrinsic.height, clientY - bounds.top))
    };
  }

  function getGeometrySnapPoint(clientX: number, clientY: number) {
    const intrinsic = getCanvasIntrinsicSize();
    const point = getPreciseCanvasPoint(clientX, clientY);
    let nextX = Math.max(18, Math.min(intrinsic.width - 18, Math.round(point.x)));
    let nextY = Math.max(18, Math.min(intrinsic.height - 18, Math.round(point.y)));
    let guideX: number | null = null;
    let guideY: number | null = null;
    const activeTool = activeGeometryToolRef.current;
    const measuredAngle = geometryAngleMeasurementRef.current;
    const shouldSnapToProtractor = isGeometryConstructionTool(activeTool) && Boolean(measuredAngle);

    if (shouldSnapToProtractor && measuredAngle) {
      const candidates = [
        getSnapPointOnLinePx(nextX, nextY, measuredAngle.vertex, measuredAngle.baseline),
        getSnapPointOnLinePx(nextX, nextY, measuredAngle.vertex, measuredAngle.end)
      ].filter((candidate): candidate is { x: number; y: number; distance: number } => Boolean(candidate));
      const bestCandidate = candidates.sort((left, right) => left.distance - right.distance)[0];

      if (bestCandidate && bestCandidate.distance <= 18) {
        nextX = Math.round(bestCandidate.x);
        nextY = Math.round(bestCandidate.y);
      }
    }

    if (stateRef.current.sheetStyle === "small-grid") {
      const metrics = getSheetMetrics(stateRef.current.sheetStyle, getRemPixels());
      const snappedX = metrics.originX + Math.round((nextX - metrics.originX) / metrics.snapXStep) * metrics.snapXStep;
      const snappedY = metrics.originY + Math.round((nextY - metrics.originY) / metrics.snapYStep) * metrics.snapYStep;
      const horizontalThreshold = Math.min(MAX_SNAP_THRESHOLD_PX, metrics.snapXStep * 0.26);
      const verticalThreshold = Math.min(MAX_SNAP_THRESHOLD_PX, metrics.snapYStep * 0.22);
      const useSnapX = metrics.snapX && Math.abs(nextX - snappedX) <= horizontalThreshold;
      const useSnapY = metrics.snapY && Math.abs(nextY - snappedY) <= verticalThreshold;

      if (useSnapX) {
        nextX = Math.max(18, Math.min(intrinsic.width - 18, Math.round(snappedX)));
        guideX = nextX;
      }

      if (useSnapY) {
        nextY = Math.max(18, Math.min(intrinsic.height - 18, Math.round(snappedY)));
        guideY = nextY;
      }
    }

    return {
      x: nextX,
      y: nextY,
      xMm: pxToMm(nextX),
      yMm: pxToMm(nextY),
      guides: {
        x: guideX,
        y: guideY
      }
    };
  }

  function updateGeometryToolPreview(clientX: number, clientY: number) {
    if (geometryProtractorDraftRef.current && !dragRef.current && !pendingSelectionRef.current && !isDrawingStrokeRef.current) {
      const snappedPoint = getGeometrySnapPoint(clientX, clientY);
      setGeometryProtractorDraft((current) =>
        current
          ? {
              ...current,
              current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
            }
          : current
      );
      setSnapGuides(snappedPoint.guides);
      return true;
    }

    if (geometryCompassDraftRef.current && !dragRef.current && !pendingSelectionRef.current && !isDrawingStrokeRef.current) {
      const snappedPoint = getGeometrySnapPoint(clientX, clientY);
      setGeometryCompassDraft((current) =>
        current
          ? {
              ...(() => {
                if (current.phase === "radius") {
                  return {
                    ...current,
                    current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
                  };
                }

                const nextAngle = getGeometryAngleFromCenter(current.center, { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm });
                const previousAngle = current.currentAngle ?? current.startAngle ?? nextAngle;
                const delta = normalizeSignedAngleDelta(nextAngle - previousAngle);
                const radiusMm = current.radiusMm ?? Math.hypot(current.current.xMm - current.center.xMm, current.current.yMm - current.center.yMm);
                const clampedSweep = Math.max(-Math.PI * 2, Math.min(Math.PI * 2, current.accumulatedSweep + delta));
                const arcEndAngle = (current.startAngle ?? nextAngle) + clampedSweep;
                const projectedPoint = {
                  xMm: current.center.xMm + Math.cos(arcEndAngle) * radiusMm,
                  yMm: current.center.yMm + Math.sin(arcEndAngle) * radiusMm
                };

                return {
                  ...current,
                  current: projectedPoint,
                  currentAngle: nextAngle,
                  accumulatedSweep: clampedSweep
                };
              })()
            }
          : current
      );
      setSnapGuides(snappedPoint.guides);
      return true;
    }

    if (geometryDraftRef.current && !dragRef.current && !pendingSelectionRef.current && !isDrawingStrokeRef.current) {
      const snappedPoint = getGeometrySnapPoint(clientX, clientY);
      setGeometryDraft((current) =>
        current
          ? {
              ...current,
              current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
            }
          : current
      );
      setSnapGuides(snappedPoint.guides);
      return true;
    }

    return false;
  }

function createGeometryShapeFromDraft(draft: GeometryDraft): Exclude<GeometryShape, GeometryArcShape> | null {
    if (draft.tool === "measure" || draft.tool === "protractor" || draft.tool === "compass") {
      return null;
    }

    if (draft.tool === "point") {
      return {
        id: createId("geometry"),
        type: "geometry",
        kind: "point",
        xMm: draft.current.xMm,
        yMm: draft.current.yMm,
        label: "",
        color: stateRef.current.activeColor,
        strokeWidthMm: DEFAULT_GEOMETRY_STROKE_WIDTH_MM
      };
    }

    if (draft.tool === "circle") {
      const radiusMm = Math.hypot(draft.current.xMm - draft.start.xMm, draft.current.yMm - draft.start.yMm);

      if (radiusMm < 0.8) {
        return null;
      }

      return {
        id: createId("geometry"),
        type: "geometry",
        kind: "circle",
        cxMm: draft.start.xMm,
        cyMm: draft.start.yMm,
        radiusMm,
        color: stateRef.current.activeColor,
        strokeWidthMm: DEFAULT_GEOMETRY_STROKE_WIDTH_MM
      };
    }

    const distanceMm = Math.hypot(draft.current.xMm - draft.start.xMm, draft.current.yMm - draft.start.yMm);

    if (distanceMm < 0.8) {
      return null;
    }

    if (draft.tool !== "segment" && draft.tool !== "line" && draft.tool !== "ray") {
      return null;
    }

    return {
      id: createId("geometry"),
      type: "geometry",
      kind: draft.tool,
      axMm: draft.start.xMm,
      ayMm: draft.start.yMm,
      bxMm: draft.current.xMm,
      byMm: draft.current.yMm,
      color: stateRef.current.activeColor,
      strokeWidthMm: DEFAULT_GEOMETRY_STROKE_WIDTH_MM
    };
  }

  function clearGeometryDraftState() {
    setGeometryDraft(null);
    setGeometryProtractorDraft(null);
    setGeometryCompassDraft(null);
    setSnapGuides({ x: null, y: null });
  }

  function selectSingleGeometry(shapeId: string) {
    setSelectedGeometryIds([shapeId]);
    setSelectedBlockIds([]);
    setSelectedSymbolIds([]);
    setSelectedTextBoxIds([]);
    setSelectedStrokeIds([]);
  }

  function insertGeometryShape(shape: GeometryShape, options?: { selectAfterInsert?: boolean; clearGeometryTool?: boolean }) {
    const selectAfterInsert = options?.selectAfterInsert ?? true;
    const clearGeometryTool = options?.clearGeometryTool ?? true;
    beginTransientHistorySession("edit");
    setState((current) => ({
      ...current,
      geometry: [...current.geometry, shape]
    }));
    if (selectAfterInsert) {
      selectSingleGeometry(shape.id);
    }
    setCanvasQuickMenu(null);
    if (clearGeometryTool) {
      setActiveGeometryTool(null);
      clearGeometryDraftState();
    }
    scheduleTransientHistoryCommit("edit");
  }

  function insertCompassArcFromSweep(center: GeometryPointCoordinate, radiusMm: number, startAngle: number, sweepAngle: number) {
    if (radiusMm < 0.8) {
      return;
    }

    if (Math.abs(sweepAngle) >= Math.PI * 2 - 0.18) {
      insertGeometryShape({
        id: createId("geometry"),
        type: "geometry",
        kind: "circle",
        cxMm: center.xMm,
        cyMm: center.yMm,
        radiusMm,
        color: stateRef.current.activeColor,
        strokeWidthMm: DEFAULT_GEOMETRY_STROKE_WIDTH_MM
      }, { selectAfterInsert: false });
      return;
    }

    insertGeometryShape({
      id: createId("geometry"),
      type: "geometry",
      kind: "arc",
      cxMm: center.xMm,
      cyMm: center.yMm,
      radiusMm,
      startAngle,
      endAngle: startAngle + sweepAngle,
      color: stateRef.current.activeColor,
      strokeWidthMm: DEFAULT_GEOMETRY_STROKE_WIDTH_MM
    }, { selectAfterInsert: false });
  }

  function clearGraduatedLineDraftState() {
    setGraduatedLineDraft(null);
    setGraduatedLineModalState(null);
    setGraduatedLineModalSettings(null);
    setSnapGuides({ x: null, y: null });
    graduatedLineModalStateRef.current = null;
    graduatedLineModalSettingsRef.current = null;
    graduatedLineDraftRef.current = null;
    graduatedLinePointerSessionRef.current = { isPointerDown: false, hasMoved: false };
  }

  function createGraduatedLineShape(start: GeometryPointCoordinate, end: GeometryPointCoordinate, sections: number) {
    return {
      id: createId("geometry"),
      type: "geometry",
      kind: "graduated-line",
      axMm: start.xMm,
      ayMm: start.yMm,
      bxMm: end.xMm,
      byMm: end.yMm,
      startValue: 0,
      sections: Math.max(1, Math.round(sections)),
      color: stateRef.current.activeColor,
      strokeWidthMm: DEFAULT_GEOMETRY_STROKE_WIDTH_MM
    } satisfies GraduatedLineModalShape;
  }

  function beginGraduatedLineDrawing(clientX: number, clientY: number) {
    const snappedPoint = getGeometrySnapPoint(clientX, clientY);
    setCanvasQuickMenu(null);
    setOpenMenu(null);
    clearFloatingSelection();
    setIsCanvasInteracting(true);
    setGraduatedLineModalState(null);
    setGraduatedLineModalSettings(null);
    const nextDraft = {
      start: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm },
      current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
    };
    graduatedLineDraftRef.current = nextDraft;
    graduatedLinePointerSessionRef.current = { isPointerDown: true, hasMoved: false };
    setGraduatedLineDraft(nextDraft);
    setSnapGuides(snappedPoint.guides);
  }

  function updateGraduatedLineDraft(clientX: number, clientY: number) {
    if (!graduatedLineDraftRef.current || graduatedLineModalStateRef.current) {
      return false;
    }

    const snappedPoint = getGeometrySnapPoint(clientX, clientY);
    const lockedPoint = getGraduatedLineAxisLockedPoint(
      graduatedLineDraftRef.current.start,
      { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm },
      snappedPoint.guides
    );
    const previousDraft = graduatedLineDraftRef.current;
    graduatedLinePointerSessionRef.current = {
      ...graduatedLinePointerSessionRef.current,
      hasMoved:
        graduatedLinePointerSessionRef.current.hasMoved ||
        Math.abs(lockedPoint.xMm - previousDraft.current.xMm) > 0.01 ||
        Math.abs(lockedPoint.yMm - previousDraft.current.yMm) > 0.01
    };
    setGraduatedLineDraft((current) => {
      if (!current) {
        return current;
      }

      const nextDraft = {
        ...current,
        current: { xMm: lockedPoint.xMm, yMm: lockedPoint.yMm }
      };
      graduatedLineDraftRef.current = nextDraft;
      return nextDraft;
    });
    setSnapGuides(lockedPoint.guides);
    return true;
  }

  function finishGraduatedLineDrawing(clientX: number, clientY: number) {
    if (!graduatedLineDraftRef.current || graduatedLineModalStateRef.current) {
      return false;
    }

    updateGraduatedLineDraft(clientX, clientY);
    graduatedLinePointerSessionRef.current = { isPointerDown: false, hasMoved: false };
    openGraduatedLineModal();
    setIsCanvasInteracting(false);
    return true;
  }

  function openGraduatedLineModal() {
    const draft = graduatedLineDraftRef.current;

    if (!draft) {
      return;
    }

    const distanceMm = Math.hypot(draft.current.xMm - draft.start.xMm, draft.current.yMm - draft.start.yMm);

    if (distanceMm < 0.8) {
      clearGraduatedLineDraftState();
      return;
    }

    setAdvancedTool(null);
    const nextSettings = {
      startValue: "0",
      sections: String(lastGraduatedLineSectionsRef.current)
    };
    graduatedLineModalSettingsRef.current = nextSettings;
    setGraduatedLineModalSettings(nextSettings);
    setGraduatedLineModalState({
      start: draft.start,
      end: draft.current,
      ...nextSettings
    });
    graduatedLineDraftRef.current = null;
    setGraduatedLineDraft(null);
    setSnapGuides({ x: null, y: null });
  }

  function confirmGraduatedLineModal() {
    const draft = graduatedLineModalStateRef.current;

    if (!draft) {
      return;
    }

    const settings = graduatedLineModalSettingsRef.current ?? {
      startValue: draft.startValue,
      sections: draft.sections
    };
    const sections = getGraduatedLineSectionCount(settings.sections);
    const startValue = getGraduatedLineStartValue(settings.startValue);
    lastGraduatedLineSectionsRef.current = sections;
    const shape = createGraduatedLineShape(draft.start, draft.end, sections);
    shape.startValue = startValue;
    insertGeometryShape(shape, { clearGeometryTool: true });
    graduatedLineMenuSuppressedIdRef.current = shape.id;
    clearGraduatedLineDraftState();
    setIsCanvasInteracting(false);
  }

  function cancelGraduatedLineModal() {
    clearGraduatedLineDraftState();
    setIsCanvasInteracting(false);
  }

  function updateGraduatedLineModalSections(value: string) {
    const nextSettings = {
      startValue: graduatedLineModalSettingsRef.current?.startValue ?? graduatedLineModalStateRef.current?.startValue ?? "0",
      sections: value.replace(/[^0-9]/g, "")
    };
    graduatedLineModalSettingsRef.current = nextSettings;
    setGraduatedLineModalSettings(nextSettings);
  }

  function selectGraduatedLinePreset(sections: number) {
    const nextSettings = {
      startValue: graduatedLineModalSettingsRef.current?.startValue ?? graduatedLineModalStateRef.current?.startValue ?? "0",
      sections: String(Math.max(1, Math.round(sections)))
    };
    graduatedLineModalSettingsRef.current = nextSettings;
    setGraduatedLineModalSettings(nextSettings);
    lastGraduatedLineSectionsRef.current = Math.max(1, Math.round(sections));
  }

  function updateGeometryShape(shapeId: string, updater: (shape: GeometryShape) => GeometryShape) {
    setState((current) => ({
      ...current,
      geometry: current.geometry.map((shape) => (shape.id === shapeId ? updater(shape) : shape))
    }));
  }

  function removeGeometryShape(shapeId: string) {
    setState((current) => ({
      ...current,
      geometry: current.geometry.filter((shape) => shape.id !== shapeId)
    }));
    setSelectedGeometryIds((current) => current.filter((id) => id !== shapeId));
  }

  function updateSelectedPointLabel(label: string) {
    if (!selectedGeometry || selectedGeometry.kind !== "point") {
      return;
    }

    updateGeometryShape(selectedGeometry.id, (shape) => (shape.kind === "point" ? { ...shape, label } : shape));
  }

  function updateSelectedSegmentLengthMm(lengthMm: string) {
    if (!selectedGeometry || selectedGeometry.kind !== "segment") {
      return;
    }

    const nextLengthMm = Number.parseFloat(lengthMm.replace(",", "."));

    if (!Number.isFinite(nextLengthMm) || nextLengthMm <= 0) {
      return;
    }

    updateGeometryShape(selectedGeometry.id, (shape) => {
      if (shape.kind !== "segment") {
        return shape;
      }

      const direction = getGeometryLinearDirection(shape);

      return {
        ...shape,
        bxMm: shape.axMm + direction.dx * Math.max(1, nextLengthMm),
        byMm: shape.ayMm + direction.dy * Math.max(1, nextLengthMm)
      };
    });
  }

  function updateSelectedCircleRadiusMm(radiusMm: string) {
    if (!selectedGeometry || selectedGeometry.kind !== "circle") {
      return;
    }

    const nextRadiusMm = Number.parseFloat(radiusMm.replace(",", "."));

    if (!Number.isFinite(nextRadiusMm) || nextRadiusMm <= 0) {
      return;
    }

    updateGeometryShape(selectedGeometry.id, (shape) =>
      shape.kind === "circle"
        ? {
            ...shape,
            radiusMm: Math.max(1, nextRadiusMm)
          }
        : shape
    );
  }

  function updateSelectedGraduatedLineSections(sections: string) {
    if (!selectedGeometry || selectedGeometry.kind !== "graduated-line") {
      return;
    }

    updateGeometryShape(selectedGeometry.id, (shape) =>
      shape.kind === "graduated-line"
        ? {
            ...shape,
            sections: getGraduatedLineSectionCount(sections)
          }
        : shape
    );
  }

  function patchSelectedGraduatedLineSettings(patch: Partial<{ startValue: string; sections: string }>) {
    if (!selectedGeometry || selectedGeometry.kind !== "graduated-line") {
      return null;
    }

    const currentSettings = selectedGraduatedLineSettingsRef.current ?? {
      startValue: String(selectedGeometry.startValue ?? 0),
      sections: String(selectedGeometry.sections ?? 10)
    };
    const nextSettings = {
      ...currentSettings,
      ...patch
    };
    selectedGraduatedLineSettingsRef.current = nextSettings;
    setSelectedGraduatedLineSettings(nextSettings);
    return nextSettings;
  }

  function updateSelectedGraduatedLineStartValue(startValue: string) {
    if (!selectedGeometry || selectedGeometry.kind !== "graduated-line") {
      return;
    }

    updateGeometryShape(selectedGeometry.id, (shape) =>
      shape.kind === "graduated-line"
        ? {
            ...shape,
            startValue: getGraduatedLineStartValue(startValue)
          }
        : shape
    );
  }

  function toggleGeometryTool(tool: GeometryTool) {
    setPendingInsertTool(null);
    setAdvancedTool(null);
    setCanvasQuickMenu(null);
    setOpenMenu(null);
    setActiveGeometryTool((current) => {
      const shouldClearPersistedProtractor = tool === "protractor" && current !== "protractor" && Boolean(geometryAngleMeasurement);
      const nextValue = current === tool ? null : tool;

      if (!nextValue) {
        clearGeometryDraftState();
        setGeometryMeasurement(null);
        if (tool === "protractor") {
          setGeometryAngleMeasurement(null);
        }
      } else {
        setGeometryDraft(null);
        setGeometryProtractorDraft(null);
        setSnapGuides({ x: null, y: null });
        setGeometryMeasurement(null);
        if (shouldClearPersistedProtractor) {
          setGeometryAngleMeasurement(null);
        }
        collapseToolsPanelForTablet();
      }

      return nextValue;
    });
  }

  function handleGeometrySurfacePointer(clientX: number, clientY: number) {
    const tool = activeGeometryToolRef.current;

    if (!tool) {
      return false;
    }

    const snappedPoint = getGeometrySnapPoint(clientX, clientY);
    setSnapGuides(snappedPoint.guides);

    if (tool === "protractor") {
      setGeometryMeasurement(null);
      const currentDraft = geometryProtractorDraftRef.current;

      if (!currentDraft) {
        setGeometryProtractorDraft({
          firstPoint: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm },
          vertex: null,
          current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
        });
        return true;
      }

      if (!currentDraft.vertex) {
        setGeometryProtractorDraft({
          ...currentDraft,
          vertex: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm },
          current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
        });
        return true;
      }

      setGeometryAngleMeasurement({
        vertex: currentDraft.vertex,
        baseline: currentDraft.firstPoint,
        end: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
      });
      clearGeometryDraftState();
      return true;
    }

    if (tool === "compass") {
      setGeometryMeasurement(null);
      const currentDraft = geometryCompassDraftRef.current;

      if (!currentDraft) {
        setGeometryCompassDraft({
          phase: "radius",
          center: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm },
          startPoint: null,
          radiusMm: null,
          startAngle: null,
          currentAngle: null,
          accumulatedSweep: 0,
          current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
        });
        return true;
      }

      if (currentDraft.phase === "radius") {
        const radiusMm = Math.hypot(snappedPoint.xMm - currentDraft.center.xMm, snappedPoint.yMm - currentDraft.center.yMm);

        if (radiusMm < 0.8) {
          clearGeometryDraftState();
          return true;
        }

        const startAngle = getGeometryAngleFromCenter(currentDraft.center, { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm });
        setGeometryCompassDraft({
          ...currentDraft,
          phase: "arc",
          startPoint: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm },
          radiusMm,
          startAngle,
          currentAngle: startAngle,
          accumulatedSweep: 0,
          current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
        });
        return true;
      }

      if (currentDraft.startPoint && currentDraft.radiusMm && currentDraft.startAngle !== null) {
        insertCompassArcFromSweep(currentDraft.center, currentDraft.radiusMm, currentDraft.startAngle, currentDraft.accumulatedSweep);
      } else {
        clearGeometryDraftState();
      }
      return true;
    }

    if (tool === "point") {
      setGeometryMeasurement(null);
      const pointShape = createGeometryShapeFromDraft({
        tool,
        start: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm },
        current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
      });

      if (pointShape) {
        insertGeometryShape(pointShape);
      }

      return true;
    }

    const currentDraft = geometryDraftRef.current;

    if (!currentDraft || currentDraft.tool !== tool) {
      if (tool === "measure") {
        setGeometryMeasurement(null);
      }

      setGeometryDraft({
        tool,
        start: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm },
        current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
      });
      clearFloatingSelection();
      setCanvasQuickMenu(null);
      return true;
    }

    if (tool === "measure") {
      setGeometryMeasurement({
        start: currentDraft.start,
        end: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
      });
      clearGeometryDraftState();
      return true;
    }

    const completedShape = createGeometryShapeFromDraft({
      ...currentDraft,
      current: { xMm: snappedPoint.xMm, yMm: snappedPoint.yMm }
    });

    if (completedShape) {
      insertGeometryShape(completedShape);
    }

    clearGeometryDraftState();
    return true;
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
    const nextGeometryIds = geometryRef.current
      .filter((shape) => {
        const node = geometryNodeRefs.current[shape.id];

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
      .map((shape) => shape.id);

    setSelectedBlockIds(nextBlockIds);
    setSelectedSymbolIds(nextSymbolIds);
    setSelectedTextBoxIds(nextTextBoxIds);
    setSelectedStrokeIds(nextStrokeIds);
    setSelectedGeometryIds(nextGeometryIds);
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

    if (activeGeometryToolRef.current) {
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      handleGeometrySurfacePointer(touch.clientX, touch.clientY);
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

  function getCanvasQuickMenuPosition(px: number, py: number) {
    const size = getCanvasIntrinsicSize();
    const flipX = px > size.width / 2;
    const flipY = py > size.height / 2;

    return {
      ...(flipX ? { right: size.width - px + CANVAS_QUICK_MENU_OFFSET_X } : { left: px + CANVAS_QUICK_MENU_OFFSET_X }),
      ...(flipY ? { bottom: size.height - py + CANVAS_QUICK_MENU_OFFSET_X } : { top: py }),
      clickX: px,
      clickY: py
    };
  }

  function openCanvasQuickMenu(clientX: number, clientY: number) {
    const point = getCanvasPoint(clientX, clientY);
    setCanvasQuickMenu(getCanvasQuickMenuPosition(point.x, point.y));
    clearFloatingSelection();
    setOpenMenu(null);
  }

  function openCanvasQuickMenuAtPoint(x: number, y: number) {
    setCanvasQuickMenu(getCanvasQuickMenuPosition(x, y));
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
    setActiveGeometryTool(null);
    clearGeometryDraftState();
    setGeometryMeasurement(null);
    setGeometryAngleMeasurement(null);
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
      } else if (current.kind === "scriptLetter" && nextTool.kind === "scriptLetter" && current.content === nextTool.content) {
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

    if (pendingInsertTool.kind === "scriptLetter") {
      createScriptLetterAt(pendingInsertTool.label, pendingInsertTool.content, x, y);
      setPendingInsertTool(null);
      return true;
    }

    createShortcutSymbolAt(pendingInsertTool.shortcutId, x, y, "exact");
    setPendingInsertTool(null);
    return true;
  }

  function createTextBoxAt(x: number, y: number, mode: "exact" | "soft" = "soft", initialText = "") {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const placement =
      mode === "exact"
        ? getExactCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24)
        : getCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24, "soft");
    const textBox = {
      ...createFloatingTextBox(
        placement.x,
        placement.y,
        "default",
        "plain",
        mode === "exact" ? 0 : FLOATING_TEXTBOX_Y_OFFSET
      ),
      text: initialText,
      width: getTextBoxWidth(initialText, state.activeFontSize, activeFont)
    };
    beginTransientHistorySession("edit");

    setState((current) => ({
      ...current,
      textBoxes: [...current.textBoxes, textBox]
    }));
    beginTextBoxEditing(textBox.id);
    setCanvasQuickMenu(null);
  }

  function getFloatingTextShortcutLayout(textBoxId: string): FloatingTextShortcutLayout {
    const shortcutCount = Math.max(1, textBoxShortcuts.length);
    const fallbackColumns = Math.min(shortcutCount, 5);
    const fallbackStyle = {
      ["--floating-text-shortcuts-shift" as string]: "0px",
      width: `${Math.min(320, fallbackColumns * 44 + Math.max(0, fallbackColumns - 1) * 6 + 24)}px`,
      gridTemplateColumns: `repeat(${fallbackColumns}, minmax(2.35rem, 1fr))`
    } as ReactCSSProperties;
    const canvas = canvasRef.current;
    const node = textBoxNodeRefs.current[textBoxId];

    if (!canvas || !node || typeof window === "undefined") {
      return {
        className: "floating-text-shortcuts-top",
        style: fallbackStyle
      };
    }

    const canvasRect = canvas.getBoundingClientRect();
    const textBoxRect = node.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isCompactViewport = viewportWidth <= 760;
    const horizontalGutter = isCompactViewport ? 16 : 20;
    const chipSize = isCompactViewport ? 40 : 38;
    const chipGap = isCompactViewport ? 6 : 5;
    const menuPadding = isCompactViewport ? 16 : 12;
    const maxWidth = Math.max(180, Math.min(canvasRect.width - horizontalGutter * 2, viewportWidth - horizontalGutter * 2));
    const maxColumnsByWidth = Math.max(2, Math.floor((maxWidth - menuPadding * 2 + chipGap) / (chipSize + chipGap)));
    const preferredColumns = isCompactViewport ? 4 : 6;
    const columns = Math.max(2, Math.min(shortcutCount, preferredColumns, maxColumnsByWidth));
    const rows = Math.ceil(shortcutCount / columns);
    const estimatedWidth = Math.min(maxWidth, columns * chipSize + Math.max(0, columns - 1) * chipGap + menuPadding * 2);
    const estimatedHeight = rows * chipSize + Math.max(0, rows - 1) * chipGap + menuPadding * 2;
    const boxLeft = textBoxRect.left - canvasRect.left;
    const boxTop = textBoxRect.top - canvasRect.top;
    const boxBottom = textBoxRect.bottom - canvasRect.top;
    const anchorCenter = boxLeft + textBoxRect.width / 2;
    const minCenter = horizontalGutter + estimatedWidth / 2;
    const maxCenter = canvasRect.width - horizontalGutter - estimatedWidth / 2;
    const clampedCenter = minCenter <= maxCenter ? Math.min(Math.max(anchorCenter, minCenter), maxCenter) : anchorCenter;
    const horizontalShift = clampedCenter - anchorCenter;
    const availableAbove = Math.min(boxTop, textBoxRect.top) - horizontalGutter;
    const availableBelow = Math.min(canvasRect.height - boxBottom, viewportHeight - textBoxRect.bottom) - horizontalGutter;
    const placeAbove = availableAbove >= estimatedHeight || availableAbove >= availableBelow;

    return {
      className: placeAbove ? "floating-text-shortcuts-top" : "floating-text-shortcuts-bottom",
      style: {
        ["--floating-text-shortcuts-shift" as string]: `${horizontalShift}px`,
        width: `${estimatedWidth}px`,
        gridTemplateColumns: `repeat(${columns}, minmax(${isCompactViewport ? "2.5rem" : "2.35rem"}, 1fr))`
      } as ReactCSSProperties
    };
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
        const symbolMeasure = getFloatingSymbolMeasure(symbol);
        return symbol.y + Math.max(targetHeight, rect?.height ?? symbolMeasure.height);
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

  function createScriptLetterAt(label: string, content: string, x: number, y: number) {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const placement = getExactCanvasPlacementPosition(x, y, (bounds?.width ?? 320) - 24, (bounds?.height ?? 320) - 24);
    const defaultFontSize = getDefaultCanvasFontSize(state.sheetStyle);
    const symbol = {
      id: createId("symbol"),
      type: "symbol",
      label,
      content,
      kind: "text",
      x: placement.x,
      y: placement.y,
      color: state.activeColor,
      fontSize: defaultFontSize,
      fontWeight: state.activeFontWeight,
      fontStyle: state.activeFontStyle,
      underline: state.activeUnderline,
      highlightColor: null
    } satisfies FloatingSymbol;
    setState((current) => ({
      ...current,
      symbols: [...current.symbols, symbol]
    }));
    setSelectedSymbolIds([symbol.id]);
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

    if (shortcut.id === "angle") {
      const textBox = createAngleTextBox(placement.x, placement.y);
      beginTransientHistorySession("edit");

      setState((current) => ({
        ...current,
        textBoxes: [...current.textBoxes, textBox]
      }));
      beginTextBoxEditing(textBox.id);
      setCanvasQuickMenu(null);
      return;
    }

    if (shortcut.id === "sum" || shortcut.id === "integral") {
      const symbol = createFloatingSymbol(shortcut, placement.x, placement.y);
      beginTransientHistorySession("edit");

      setState((current) => ({
        ...current,
        symbols: [...current.symbols, symbol]
      }));
      selectSingleSymbol(symbol.id);
      setCanvasQuickMenu(null);
      return;
    }

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
    const input = textBoxNodeRefs.current[textBoxId]?.querySelector("textarea, input") as HTMLTextAreaElement | HTMLInputElement | null;
    const currentTextBox = textBoxesRef.current.find((item) => item.id === textBoxId);

    if (!input || !currentTextBox) {
      return;
    }

    const start = input.selectionStart ?? currentTextBox.text.length;
    const end = input.selectionEnd ?? start;
    const nextText = `${currentTextBox.text.slice(0, start)}${content}${currentTextBox.text.slice(end)}`;
    const nextCursor = start + content.length;
    const minimumWidth = currentTextBox.variant === "note" ? 56 : 36;

    updateTextBox(textBoxId, {
      text: nextText,
      width: Math.max(minimumWidth, getTextBoxWidth(nextText, currentTextBox.fontSize, activeFont))
    });

    window.requestAnimationFrame(() => {
      const nextInput = textBoxNodeRefs.current[textBoxId]?.querySelector("textarea, input") as HTMLTextAreaElement | HTMLInputElement | null;

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
      ),
      geometry: current.geometry.map((shape) =>
        selectedGeometryIdsRef.current.includes(shape.id) ? { ...shape, color } : shape
      )
    }));

    if (editorRef.current && editorRef.current.contains(document.activeElement)) {
      runCommand("foreColor", color);
    }
  }

  function togglePendingBold() {
    setState((current) => ({ ...current, activeFontWeight: current.activeFontWeight >= 700 ? 500 : 700 }));
  }

  function togglePendingItalic() {
    setState((current) => ({ ...current, activeFontStyle: current.activeFontStyle === "italic" ? "normal" : "italic" }));
  }

  function togglePendingUnderline() {
    setState((current) => ({ ...current, activeUnderline: !current.activeUnderline }));
  }

  function toggleCanvasBold() {
    if (selectedCount === 0) {
      setState((current) => ({
        ...current,
        activeFontWeight: current.activeFontWeight >= 700 ? 500 : 700
      }));
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
      setState((current) => ({
        ...current,
        activeFontStyle: current.activeFontStyle === "italic" ? "normal" : "italic"
      }));
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
      setState((current) => ({
        ...current,
        activeUnderline: !current.activeUnderline
      }));
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
        activeTextHighlightColor: nextHighlight
      }));
      runCommand("hiliteColor", nextHighlight ?? "transparent");
      return;
    }

    setState((current) => ({
      ...current,
      activeTextHighlightColor: nextHighlight,
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

    setActiveGeometryTool(null);
    clearGeometryDraftState();
    setGeometryMeasurement(null);
    setGeometryAngleMeasurement(null);
    setState((current) => ({
      ...current,
      activeHighlightColor: resolvedHighlight
    }));
    setPendingInsertTool(null);
    setAdvancedTool(resolvedHighlight ? "highlight" : null);
    setOpenMenu(null);
  }

  function adjustCanvasSize(direction: "down" | "up") {
    const delta = direction === "up" ? 0.12 : -0.12;

    if (selectedCount === 0) {
      setState((current) => ({
        ...current,
        activeFontSize: Math.max(0.9, Math.min(2.6, Number((current.activeFontSize + delta).toFixed(2))))
      }));
      return;
    }

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
                width: Math.max(minimumWidth, getTextBoxWidth(textBox.text || " ", nextFontSize, activeFont))
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
        block.id === blockId
          ? block.type === "division" && key.startsWith("work:")
            ? ({ ...block, work: setDivisionWorkLine(block.work, Number.parseInt(key.slice(5), 10), value) } as MathBlock)
            : ({ ...block, [key]: value } as MathBlock)
          : block
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

  function focusInlineBlockField(blockId: string, field: string, selection?: { start: number; end: number }) {
    const applySelection = (attempt = 0) => {
      const input = blockInputRefs.current[blockId]?.[field];

      if (!input) {
        return;
      }

      if (document.activeElement !== input) {
        input.focus();
      }

      if (selection) {
        if (attempt < 4 && input.value.length < selection.end) {
          window.requestAnimationFrame(() => applySelection(attempt + 1));
          return;
        }

        input.setSelectionRange(selection.start, selection.end);
      }
    };

    window.requestAnimationFrame(() => applySelection());
  }

  function handleInlineNumericDeleteKey(
    blockId: string,
    field: string,
    value: string,
    event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.key !== "Delete" && event.key !== "Backspace") {
      return false;
    }

    const start = event.currentTarget.selectionStart ?? Array.from(value).length;
    const end = event.currentTarget.selectionEnd ?? start;

    if (start === end) {
      if (event.key === "Backspace" && start === 0) {
        event.preventDefault();
        return true;
      }

      if (event.key === "Delete" && start >= value.length) {
        event.preventDefault();
        return true;
      }
    }

    const deleteStart = start === end && event.key === "Backspace" ? Math.max(0, start - 1) : start;
    const deleteEnd = start === end ? Math.min(value.length, start + (event.key === "Delete" ? 1 : 0)) : end;
    const nextValue = `${value.slice(0, deleteStart)}${value.slice(deleteEnd)}`;
    const nextPosition = deleteStart;
    const caretKey = `${blockId}:${field}`;

    event.preventDefault();
    updateInlineBlockField(blockId, field, nextValue);
    pendingNumericSelectionRef.current = { blockId, field, start: nextPosition, end: nextPosition };
    updateNumericCaretPosition(caretKey, nextPosition);
    focusInlineBlockField(blockId, field, { start: nextPosition, end: nextPosition });
    return true;
  }

  function activateNumericCellSelection(
    blockId: string,
    field: string,
    value: string,
    columns: number,
    align: "start" | "end",
    cellIndex: number
  ) {
    let nextValue = value;
    const targetLength = align === "start" ? cellIndex : 0;

    if (align === "start" && getCellTextLength(value) < targetLength) {
      nextValue = `${value}${" ".repeat(targetLength - getCellTextLength(value))}`;
      updateInlineBlockField(blockId, field, nextValue);
    }

    const selection = getAlignedCellSelectionRange(nextValue, columns, align, cellIndex);
    const caretKey = `${blockId}:${field}`;
    pendingNumericSelectionRef.current = { blockId, field, start: selection.start, end: selection.end };
    updateNumericCaretPosition(caretKey, selection.start);
    setEditingBlock({ blockId, field });
    focusInlineBlockField(blockId, field, selection);
  }

  function activateResultCell(
    blockId: string,
    value: string,
    columns: number,
    cellIndex: number
  ) {
    const nextCellIndex = Math.max(0, cellIndex);
    let nextValue = value;

    if (getCellTextLength(value) < nextCellIndex) {
      nextValue = `${value}${" ".repeat(nextCellIndex - getCellTextLength(value))}`;
      updateInlineBlockField(blockId, "result", nextValue);
    }

    const selection = getAlignedCellSelectionRange(nextValue, columns, "start", nextCellIndex);
    const caretKey = `${blockId}:result`;

    setActiveResultCell({ blockId, cellIndex: nextCellIndex });
    updateNumericCaretPosition(caretKey, selection.start);
    setEditingBlock({ blockId, field: "result" });
    focusInlineBlockField(blockId, "result", selection);
  }

  function markInlineBlockInteraction(blockId: string) {
    recentInlineBlockInteractionRef.current = { blockId, timeStamp: Date.now() };
  }

  function shouldKeepInlineBlockEditing(blockId: string) {
    const blockNode = blockNodeRefs.current[blockId];
    const activeElement = typeof document === "undefined" ? null : document.activeElement;

    if (blockNode && activeElement && blockNode.contains(activeElement)) {
      return true;
    }

    const recentInteraction = recentInlineBlockInteractionRef.current;

    return recentInteraction?.blockId === blockId && Date.now() - recentInteraction.timeStamp < 240;
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
    if (!event.repeat && event.key in SCRIPT_CHARS) {
      const now = Date.now();
      const last = inlineLastKeyRef.current;
      if (last && last.key === event.key && now - last.time < DOUBLE_TAP_DELAY) {
        event.preventDefault();
        const el = event.currentTarget;
        const pos = el.selectionStart ?? el.value.length;
        const scriptChar = SCRIPT_CHARS[event.key];
        const nextValue = el.value.slice(0, Math.max(0, pos - 1)) + scriptChar + el.value.slice(pos);
        updateInlineBlockField(blockId, field, nextValue);
        const newPos = Math.max(0, pos - 1) + scriptChar.length;
        requestAnimationFrame(() => { el.setSelectionRange(newPos, newPos); });
        inlineLastKeyRef.current = null;
        return;
      }
      inlineLastKeyRef.current = { key: event.key, time: now };
    } else if (!(event.key in SCRIPT_CHARS)) {
      inlineLastKeyRef.current = null;
    }

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

  function isHeaderTextBox(textBoxId: string) {
    return state.textBoxes.some((textBox) => textBox.id === textBoxId && textBox.headerField);
  }

  function removeTextBox(textBoxId: string) {
    if (isHeaderTextBox(textBoxId)) {
      return;
    }

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
      textBoxes: current.textBoxes.filter((textBox) => textBox.headerField || !selectedTextBoxIds.includes(textBox.id)),
      strokes: current.strokes.filter((stroke) => !selectedStrokeIds.includes(stroke.id)),
      geometry: current.geometry.filter((shape) => !selectedGeometryIds.includes(shape.id))
    }));
    clearFloatingSelection();
  }

  function resetTransientUi() {
    setOpenMenu(null);
    setModalState(null);
    clearGraduatedLineDraftState();
    setCanvasQuickMenu(null);
    setEditingBlock(null);
    setEditingTextBoxId(null);
    setDraftStroke(null);
    setGeometryMeasurement(null);
    setGeometryAngleMeasurement(null);
    isDrawingStrokeRef.current = false;
    draftStrokeRef.current = [];
    draftStrokeStyleRef.current = { color: stateRef.current.activeColor, width: 2.6, opacity: 1 };
    setGeometryDraft(null);
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

    if (kind === "drag") {
      saveHeaderPositionsToProfile(currentSnapshot);
    }
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

  function getFractionBarCenterOffset(node: HTMLElement | null) {
    if (!node) {
      return null;
    }

    const bar = node.querySelector(".fraction-bar") as HTMLElement | null;

    if (!bar) {
      return null;
    }

    const nodeRect = node.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();

    return barRect.top - nodeRect.top + barRect.height / 2;
  }

  function alignSelectedItems() {
    if (selectedCount < 2) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const spacing = 0;
    const measuredItems = [
      ...state.blocks
        .filter((block) => selectedBlockIds.includes(block.id))
        .map((block) => {
          const node = blockNodeRefs.current[block.id];
          const rect = node?.getBoundingClientRect();
          const anchorOffsetY =
            block.type === "fraction"
              ? Math.max(0, getFractionBarCenterOffset(node) ?? (rect?.height ?? 64) / 2)
              : (rect?.height ?? 64) / 2;

          return {
            id: block.id,
            type: "block" as const,
            x: block.x,
            y: block.y,
            width: Math.max(24, rect?.width ?? block.width ?? 64),
            height: Math.max(24, rect?.height ?? 64),
            anchorOffsetY
          };
        }),
      ...state.symbols
        .filter((symbol) => selectedSymbolIds.includes(symbol.id))
        .map((symbol) => {
          const node = symbolNodeRefs.current[symbol.id];
          const rect = node?.getBoundingClientRect();
          const symbolMeasure = getFloatingSymbolMeasure(symbol);

          return {
            id: symbol.id,
            type: "symbol" as const,
            x: symbol.x,
            y: symbol.y,
            width: Math.max(24, rect?.width ?? symbolMeasure.width),
            height: Math.max(24, rect?.height ?? symbolMeasure.height),
            anchorOffsetY: Math.max(24, rect?.height ?? symbolMeasure.height) / 2
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
            height: Math.max(24, rect?.height ?? 32),
            anchorOffsetY: Math.max(24, rect?.height ?? 32) / 2
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
            height: Math.max(24, rect?.height ?? strokeBounds.height),
            anchorOffsetY: Math.max(24, rect?.height ?? strokeBounds.height) / 2
          };
        }),
      ...state.geometry
        .filter((shape) => selectedGeometryIds.includes(shape.id))
        .map((shape) => {
          const intrinsic = getCanvasIntrinsicSize();
          const node = geometryNodeRefs.current[shape.id];
          const rect = node?.getBoundingClientRect();
          const bounds = getGeometryShapeBoundsPx(shape, intrinsic.width, intrinsic.height);

          return {
            id: shape.id,
            type: "geometry" as const,
            x: bounds.x,
            y: bounds.y,
            width: Math.max(24, rect?.width ?? bounds.width),
            height: Math.max(24, rect?.height ?? bounds.height),
            anchorOffsetY: Math.max(24, rect?.height ?? bounds.height) / 2
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
          positions: Array<{ id: string; type: "block" | "symbol" | "textBox" | "stroke" | "geometry"; x: number; y: number }>;
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
        const y = rowTop + rowHeights[row] / 2 - item.anchorOffsetY;
        const snappedPoint = getCanvasPlacementPosition(x, y, canvasBounds.width - item.width - 18, canvasBounds.height - item.height - 18, "strict", {
          height: item.height,
          snapOffsetY: 5
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
      }),
      geometry: current.geometry.map((shape) => {
        const nextPosition = positionMap.get(`geometry:${shape.id}`);

        if (!nextPosition) {
          return shape;
        }

        const intrinsic = getCanvasIntrinsicSize();
        const currentBounds = getGeometryShapeBoundsPx(shape, intrinsic.width, intrinsic.height);
        return translateGeometryShape(shape, pxToMm(nextPosition.x - currentBounds.x), pxToMm(nextPosition.y - currentBounds.y));
      })
    }));
  }

  function startDragging(itemType: "block" | "symbol" | "textBox" | "stroke" | "geometry", itemId: string, x: number, y: number, event: ReactMouseEvent<Element>) {
    const target = event.target as HTMLElement | null;

    if (target?.closest?.(".floating-math-symbol-resize-handle") || symbolResizeRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    startDraggingAtPoint(itemType, itemId, x, y, event.clientX, event.clientY);
  }

  function startDraggingAtPoint(itemType: "block" | "symbol" | "textBox" | "stroke" | "geometry", itemId: string, x: number, y: number, clientX: number, clientY: number) {
    setCanvasQuickMenu(null);
    setIsCanvasInteracting(true);
    clearGeometryDraftState();

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
            : itemType === "stroke"
              ? selectedStrokeIdsRef.current.includes(itemId)
              : selectedGeometryIdsRef.current.includes(itemId);
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
    const currentGeometryIds = keepCurrentSelection
      ? selectedGeometryIdsRef.current
      : itemType === "geometry"
        ? [itemId]
        : [];
    const precisePoint = getPreciseCanvasPoint(clientX, clientY);

    dragRef.current = {
      itemType,
      itemId,
      pointerOffsetX: clientX - bounds.left - x,
      pointerOffsetY: clientY - bounds.top - y,
      pointerOriginX: precisePoint.x,
      pointerOriginY: precisePoint.y,
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
      groupGeometryShapes: geometryRef.current
        .filter((shape) => currentGeometryIds.includes(shape.id))
        .map((shape) => JSON.parse(JSON.stringify(shape)) as GeometryShape),
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
      } else if (itemType === "stroke") {
        selectSingleStroke(itemId);
      } else {
        selectSingleGeometry(itemId);
      }
    }
  }

  function handleTouchDragStart(
    itemType: "block" | "symbol" | "textBox" | "stroke" | "geometry",
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
    event.dataTransfer.setData("text/plain", payload.kind === "shortcut" ? payload.shortcutId : payload.kind === "structured" ? payload.toolId : payload.kind);
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

    if (payload.kind === "text") {
      createTextBoxAt(position.x, position.y, "exact");
      return;
    }

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

    if (shortcut.id === "angle") {
      const textBox = createAngleTextBox(position.x, position.y);
      beginTransientHistorySession("edit");

      setState((current) => ({
        ...current,
        textBoxes: [...current.textBoxes, textBox]
      }));
      beginTextBoxEditing(textBox.id);
      return;
    }

    if (shortcut.id === "sum" || shortcut.id === "integral") {
      const symbol = createFloatingSymbol(shortcut, position.x, position.y);
      beginTransientHistorySession("edit");

      setState((current) => ({
        ...current,
        symbols: [...current.symbols, symbol]
      }));
      selectSingleSymbol(symbol.id);
      return;
    }

    const symbol = createFloatingSymbol(shortcut, position.x, position.y);

    setState((current) => ({
      ...current,
      symbols: [...current.symbols, symbol]
    }));
    selectSingleSymbol(symbol.id);
  }

  function renderInlineBlockEditor(block: MathBlock) {
    const currentField = editingBlock?.blockId === block.id ? editingBlock.field : null;
    const bindInlineInput = (field: string) => ({
      ref: (node: HTMLInputElement | HTMLTextAreaElement | null) => {
        blockInputRefs.current[block.id] = {
          ...blockInputRefs.current[block.id],
          [field]: node
        };
      },
      className: "math-inline-input",
      autoComplete: "off" as const,
      autoCorrect: "off" as const,
      autoCapitalize: "off" as const,
      spellCheck: false,
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
          if (shouldKeepInlineBlockEditing(block.id)) {
            return;
          }

          if (strikeModeBlockIdRef.current === block.id) {
            return;
          }

          const latestEditingBlock = editingBlockRef.current;

          if (latestEditingBlock?.blockId === block.id && latestEditingBlock.field === field) {
            finishBlockEditing(block.id);
          }
        }, 0);
      }
    });
    const setInlineInputRef = (blockId: string, field: string, node: HTMLInputElement | null) => {
      blockInputRefs.current[blockId] = {
        ...blockInputRefs.current[blockId],
        [field]: node
      };
    };
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
          {t("inlineEditor.strike")}
        </button>
        {strikeModeBlockId === blockId ? <span className="operation-edit-menu-hint">{t("inlineEditor.clickCell")}</span> : null}
      </div>
    );
    const wrapInlineOperationEditor = (blockId: string, content: ReactNode) => (
      <div
        className={`operation-edit-shell ${strikeModeBlockId === blockId ? "operation-edit-shell-strike-mode" : ""}`}
        onMouseDownCapture={() => markInlineBlockInteraction(blockId)}
        onTouchStartCapture={() => markInlineBlockInteraction(blockId)}
      >
        {content}
        {renderInlineOperationMenu(blockId)}
      </div>
    );

    if (isColumnArithmeticBlock(block)) {
      return renderArithmeticInlineEditor({
        t,
        block,
        currentField,
        strikeModeBlockId,
        numericFieldCaretPositions,
        activeResultCell,
        bindInlineInput: bindInlineInput as never,
        wrapInlineOperationEditor,
        setInlineInputRef,
        shouldKeepInlineBlockEditing,
        finishBlockEditing,
        updateInlineBlockField,
        toggleInlineBlockStrikeMode,
        toggleInlineBlockCellStrike,
        updateNumericCaretPosition,
        handleInlineNumericDeleteKey: handleInlineNumericDeleteKey as never,
        activateNumericCellSelection,
        activateResultCell,
        focusInlineBlockField: (blockId, field) => focusInlineBlockField(blockId, field),
        setEditingField: (blockId, field) => setEditingBlock({ blockId, field }),
        setArithmeticCarryValue: (blockId, field, index, value) =>
          setState((current) => ({
            ...current,
            blocks: current.blocks.map((entry) =>
              entry.id === blockId && isColumnArithmeticBlock(entry)
                ? ({ ...entry, [field]: setArithmeticCarryCell(entry[field], index, value) } as MathBlock)
                : entry
            )
          }))
      });
    }

    if (block.type === "division") {
      return renderDivisionInlineEditor({
        block,
        currentField,
        isStrikeModeActive: strikeModeBlockId === block.id,
        numericFieldCaretPositions,
        bindInlineInput: bindInlineInput as never,
        wrapInlineOperationEditor,
        updateNumericCaretPosition,
        updateInlineBlockField,
        handleInlineNumericDeleteKey: handleInlineNumericDeleteKey as never,
        activateNumericCellSelection,
        toggleInlineBlockCellStrike,
        setEditingField: (blockId, field) => setEditingBlock({ blockId, field }),
        finishBlockEditing,
        setDivisionWorkValue: (blockId, lineIndex, nextValue) =>
          setState((current) => ({
            ...current,
            blocks: current.blocks.map((entry) =>
              entry.id === blockId && entry.type === "division"
                ? ({ ...entry, work: setDivisionWorkLine(entry.work, lineIndex, nextValue) } as MathBlock)
                : entry
            )
          }))
      });
    }

    return renderBasicInlineEditor(block as FractionBlock | PowerBlock | RootBlock, bindInlineInput as never);
  }
  function createProfileAwareDefaultState(): WriterState {
    const labels = getDocumentLabelsForProfile(activeProfile, workbookUi.defaultDocumentLabels, locale);
    const sheetStyle = activeProfile?.preferredSheetStyle ?? defaultSheetStyle;
    const newState = createDefaultState(sheetStyle, labels);

    if (activeProfile) {
      newState.mode = activeProfile.preferredMode;

      if (newState.textBoxes.length >= 3) {
        if (!activeProfile.showName) newState.textBoxes[0] = { ...newState.textBoxes[0], hidden: true };
        if (!activeProfile.showClass) newState.textBoxes[1] = { ...newState.textBoxes[1], hidden: true };
        if (!activeProfile.showDate) newState.textBoxes[2] = { ...newState.textBoxes[2], hidden: true };
      }

      newState.textBoxes = applyHeaderPositions(newState.textBoxes, activeProfile);
    }

    return newState;
  }

  function confirmResetDocument() {
    const newState = createProfileAwareDefaultState();
    clearTransientState();
    setState(newState);
    setConfirmResetState(null);
  }

  function clearTransientState() {
    setOpenMenu(null);
    setCanvasQuickMenu(null);
    setModalState(null);
    setConfirmResetState(null);
    clearGraduatedLineDraftState();
    clearFloatingSelection();
    selectionRef.current = null;
    setEditingBlock(null);
    setEditingTextBoxId(null);
    setHistoryPast([]);
    setHistoryFuture([]);
    if (editorRef.current) {
      editorRef.current.innerHTML = DEFAULT_TEXT_HTML;
    }
  }

  function handleSwitchPage(pageId: string) {
    if (pageId === pageIndex.activePageId) return;

    const loaded = loadPageState(pageId, defaultSheetStyle, workbookUi.defaultDocumentLabels);
    if (!loaded) return;

    clearTransientState();
    setState(loaded);

    const newIndex = { ...pageIndex, activePageId: pageId };
    savePageIndex(newIndex);
    setPageIndex(newIndex);
  }

  function handleNewPage() {
    const newState = createProfileAwareDefaultState();
    createPage(newState.title, newState);
    clearTransientState();
    setState(newState);
    setPageIndex(loadPageIndex());
  }

  function handleDeletePage(pageId: string) {
    if (pageIndex.pages.length <= 1) return;
    if (!window.confirm(t("pages.deletePageConfirm"))) return;

    const wasActive = pageId === pageIndex.activePageId;
    deletePage(pageId);
    const newIndex = loadPageIndex();
    setPageIndex(newIndex);

    if (wasActive && newIndex.pages.length > 0) {
      handleSwitchPage(newIndex.activePageId ?? newIndex.pages[0].id);
    }
  }

  function handleDeleteAllPages() {
    setConfirmDeleteAllOpen(true);
  }

  function confirmDeleteAllPages() {
    for (const page of pageIndex.pages) {
      deletePage(page.id);
    }

    handleNewPage();
    setConfirmDeleteAllOpen(false);
  }

  function handleExportFile() {
    const targetId = pageIndex.activePageId;
    if (!targetId) return;

    const meta = pageIndex.pages.find((d) => d.id === targetId);
    if (!meta) return;

    exportPageToFile(meta, state);
  }

  function handleImportFile() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(event: ReactChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const raw = reader.result as string;
      const result = parseImportedFile(raw, defaultSheetStyle, workbookUi.defaultDocumentLabels);

      if (!result) {
        window.alert(t("pages.importError"));
        return;
      }

      createPage(result.name, result.state);
      clearTransientState();
      setState(result.state);
      setPageIndex(loadPageIndex());
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  function applyHeaderPositions(textBoxes: FloatingTextBox[], profile: UserProfile): FloatingTextBox[] {
    if (!profile.headerPositions) {
      return textBoxes;
    }

    return textBoxes.map((tb) => {
      if (tb.headerField && profile.headerPositions?.[tb.headerField]) {
        const pos = profile.headerPositions[tb.headerField];
        return { ...tb, x: pos.x, y: pos.y };
      }

      return tb;
    });
  }

  function applyProfileToDocument(profile: UserProfile) {
    const labels = getDocumentLabelsForProfile(profile, workbookUi.defaultDocumentLabels, locale);
    const font = profile.preferredFont ?? "default";

    function applyWithFont() {
      setState((current) => {
        const textBoxes = current.textBoxes.map((tb, index) => {
          const isHeader = index < 3;
          const updatedTb = isHeader
            ? {
                ...tb,
                text: index === 0 ? labels.fullName : index === 1 ? labels.className : labels.date,
                hidden: index === 0 ? !profile.showName : index === 1 ? !profile.showClass : !profile.showDate
              }
            : { ...tb };

          updatedTb.width = getTextBoxWidth(updatedTb.text || " ", updatedTb.fontSize, font);

          return updatedTb;
        });

        return {
          ...current,
          textBoxes: applyHeaderPositions(textBoxes, profile),
          sheetStyle: profile.preferredSheetStyle,
          mode: profile.preferredMode
        };
      });
    }

    if (font === "opendyslexic" && typeof document !== "undefined" && document.fonts) {
      document.fonts.load('500 16px "OpenDyslexic"').then(() => applyWithFont()).catch(() => applyWithFont());
    } else {
      applyWithFont();
    }
  }

  function handleProfileChange(profileId: string | null) {
    setProfileStore((current) => ({ ...current, activeProfileId: profileId }));
    const profile = profileStore.profiles.find((p) => p.id === profileId);

    if (profile) {
      applyProfileToDocument(profile);
    }

    setProfileEditMode(null);
  }

  function handleCreateProfile(profile: Omit<UserProfile, "id">) {
    const newProfile: UserProfile = { ...profile, id: createId("profile") };
    setProfileStore((current) => ({
      profiles: [...current.profiles, newProfile],
      activeProfileId: newProfile.id
    }));
    applyProfileToDocument(newProfile);
    setProfileEditMode(null);
  }

  function handleUpdateProfile(updated: UserProfile) {
    setProfileStore((current) => ({
      ...current,
      profiles: current.profiles.map((p) => (p.id === updated.id ? updated : p))
    }));

    if (profileStore.activeProfileId === updated.id) {
      applyProfileToDocument(updated);
    }

    setProfileEditMode(null);
  }

  function handleDeleteProfile(profileId: string) {
    setProfileStore((current) => ({
      profiles: current.profiles.filter((p) => p.id !== profileId),
      activeProfileId: current.activeProfileId === profileId ? null : current.activeProfileId
    }));
    setProfileEditMode(null);
  }

  function saveHeaderPositionsToProfile(writerState: WriterState) {
    const currentProfileId = profileStoreRef.current?.activeProfileId;

    if (!currentProfileId) {
      return;
    }

    const headerTextBoxes = writerState.textBoxes.filter((tb) => tb.headerField);

    if (headerTextBoxes.length === 0) {
      return;
    }

    const positions: Record<string, { x: number; y: number }> = {};

    for (const tb of headerTextBoxes) {
      if (tb.headerField) {
        positions[tb.headerField] = { x: tb.x, y: tb.y };
      }
    }

    setProfileStore((current) => ({
      ...current,
      profiles: current.profiles.map((p) =>
        p.id === currentProfileId ? { ...p, headerPositions: positions as UserProfile["headerPositions"] } : p
      )
    }));
  }

  function handleLocaleChange(nextLocale: string) {
    if (nextLocale === locale || !pathname) {
      return;
    }

    router.replace(pathname, {locale: nextLocale as AppLocale});
  }

  async function installPwa() {
    const promptEvent = window.__dysmathsDeferredInstallPrompt;
    if (!promptEvent) {
      toggleMenu("install");
      return;
    }

    await promptEvent.prompt();
    await promptEvent.userChoice.catch(() => undefined);
    window.__dysmathsDeferredInstallPrompt = undefined;
    setCanInstallApp(false);
    setOpenMenu(null);
  }

  async function exportPdf() {
    if (!canvasRef.current) {
      return;
    }

    setIsExporting("pdf");

    try {
      await exportWorkbookPdf(canvasRef.current, state.sheetStyle, state.title);
    } finally {
      setIsExporting(null);
    }
  }

  async function exportPng() {
    if (!canvasRef.current) {
      return;
    }

    setIsExporting("png");

    try {
      await exportWorkbookPng(canvasRef.current, state.sheetStyle, state.title);
    } finally {
      setIsExporting(null);
    }
  }

  async function printSheet() {
    if (!canvasRef.current) {
      return;
    }

    setIsExporting("print");

    try {
      await printWorkbook(canvasRef.current, state.sheetStyle, state.title);
    } finally {
      setIsExporting(null);
    }
  }

  function renderGraduatedLinePreview(start: GeometryPointCoordinate, end: GeometryPointCoordinate, startValueInput: string, sectionsInput: string) {
    return renderGraduatedLinePreviewView({
      createGraduatedLineShape,
      start,
      end,
      startValueInput,
      sectionsInput
    });
  }

  function renderModalFields(block: MathBlock) {
    return renderBlockModalFieldsView({
      t,
      block,
      updateModalField,
      normalizeArithmeticCarryCells
    });
  }

  function toggleMenu(menu: Exclude<UtilityMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function toggleHighlightTool() {
    if (advancedTool === "highlight") {
      setAdvancedTool(null);
      setOpenMenu(null);
      return;
    }

    activateHighlightTool(state.activeHighlightColor || DEFAULT_HIGHLIGHT_TOOL_COLOR);
  }

  function toggleAdvancedToolMode(tool: AdvancedTool) {
    setActiveGeometryTool(null);
    clearGeometryDraftState();
    clearGraduatedLineDraftState();
    setGeometryMeasurement(null);
    setGeometryAngleMeasurement(null);
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
      return;
    }

    if (selectedGeometry) {
      removeGeometryShape(selectedGeometry.id);
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

    if (shortcut.id === "angle") {
      const textBox = createAngleTextBox(position.x, position.y);
      beginTransientHistorySession("edit");

      setState((current) => ({
        ...current,
        textBoxes: [...current.textBoxes, textBox]
      }));
      beginTextBoxEditing(textBox.id);
      return;
    }

    if (shortcut.id === "sum" || shortcut.id === "integral") {
      const symbol = createFloatingSymbol(shortcut, position.x, position.y);
      beginTransientHistorySession("edit");

      setState((current) => ({
        ...current,
        symbols: [...current.symbols, symbol]
      }));
      selectSingleSymbol(symbol.id);
      setCanvasQuickMenu(null);
      return;
    }

    const symbol = createFloatingSymbol(shortcut, position.x, position.y);
    beginTransientHistorySession("edit");

    setState((current) => ({
      ...current,
      symbols: [...current.symbols, symbol]
    }));
    selectSingleSymbol(symbol.id);
    setCanvasQuickMenu(null);
  }

  function renderProtractorOverlay(
    vertex: GeometryPointCoordinate,
    baseline: GeometryPointCoordinate,
    end: GeometryPointCoordinate,
    tone: "draft" | "final" = "final"
  ) {
    return renderProtractorOverlayView(vertex, baseline, end, tone);
  }

  return (
    <main className="editor-shell">
      <WorkbookSidebar
        t={t}
        locale={locale}
        isToolsPanelOpen={isToolsPanelOpen}
        activeGeometryTool={activeGeometryTool}
        geometryTools={workbookUi.geometryTools}
        geometryPanelHelper={geometryPanelHelper}
        operationStructuredTools={operationStructuredTools}
        rootStructuredTool={rootStructuredTool}
        commonInlineShortcuts={commonInlineShortcuts}
        visibleHighSchoolInlineShortcuts={visibleHighSchoolInlineShortcuts}
        pendingInsertTool={pendingInsertTool}
        advancedTool={advancedTool}
        colorOptions={workbookUi.colorOptions}
        activeColor={state.activeColor}
        highlightOptions={workbookUi.highlightOptions}
        activeHighlightColor={state.activeHighlightColor}
        selectedHighlightColor={selectedHighlightColor}
        activeFontSize={state.activeFontSize}
        openMenu={openMenu}
        selectedCount={selectedCount}
        canInstallApp={canInstallApp}
        isInstalledApp={isInstalledApp}
        onCloseToolsPanel={() => setIsToolsPanelOpen(false)}
        onToggleGeometryTool={toggleGeometryTool}
        onTextToolDragStart={(event) => handleToolDragStart({kind: "text"}, event)}
        onStructuredToolDragStart={(toolId, event) => handleToolDragStart({kind: "structured", toolId}, event)}
        onTogglePendingTextTool={() => togglePendingInsertTool({kind: "text"})}
        onShortcutDragStart={(shortcutId, event) => handleToolDragStart({kind: "shortcut", shortcutId}, event)}
        onToolDragEnd={handleToolDragEnd}
        onTogglePendingStructuredTool={(toolId) => togglePendingInsertTool({kind: "structured", toolId})}
        onTogglePendingShortcut={(shortcutId) => togglePendingInsertTool({kind: "shortcut", shortcutId})}
        onSelectScriptLetter={(label, content) => togglePendingInsertTool({kind: "scriptLetter", label, content})}
        onToggleAdvancedToolMode={toggleAdvancedToolMode}
        shouldIgnoreToolbarClick={shouldIgnoreToolbarClick}
        onApplyActiveColor={applyActiveColor}
        onApplyActiveHighlightColor={applyCanvasHighlight}
        onToggleCanvasBold={togglePendingBold}
        onToggleCanvasItalic={togglePendingItalic}
        onToggleCanvasUnderline={togglePendingUnderline}
        activeFontWeight={state.activeFontWeight}
        activeFontStyle={state.activeFontStyle}
        activeUnderline={state.activeUnderline}
        isElementMenuVisible={selectedElementMenuPosition !== null}
        onAdjustCanvasSize={adjustCanvasSize}
        onToggleMenu={toggleMenu}
        onToggleHighlightTool={toggleHighlightTool}
        onActivateHighlightTool={activateHighlightTool}
        onHeaderDelete={handleHeaderDelete}
        onInstallPwa={() => {
          void installPwa();
        }}
        onLocaleChange={(nextLocale) => {
          handleLocaleChange(nextLocale);
          setOpenMenu(null);
        }}
        profiles={profileStore.profiles}
        activeProfileId={profileStore.activeProfileId}
        onProfileChange={handleProfileChange}
        onDeleteProfile={handleDeleteProfile}
        onSetProfileEditMode={(mode) => { setProfileEditMode(mode); if (mode) setOpenMenu(null); }}
      />

      <section className="editor-stage">
        <WorkbookActionBar
          t={t}
          canOpenTools={isCompactViewport && !isToolsPanelOpen}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          isExporting={isExporting}
          sheetStyle={state.sheetStyle}
          sheetStyleOptions={workbookUi.sheetStyleOptions}
          pages={pageIndex.pages}
          activePageId={pageIndex.activePageId}
          onOpenTools={() => setIsToolsPanelOpen(true)}
          onUndo={undoHistory}
          onRedo={redoHistory}
          onExportPdf={exportPdf}
          onExportPng={exportPng}
          onPrint={printSheet}
          onSheetStyleChange={(sheetStyle) => setState((current) => ({...current, sheetStyle}))}
          onNewPage={handleNewPage}
          onSwitchPage={handleSwitchPage}
          onDeletePage={handleDeletePage}
          onDeleteAllPages={handleDeleteAllPages}
          onExportFile={handleExportFile}
          onImportFile={handleImportFile}
          profiles={profileStore.profiles}
          activeProfileId={profileStore.activeProfileId}
          onProfileChange={handleProfileChange}
          onSetProfileEditMode={(mode) => { setProfileEditMode(mode); if (mode) setOpenMenu(null); }}
        />

        <div className="editor-sheet">
          <div className="document-canvas-viewport">
            <div className="document-canvas-stage">
              <div
                className={`document-canvas document-canvas-${state.sheetStyle} ${isCanvasDropActive ? "document-canvas-drop-active" : ""} ${isCanvasInteracting ? "document-canvas-interacting" : ""} ${advancedTool === "draw" || advancedTool === "highlight" || advancedTool === "graduated-line" || activeGeometryTool ? "document-canvas-draw-mode" : ""} ${advancedTool === "highlight" ? "document-canvas-highlight-mode" : ""} ${activeGeometryTool === "protractor" ? "document-canvas-protractor-mode" : ""} ${pendingInsertTool ? "document-canvas-insert-mode" : ""} ${advancedTool === "draw" || advancedTool === "highlight" || advancedTool === "graduated-line" || advancedTool === "select" || advancedTool === "move" || pendingInsertTool || activeGeometryTool ? "document-canvas-touch-locked" : ""} ${(activeProfile?.highlightOnHover ?? true) ? "document-canvas-hover-highlight" : ""} ${activeProfile?.preferredFont === "opendyslexic" ? "document-canvas-font-opendyslexic" : ""}`}
                style={{ "--canvas-type-size": `${getDefaultCanvasFontSize(state.sheetStyle)}rem` } as ReactCSSProperties}
                ref={canvasRef}
                data-testid="document-canvas"
                onDragOver={handleCanvasDragOver}
                onDragLeave={handleCanvasDragLeave}
                onDrop={handleCanvasDrop}
                onMouseMove={(event) => updateInsertCursorPreview(event.clientX, event.clientY)}
                onMouseLeave={hideInsertCursorPreview}
                onTouchStart={(event) => handleSurfaceTouchStart(event, event.currentTarget)}
                onMouseDown={(event) => {
              if (activeGeometryTool && event.target === event.currentTarget) {
                event.preventDefault();
                event.stopPropagation();
                handleGeometrySurfacePointer(event.clientX, event.clientY);
                return;
              }

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
              data-testid="canvas-editor"
              suppressContentEditableWarning
              onMouseMove={(event) => updateInsertCursorPreview(event.clientX, event.clientY)}
              onMouseLeave={hideInsertCursorPreview}
              onMouseDown={(event) => {
                if (activeGeometryTool && event.target === event.currentTarget) {
                  event.preventDefault();
                  event.stopPropagation();
                  handleGeometrySurfacePointer(event.clientX, event.clientY);
                  return;
                }

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

            {(pendingInsertTool?.kind === "shortcut" || pendingInsertTool?.kind === "scriptLetter" || pendingInsertTool?.kind === "text") && insertCursorPreview.visible ? (
              <div
                className="canvas-insert-anchor"
                style={{
                  left: `${insertCursorPreview.x}px`,
                  top: `${insertCursorPreview.y}px`,
                  color: state.activeColor,
                  backgroundColor: pendingInsertTool?.kind === "text" ? (state.activeTextHighlightColor ?? "rgba(255, 250, 243, 0.92)") : undefined,
                  fontSize: pendingInsertTool?.kind === "text" ? `${state.activeFontSize}rem` : undefined,
                  fontWeight: pendingInsertTool?.kind === "text" ? state.activeFontWeight : undefined,
                  fontStyle: pendingInsertTool?.kind === "text" ? state.activeFontStyle : undefined,
                  textDecoration: pendingInsertTool?.kind === "text" && state.activeUnderline ? "underline" : undefined
                }}
                aria-hidden="true"
              >
                {pendingInsertTool.kind === "text"
                  ? t("toolbar.text")
                  : pendingInsertTool.kind === "scriptLetter"
                  ? renderShortcutGlyph({ id: "scriptLetter", label: pendingInsertTool.label })
                  : renderShortcutGlyph(findShortcutById(pendingInsertTool.shortcutId) ?? { id: pendingInsertTool.shortcutId, label: "?" })}
              </div>
            ) : null}

            {((pendingInsertTool && pendingInsertTool.kind !== "shortcut" && pendingInsertTool.kind !== "scriptLetter" && pendingInsertTool.kind !== "text") || advancedTool === "highlight") && insertCursorPreview.visible ? (
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
                ) : pendingInsertTool?.kind === "scriptLetter" ? (
                  renderShortcutGlyph({ id: "scriptLetter", label: pendingInsertTool.label })
                ) : null}
              </div>
            ) : null}

            {pendingInsertTool ? (
              <div key={`${pendingInsertTool.kind}-${pendingInsertLabel}`} className="canvas-insert-hint" aria-live="polite">
                <span className="canvas-insert-hint-glyph" aria-hidden="true">
                  {pendingInsertTool.kind === "text" ? "T" : pendingInsertTool.kind === "structured" ? renderStructuredToolGlyph(pendingInsertTool.toolId) : pendingInsertTool.kind === "scriptLetter" ? renderShortcutGlyph({ id: "scriptLetter", label: pendingInsertTool.label }) : renderShortcutGlyph(findShortcutById(pendingInsertTool.shortcutId) ?? { id: pendingInsertTool.shortcutId, label: "?" })}
                </span>
                <span>{t("canvas.insertHint", {item: pendingInsertLabel})}</span>
              </div>
            ) : null}

            {geometryDraftIndicator ? (
              <div
                className="canvas-geometry-indicator"
                style={{ left: `${geometryDraftIndicator.x}px`, top: `${geometryDraftIndicator.y}px` }}
                aria-hidden="true"
              >
                {geometryDraftIndicator.label}
              </div>
            ) : null}

            {activeGeometryTool ? (
              <div
                className="canvas-geometry-tool-capture"
                onMouseMove={(event) => {
                  updateGeometryToolPreview(event.clientX, event.clientY);
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleGeometrySurfacePointer(event.clientX, event.clientY);
                }}
                onTouchStart={(event) => {
                  const touch = event.touches[0];

                  if (!touch) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  handleGeometrySurfacePointer(touch.clientX, touch.clientY);
                }}
                onTouchMove={(event) => {
                  const touch = event.touches[0];

                  if (!touch) {
                    return;
                  }

                  event.preventDefault();
                  updateGeometryToolPreview(touch.clientX, touch.clientY);
                }}
              />
            ) : null}

            <GeometryCanvasLayer
              width={getCanvasIntrinsicSize().width}
              height={getCanvasIntrinsicSize().height}
              geometry={state.geometry}
              selectedGeometryIds={selectedGeometryIds}
              activeGeometryTool={activeGeometryTool}
              geometryMeasurement={geometryMeasurement}
              geometryAngleMeasurement={geometryAngleMeasurement}
              geometryDraft={geometryDraft}
              geometryProtractorDraft={geometryProtractorDraft}
              geometryCompassDraft={geometryCompassDraft}
              setGeometryNodeRef={(shapeId, node) => {
                geometryNodeRefs.current[shapeId] = node;
              }}
              startDraggingGeometry={(shapeId, x, y, event) => {
                startDragging("geometry", shapeId, x, y, event);
              }}
              startTouchDraggingGeometry={(shapeId, x, y, event, ignoreDrag) => {
                handleTouchDragStart("geometry", shapeId, x, y, event, ignoreDrag);
              }}
              renderProtractorOverlay={renderProtractorOverlay}
              createGeometryShapeFromDraft={createGeometryShapeFromDraft}
            />

            {state.blocks.map((block) => (
              <FloatingMathBlockItem
                key={block.id}
                block={block}
                isSelected={selectedBlockIds.includes(block.id)}
                isEditing={editingBlock?.blockId === block.id}
                renderInlineBlockEditor={renderInlineBlockEditor}
                setNodeRef={(node) => {
                  blockNodeRefs.current[block.id] = node;
                }}
                onDragStart={(event) => {
                  startDragging("block", block.id, block.x, block.y, event);
                }}
                onTouchDragStart={(event) => {
                  handleTouchDragStart("block", block.id, block.x, block.y, event);
                }}
                onDoubleClick={() => {
                  openEditModal(block.id);
                }}
                onBeginBlockEditing={beginBlockEditing}
              />
            ))}

            {state.symbols.map((symbol) => (
              <FloatingMathSymbolItem
                key={symbol.id}
                symbol={symbol}
                isSelected={selectedSymbolIds.includes(symbol.id)}
                setNodeRef={(node) => {
                  symbolNodeRefs.current[symbol.id] = node;
                }}
                onDragStart={(event) => {
                  startDragging("symbol", symbol.id, symbol.x, symbol.y, event);
                }}
                onTouchDragStart={(event) => {
                  handleTouchDragStart("symbol", symbol.id, symbol.x, symbol.y, event);
                }}
                onResizeStart={(handle, clientX, clientY) => {
                  startSymbolResize(symbol.id, handle, clientX, clientY);
                }}
              />
            ))}

            {state.textBoxes.filter((textBox) => !textBox.hidden).map((textBox) => (
              <FloatingTextBoxItem
                key={textBox.id}
                textBox={textBox}
                t={t}
                isSelected={selectedTextBoxIds.includes(textBox.id)}
                isEditing={editingTextBoxId === textBox.id}
                shortcuts={textBoxShortcuts}
                setNodeRef={(node) => {
                  textBoxNodeRefs.current[textBox.id] = node;
                }}
                getShortcutLayout={getFloatingTextShortcutLayout}
                onDragStart={(event) => {
                  startDragging("textBox", textBox.id, textBox.x, textBox.y, event);
                }}
                onTouchDragStart={(event) => {
                  handleTouchDragStart("textBox", textBox.id, textBox.x, textBox.y, event, editingTextBoxId === textBox.id);
                }}
                onDoubleClick={() => {
                  beginTextBoxEditing(textBox.id);
                }}
                onMouseDownInput={() => {
                  setCanvasQuickMenu(null);
                  selectSingleTextBox(textBox.id);
                }}
                onFocusInput={() => {
                  selectSingleTextBox(textBox.id);
                }}
                onTextChange={(nextText) => {
                  const minimumWidth = textBox.variant === "note" ? 56 : 36;

                  updateTextBox(textBox.id, {
                    text: nextText,
                    width: Math.max(minimumWidth, getTextBoxWidth(nextText, textBox.fontSize, activeFont))
                  });
                }}
                onSubmit={() => {
                  closeFloatingTextEditing();
                }}
                onBlurInput={(value) => {
                  if (!value.trim()) {
                    removeTextBox(textBox.id);
                    setEditingTextBoxId(null);
                    scheduleTransientHistoryCommit("edit");
                    return;
                  }

                  updateTextBox(textBox.id, {
                    text: value.trim(),
                    width: Math.max(textBox.variant === "note" ? 56 : 36, getTextBoxWidth(value, textBox.fontSize, activeFont))
                  });
                  setEditingTextBoxId(null);
                  clearFloatingSelection();
                  scheduleTransientHistoryCommit("edit");
                }}
                onInsertShortcut={(content) => {
                  insertIntoEditingTextBox(textBox.id, content);
                }}
              />
            ))}

            <DrawCanvasLayer
              advancedTool={advancedTool}
              strokes={state.strokes}
              selectedStrokeIds={selectedStrokeIds}
              draftStroke={draftStroke}
              draftStrokeStyle={draftStrokeStyleRef.current}
              graduatedLineDraft={graduatedLineDraft}
              setStrokeNodeRef={(strokeId, node) => {
                strokeNodeRefs.current[strokeId] = node;
              }}
              beginDrawOrGraduatedLine={(clientX, clientY) => {
                if (editingBlock?.blockId) {
                  finishBlockEditing(editingBlock.blockId);
                }

                if (editingTextBoxId) {
                  closeFloatingTextEditing();
                }

                if (advancedTool === "graduated-line") {
                  if (graduatedLineDraftRef.current) {
                    finishGraduatedLineDrawing(clientX, clientY);
                    return;
                  }

                  beginGraduatedLineDrawing(clientX, clientY);
                  return;
                }

                beginFreehandDrawing(clientX, clientY);
              }}
              updateHighlightCursor={updateInsertCursorPreview}
              hideHighlightCursor={hideInsertCursorPreview}
              startDraggingStroke={(strokeId, x, y, event) => {
                startDragging("stroke", strokeId, x, y, event);
              }}
              startTouchDraggingStroke={(strokeId, x, y, event, ignoreDrag) => {
                handleTouchDragStart("stroke", strokeId, x, y, event, ignoreDrag);
              }}
            />

            {snapGuides.x !== null ? (
              <div className="canvas-snap-guide canvas-snap-guide-vertical" style={{ left: `${snapGuides.x}px` }} aria-hidden="true" />
            ) : null}

            {snapGuides.y !== null ? (
              <div className="canvas-snap-guide canvas-snap-guide-horizontal" style={{ top: `${snapGuides.y}px` }} aria-hidden="true" />
            ) : null}

            <SelectionMenu t={t} position={multiSelectionMenuPosition} onAlign={alignSelectedItems} onDelete={removeSelectedItems} />

            <GeometrySettingsMenu
              t={t}
              menuRef={selectedGeometryMenuRef}
              position={selectedGeometryMenuPosition}
              selectedGeometry={selectedGeometry}
              selectedGraduatedLineSettings={selectedGraduatedLineSettings}
              onClose={clearFloatingSelection}
              onPointLabelChange={updateSelectedPointLabel}
              onSegmentLengthChange={updateSelectedSegmentLengthMm}
              onCircleRadiusChange={updateSelectedCircleRadiusMm}
              onGraduatedLineStartValueChange={(nextValue) => {
                patchSelectedGraduatedLineSettings({startValue: nextValue});
                updateSelectedGraduatedLineStartValue(nextValue);
              }}
              onGraduatedLineSectionsChange={(nextValue) => {
                patchSelectedGraduatedLineSettings({sections: nextValue});
                updateSelectedGraduatedLineSections(nextValue);
              }}
            />

            <TextFormatMenu
              t={t}
              menuRef={selectedElementMenuRef}
              position={selectedElementMenuPosition}
              colorOptions={workbookUi.colorOptions}
              activeColor={state.activeColor}
              highlightOptions={workbookUi.highlightOptions}
              selectedHighlightColor={selectedHighlightColor}
              selectedFontWeight={selectedFormatElement?.fontWeight ?? 500}
              selectedFontStyle={selectedFormatElement?.fontStyle ?? "normal"}
              selectedUnderline={selectedFormatElement?.underline ?? false}
              onClose={clearFloatingSelection}
              onApplyColor={applyActiveColor}
              onBold={toggleCanvasBold}
              onItalic={toggleCanvasItalic}
              onUnderline={toggleCanvasUnderline}
              onSizeChange={adjustCanvasSize}
              onHighlight={applyCanvasHighlight}
            />

            {canvasQuickMenu ? (
              <CanvasQuickInsertMenu
                t={t}
                menu={canvasQuickMenu}
                structuredTools={activeStructuredTools}
                inlineShortcuts={activeInlineShortcuts.flatMap((group) => group.items)}
                onClose={() => setCanvasQuickMenu(null)}
                onCreateText={() => createTextBoxAt(canvasQuickMenu.clickX, canvasQuickMenu.clickY)}
                onCreateStructured={(toolId) => createStructuredToolAt(toolId, canvasQuickMenu.clickX, canvasQuickMenu.clickY)}
                onCreateShortcut={(shortcutId) => createShortcutSymbolAt(shortcutId, canvasQuickMenu.clickX, canvasQuickMenu.clickY)}
              />
            ) : null}

            {selectionRect ? <SelectionRectOverlay selectionRect={selectionRect} /> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <GuidedBlockModal
        t={t}
        modalState={modalState}
        blockTitles={workbookUi.blockTitles}
        renderModalFields={renderModalFields}
        onClose={() => setModalState(null)}
        onApply={applyModalBlock}
      />

      <GraduatedLineModal
        t={t}
        graduatedLineModalState={graduatedLineModalState}
        graduatedLineModalSettings={graduatedLineModalSettings}
        onClose={cancelGraduatedLineModal}
        onConfirm={confirmGraduatedLineModal}
        onStartValueChange={(value) => {
          const nextSettings = {
            startValue: value.replace(/[^0-9-]/g, ""),
            sections: graduatedLineModalSettings?.sections ?? graduatedLineModalState?.sections ?? "10"
          };
          graduatedLineModalSettingsRef.current = nextSettings;
          setGraduatedLineModalSettings(nextSettings);
        }}
        onSectionsChange={updateGraduatedLineModalSections}
        onSelectPreset={selectGraduatedLinePreset}
        renderPreview={(startValue, sections) =>
          graduatedLineModalState
            ? renderGraduatedLinePreview(graduatedLineModalState.start, graduatedLineModalState.end, startValue, sections)
            : null
        }
      />

      <ConfirmResetModal
        t={t}
        confirmResetState={confirmResetState}
        onClose={() => setConfirmResetState(null)}
        onConfirm={confirmResetDocument}
      />
      {confirmDeleteAllOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirmDeleteAllOpen(false)}>
          <section className="block-modal" role="dialog" aria-modal="true" aria-labelledby="delete-all-modal-title" onClick={(event) => event.stopPropagation()}>
            <div className="block-modal-head">
              <div>
                <p className="card-kind">{t("modal.confirmation")}</p>
                <h2 id="delete-all-modal-title">{t("pages.deleteAll")}</h2>
                <p className="toolbar-helper">{t("pages.deleteAllConfirm")}</p>
              </div>
              <div className="card-actions">
                <button type="button" className="small-action" onClick={() => setConfirmDeleteAllOpen(false)}>
                  {t("modal.cancel")}
                </button>
                <button type="button" className="small-action primary-inline-action" onClick={confirmDeleteAllPages}>
                  {t("pages.deleteAll")}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept=".dysmaths,.json"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
      {profileEditMode ? (
        <ProfileModal
          key={profileEditMode === "edit" ? activeProfile?.id : "__create__"}
          t={t}
          mode={profileEditMode}
          profile={profileEditMode === "edit" ? activeProfile : null}
          sheetStyleOptions={workbookUi.sheetStyleOptions}
          onSave={(data) => {
            if (profileEditMode === "edit" && activeProfile) {
              handleUpdateProfile({ ...data, id: activeProfile.id });
            } else {
              handleCreateProfile(data);
            }
          }}
          onClose={() => setProfileEditMode(null)}
        />
      ) : null}
    </main>
  );
}
