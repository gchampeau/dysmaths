import {useRef, useState} from "react";
import {createPortal} from "react-dom";
import type {CSSProperties as ReactCSSProperties, DragEvent as ReactDragEvent, ReactNode, RefObject} from "react";
import {localeLabels, type AppLocale} from "@/i18n/routing";
import {
  renderShortcutGlyph,
  renderStructuredToolGlyph,
  DEFAULT_HIGHLIGHT_TOOL_COLOR,
  SCRIPT_LETTER_OPTIONS,
  GRADUATED_LINE_PRESET_VALUES,
  getArithmeticOperator,
  getArithmeticCarryCells,
  getBlockTitle,
  getCarryFieldForArithmeticLine,
  getColumnArithmeticColumns,
  getDivisionDivisorColumns,
  getDivisionLeftColumns,
  getDivisionQuotientColumns,
  getDivisionVisibleWorkLines,
  getLastFilledArithmeticCarryOffset,
  hasArithmeticCarryCells,
  isColumnArithmeticBlock,
  renderArithmeticCarryRow,
  renderDivisionCellRow,
  renderGeometryToolGlyph,
  renderGraduatedLineGlyph,
  renderMathPreview,
  type AdvancedTool,
  type ArithmeticLineField,
  type AdditionBlock,
  type CanvasQuickMenu,
  type ConfirmResetState,
  type GeometryShape,
  type GeometryTool,
  type GeometryToolOption,
  type GraduatedLineModalState,
  type GraduatedLineModalSettings,
  type HighlightOption,
  type InlineShortcutItem,
  type MathBlock,
  type ModalState,
  type MultiplicationBlock,
  type PendingInsertTool,
  type SelectionRect,
  type SheetStyle,
  type SheetStyleOption,
  type SubtractionBlock,
  type StructuredTool,
  type StudyMode,
  type StructuredToolOption,
  type UserProfile,
  type WorkbookTranslator
} from "@/components/math-workbook/shared";

type WorkbookSidebarProps = {
  t: WorkbookTranslator;
  locale: AppLocale;
  isToolsPanelOpen: boolean;
  activeGeometryTool: GeometryTool | null;
  geometryTools: GeometryToolOption[];
  geometryPanelHelper: string | null;
  operationStructuredTools: StructuredToolOption[];
  rootStructuredTool: StructuredToolOption | null;
  commonInlineShortcuts: InlineShortcutItem[];
  visibleHighSchoolInlineShortcuts: InlineShortcutItem[];
  pendingInsertTool: PendingInsertTool;
  advancedTool: AdvancedTool;
  colorOptions: Array<{ id: string; label: string; value: string }>;
  activeColor: string;
  highlightOptions: HighlightOption[];
  activeHighlightColor: string | null;
  selectedHighlightColor: string | null;
  openMenu: "highlight" | "settings" | "install" | null;
  selectedCount: number;
  activeFontWeight: number;
  activeFontStyle: "normal" | "italic";
  activeUnderline: boolean;
  isElementMenuVisible: boolean;
  canInstallApp: boolean;
  isInstalledApp: boolean;
  onCloseToolsPanel: () => void;
  onToggleGeometryTool: (tool: GeometryTool) => void;
  onStructuredToolDragStart: (toolId: StructuredTool, event: ReactDragEvent<HTMLButtonElement>) => void;
  onShortcutDragStart: (shortcutId: string, event: ReactDragEvent<HTMLButtonElement>) => void;
  onToolDragEnd: () => void;
  onTogglePendingStructuredTool: (toolId: StructuredTool) => void;
  onTogglePendingShortcut: (shortcutId: string) => void;
  onSelectScriptLetter: (label: string, content: string) => void;
  onToggleAdvancedToolMode: (tool: AdvancedTool) => void;
  shouldIgnoreToolbarClick: () => boolean;
  onApplyActiveColor: (color: string) => void;
  onApplyActiveHighlightColor: (color: string) => void;
  onToggleCanvasBold: () => void;
  onToggleCanvasItalic: () => void;
  onToggleCanvasUnderline: () => void;
  onAdjustCanvasSize: (direction: "down" | "up") => void;
  onToggleMenu: (menu: "highlight" | "background" | "settings" | "install") => void;
  onToggleHighlightTool: () => void;
  onActivateHighlightTool: (highlightColor: string) => void;
  onHeaderDelete: () => void;
  onInstallPwa: () => void;
  onLocaleChange: (locale: string) => void;
  profiles: UserProfile[];
  activeProfileId: string | null;
  onProfileChange: (profileId: string | null) => void;
  onDeleteProfile: (profileId: string) => void;
  onSetProfileEditMode: (mode: "create" | "edit" | null) => void;
};

export function WorkbookSidebar({
  t,
  locale,
  isToolsPanelOpen,
  activeGeometryTool,
  geometryTools,
  geometryPanelHelper,
  operationStructuredTools,
  rootStructuredTool,
  commonInlineShortcuts,
  visibleHighSchoolInlineShortcuts,
  pendingInsertTool,
  advancedTool,
  colorOptions,
  activeColor,
  highlightOptions,
  activeHighlightColor,
  selectedHighlightColor,
  openMenu,
  selectedCount,
  activeFontWeight,
  activeFontStyle,
  activeUnderline,
  isElementMenuVisible,
  canInstallApp,
  isInstalledApp,
  onCloseToolsPanel,
  onToggleGeometryTool,
  onStructuredToolDragStart,
  onShortcutDragStart,
  onToolDragEnd,
  onTogglePendingStructuredTool,
  onTogglePendingShortcut,
  onSelectScriptLetter,
  onToggleAdvancedToolMode,
  shouldIgnoreToolbarClick,
  onApplyActiveColor,
  onApplyActiveHighlightColor,
  onToggleCanvasBold,
  onToggleCanvasItalic,
  onToggleCanvasUnderline,
  onAdjustCanvasSize,
  onToggleMenu,
  onToggleHighlightTool,
  onActivateHighlightTool,
  onHeaderDelete,
  onInstallPwa,
  onLocaleChange,
  profiles,
  activeProfileId,
  onProfileChange,
  onDeleteProfile,
  onSetProfileEditMode
}: WorkbookSidebarProps) {
  const [isScriptDropdownOpen, setIsScriptDropdownOpen] = useState(false);
  const backgroundButtonRef = useRef<HTMLButtonElement | null>(null);
  const [backgroundMenuPosition, setBackgroundMenuPosition] = useState<{ left: number; top: number } | null>(null);

  function openBackgroundMenu() {
    const rect = backgroundButtonRef.current?.getBoundingClientRect();
    if (!rect) {
      setBackgroundMenuPosition(null);
      onToggleMenu("background");
      return;
    }

    setBackgroundMenuPosition({
      left: rect.right + 12,
      top: rect.top + rect.height / 2
    });
    onToggleMenu("background");
  }

  function closeBackgroundMenu() {
    setBackgroundMenuPosition(null);
    onToggleMenu("background");
  }
  return (
    <>
      {isToolsPanelOpen ? <button type="button" className="tools-drawer-backdrop" aria-label={t("toolbar.closeTools")} onClick={onCloseToolsPanel} /> : null}

      <header className={`top-toolbar ${isToolsPanelOpen ? "top-toolbar-open" : ""}`}>
        <div className="top-toolbar-inner">


          <div className="toolbar-row toolbar-row-secondary sidebar-block sidebar-block-compact" aria-label={t("toolbar.tools")}>
            <p className="sidebar-block-label">{t("toolbar.tools")}</p>
            <div className="editor-local-toolbar-group toolbar-advanced-group">
              <button
                type="button"
                className={`toolbar-shortcut toolbar-shortcut-symbol ${advancedTool === "select" ? "toolbar-shortcut-active" : ""}`}
                title={t("toolbar.selection")}
                aria-label={t("toolbar.selection")}
                aria-pressed={advancedTool === "select"}
                onClick={() => onToggleAdvancedToolMode("select")}
              >
                <span className="selection-icon" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`toolbar-shortcut toolbar-shortcut-symbol ${advancedTool === "draw" ? "toolbar-shortcut-active" : ""}`}
                title={t("toolbar.freehand")}
                aria-label={t("toolbar.freehand")}
                aria-pressed={advancedTool === "draw"}
                onClick={() => onToggleAdvancedToolMode("draw")}
              >
                ✎
              </button>
              <div className="toolbar-highlight-shell">
                <button
                  type="button"
                  className={`chip-button toolbar-highlight-button ${openMenu === "highlight" || advancedTool === "highlight" ? "toolbar-highlight-button-active" : ""}`}
                  aria-label={t("toolbar.highlighter")}
                  title={t("toolbar.highlighter")}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onToggleHighlightTool}
                >
                  <span className="toolbar-highlight-marker" aria-hidden="true">
                    <span className="toolbar-highlight-marker-tip" />
                    <span className="toolbar-highlight-marker-body" />
                    <span className="toolbar-highlight-marker-line" style={{backgroundColor: selectedHighlightColor ?? DEFAULT_HIGHLIGHT_TOOL_COLOR}} />
                  </span>
                  <span className="toolbar-highlight-caret" aria-hidden="true">▾</span>
                </button>

                {openMenu === "highlight" ? createPortal(
                  <div className="toolbar-highlight-backdrop" onMouseDown={(event) => {
                    const x = event.clientX;
                    const y = event.clientY;
                    onToggleMenu("highlight");
                    requestAnimationFrame(() => {
                      const el = document.elementFromPoint(x, y);
                      if (el instanceof HTMLElement) { el.click(); }
                    });
                  }}>
                    <div className="toolbar-highlight-panel toolbar-highlight-portal" role="menu" aria-label={t("toolbar.chooseHighlighter")} onMouseDown={(event) => event.stopPropagation()}>
                      {highlightOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`toolbar-highlight-swatch ${(option.value || null) === activeHighlightColor && advancedTool === "highlight" ? "toolbar-highlight-swatch-active" : ""}`}
                          aria-label={option.label}
                          title={option.label}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => onActivateHighlightTool(option.value)}
                        >
                          <span className="toolbar-highlight-swatch-sample" style={option.value ? {backgroundColor: option.value} : undefined} />
                          <span className="toolbar-highlight-swatch-label">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>,
                  document.body
                ) : null}
              </div>
              {selectedCount > 0 ? (
                <button type="button" className="toolbar-shortcut toolbar-shortcut-symbol" title={t("toolbar.delete")} onClick={onHeaderDelete}>
                  ×
                </button>
              ) : null}
            </div>
          </div>

          <div className={`toolbar-row toolbar-row-secondary toolbar-row-format sidebar-block sidebar-block-compact${isElementMenuVisible ? " toolbar-row-disabled" : ""}`} aria-label={t("toolbar.formatting")} aria-disabled={isElementMenuVisible}>
            <p className="sidebar-block-label">{t("toolbar.defaultStyle")}</p>

            <div className="toolbar-color-row">
              <button
                ref={backgroundButtonRef}
                type="button"
                className={`canvas-quick-action canvas-text-highlight-chip${openMenu === "background" ? " canvas-text-highlight-chip-active" : ""}`}
                title={t("toolbar.backgroundColor")}
                aria-label={t("toolbar.backgroundColor")}
                aria-expanded={openMenu === "background"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={openBackgroundMenu}
              >
                <svg viewBox="0 0 16 14" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                  <rect x="1" y="1" width="14" height="12" rx="2" />
                  <rect x="3" y="3" width="10" height="8" rx="1" fill={activeHighlightColor ?? "none"} stroke={activeHighlightColor ? "none" : "currentColor"} strokeWidth="0.8" strokeDasharray="2 1.2" />
                </svg>
              </button>
              <span className="toolbar-color-icon" title={t("toolbar.textColor")} aria-label={t("toolbar.textColor")}>
                <span className="toolbar-color-icon-letter" aria-hidden="true">A</span>
                <span className="toolbar-color-icon-bar" style={{backgroundColor: activeColor}} aria-hidden="true" />
              </span>
              {colorOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`canvas-quick-action canvas-text-color-chip${activeColor === option.value ? " canvas-text-color-chip-active" : ""}`}
                  style={{"--swatch-color": option.value} as ReactCSSProperties}
                  aria-label={option.label}
                  title={option.label}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onApplyActiveColor(option.value)}
                >
                  <span className="canvas-text-color-sample" style={{backgroundColor: option.value}} />
                </button>
              ))}
              {openMenu === "background" ? createPortal(
                <div className="toolbar-highlight-backdrop" onMouseDown={closeBackgroundMenu}>
                  <div
                    className="toolbar-highlight-panel toolbar-highlight-portal toolbar-background-portal"
                    role="menu"
                    aria-label={t("toolbar.backgroundColor")}
                    onMouseDown={(event) => event.stopPropagation()}
                    style={backgroundMenuPosition ? {left: `${backgroundMenuPosition.left}px`, top: `${backgroundMenuPosition.top}px`} : undefined}
                  >
                    <button
                      type="button"
                      className={`toolbar-highlight-swatch toolbar-highlight-swatch-clear ${activeHighlightColor === null ? "toolbar-highlight-swatch-active toolbar-highlight-swatch-color" : ""}`}
                      aria-label={t("toolbar.noBackground")}
                      title={t("toolbar.noBackground")}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onApplyActiveHighlightColor("")}
                      style={activeHighlightColor === null ? {borderColor: "var(--accent)", boxShadow: "inset 0 0 0 2px var(--accent)"} : undefined}
                    >
                      <span className="toolbar-highlight-swatch-sample" />
                    </button>
                    {highlightOptions.filter((option) => option.value).map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`toolbar-highlight-swatch ${option.value === activeHighlightColor ? "toolbar-highlight-swatch-active toolbar-highlight-swatch-color" : ""}`}
                        aria-label={option.label}
                        title={option.label}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onApplyActiveHighlightColor(option.value)}
                        style={option.value === activeHighlightColor ? {borderColor: option.value, boxShadow: `inset 0 0 0 2px ${option.value}`} : undefined}
                      >
                        <span className="toolbar-highlight-swatch-sample" style={{backgroundColor: option.value}} />
                      </button>
                    ))}
                  </div>
                </div>,
                document.body
              ) : null}
            </div>

            <div className="toolbar-color-row">
              <button type="button" className={`chip-button chip-button-compact${activeFontWeight >= 700 ? " chip-button-active" : ""}`} aria-label={t("toolbar.bold")} title={t("toolbar.bold")} onMouseDown={(event) => event.preventDefault()} onClick={onToggleCanvasBold}>
                B
              </button>
              <button type="button" className={`chip-button chip-button-compact${activeFontStyle === "italic" ? " chip-button-active" : ""}`} aria-label={t("toolbar.italic")} title={t("toolbar.italic")} onMouseDown={(event) => event.preventDefault()} onClick={onToggleCanvasItalic}>
                I
              </button>
              <button type="button" className={`chip-button chip-button-compact${activeUnderline ? " chip-button-active" : ""}`} aria-label={t("toolbar.underline")} title={t("toolbar.underline")} onMouseDown={(event) => event.preventDefault()} onClick={onToggleCanvasUnderline}>
                <span style={{textDecoration: "underline"}}>U</span>
              </button>
              <button type="button" className="chip-button chip-button-compact" aria-label={t("toolbar.decrease")} title={t("toolbar.decrease")} onMouseDown={(event) => event.preventDefault()} onClick={() => onAdjustCanvasSize("down")}>
                A-
              </button>
              <button type="button" className="chip-button chip-button-compact" aria-label={t("toolbar.increase")} title={t("toolbar.increase")} onMouseDown={(event) => event.preventDefault()} onClick={() => onAdjustCanvasSize("up")}>
                A+
              </button>
            </div>
          </div>

          <div className="toolbar-row toolbar-row-secondary sidebar-block sidebar-block-compact">
            <p className="sidebar-block-label">{t("toolbar.geometry")}</p>
            <div className="toolbar-shortcut-group toolbar-shortcut-group-symbols" aria-label={t("toolbar.geometryGroup")}>
              {geometryTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={`toolbar-shortcut toolbar-shortcut-symbol sheet-tool-button ${activeGeometryTool === tool.id ? "toolbar-shortcut-active sheet-tool-button-active" : ""}`}
                  aria-label={tool.label}
                  aria-pressed={activeGeometryTool === tool.id}
                  title={tool.hint}
                  onClick={() => onToggleGeometryTool(tool.id)}
                >
                  {renderGeometryToolGlyph(tool)}
                </button>
              ))}
            </div>
            {activeGeometryTool ? <p className="sidebar-helper geometry-panel-helper">{geometryPanelHelper}</p> : null}
          </div>

          <div className="toolbar-row toolbar-row-secondary sidebar-block sidebar-block-compact">
            <p className="sidebar-block-label">{t("toolbar.structuredOperations")}</p>
            <div className="toolbar-shortcut-group" aria-label={t("toolbar.insertionTools")}>
              {operationStructuredTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={`toolbar-shortcut toolbar-shortcut-symbol ${pendingInsertTool?.kind === "structured" && pendingInsertTool.toolId === tool.id ? "toolbar-shortcut-active" : ""}`}
                  aria-label={tool.label}
                  aria-pressed={pendingInsertTool?.kind === "structured" && pendingInsertTool.toolId === tool.id}
                  draggable
                  title={tool.hint}
                  onDragStart={(event) => onStructuredToolDragStart(tool.id, event)}
                  onDragEnd={onToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    onTogglePendingStructuredTool(tool.id);
                  }}
                >
                  {renderStructuredToolGlyph(tool.id)}
                </button>
              ))}
              <button
                type="button"
                className={`toolbar-shortcut toolbar-shortcut-symbol ${advancedTool === "graduated-line" ? "toolbar-shortcut-active" : ""}`}
                aria-label={t("toolbar.graduatedLine")}
                aria-pressed={advancedTool === "graduated-line"}
                title={t("toolbar.graduatedLine")}
                onClick={() => onToggleAdvancedToolMode("graduated-line")}
              >
                {renderGraduatedLineGlyph()}
              </button>
            </div>
          </div>

          <div className="toolbar-row toolbar-row-secondary sidebar-block sidebar-block-compact">
            <p className="sidebar-block-label">{t("toolbar.commonSymbols")}</p>
            <div className="toolbar-shortcut-group toolbar-shortcut-group-symbols" aria-label={t("toolbar.commonSymbolShortcuts")}>
              {rootStructuredTool ? (
                <button
                  type="button"
                  className={`toolbar-shortcut toolbar-shortcut-symbol ${pendingInsertTool?.kind === "structured" && pendingInsertTool.toolId === rootStructuredTool.id ? "toolbar-shortcut-active" : ""}`}
                  aria-label={rootStructuredTool.label}
                  aria-pressed={pendingInsertTool?.kind === "structured" && pendingInsertTool.toolId === rootStructuredTool.id}
                  draggable
                  title={rootStructuredTool.hint}
                  onDragStart={(event) => onStructuredToolDragStart(rootStructuredTool.id, event)}
                  onDragEnd={onToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    onTogglePendingStructuredTool(rootStructuredTool.id);
                  }}
                >
                  {renderStructuredToolGlyph(rootStructuredTool.id)}
                </button>
              ) : null}
              {commonInlineShortcuts.filter((s) => !s.id.startsWith("script")).map((shortcut) => (
                <button
                  key={shortcut.id}
                  type="button"
                  className={`toolbar-shortcut toolbar-shortcut-symbol ${pendingInsertTool?.kind === "shortcut" && pendingInsertTool.shortcutId === shortcut.id ? "toolbar-shortcut-active" : ""}`}
                  draggable
                  title={shortcut.hint}
                  aria-pressed={pendingInsertTool?.kind === "shortcut" && pendingInsertTool.shortcutId === shortcut.id}
                  onDragStart={(event) => onShortcutDragStart(shortcut.id, event)}
                  onDragEnd={onToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    onTogglePendingShortcut(shortcut.id);
                  }}
                >
                  {renderShortcutGlyph(shortcut)}
                </button>
              ))}
              <button
                type="button"
                className={`toolbar-shortcut toolbar-shortcut-symbol ${isScriptDropdownOpen || pendingInsertTool?.kind === "scriptLetter" ? "toolbar-shortcut-active" : ""}`}
                title={t("toolbar.scriptLetters")}
                aria-expanded={isScriptDropdownOpen}
                onClick={() => setIsScriptDropdownOpen((open) => !open)}
              >
                <span className="math-shortcut-glyph">{"\u{1D4B6}\u2009\u2026\u2009\u{1D4CF}"}</span>
              </button>
              {isScriptDropdownOpen ? createPortal(
                <div className="toolbar-script-backdrop" onClick={() => setIsScriptDropdownOpen(false)}>
                  <div className="toolbar-script-dropdown" onClick={(event) => event.stopPropagation()}>
                    {SCRIPT_LETTER_OPTIONS.map((option) => (
                      <button
                        key={option.letter}
                        type="button"
                        className={`toolbar-script-letter ${pendingInsertTool?.kind === "scriptLetter" && pendingInsertTool.content === option.script ? "toolbar-script-letter-active" : ""}`}
                        onClick={() => {
                          onSelectScriptLetter(option.script, option.script);
                          setIsScriptDropdownOpen(false);
                        }}
                      >
                        {option.script}
                      </button>
                    ))}
                  </div>
                </div>,
                document.body
              ) : null}
            </div>
          </div>

          <div className="toolbar-row toolbar-row-secondary sidebar-block sidebar-block-compact">
            <p className="sidebar-block-label">{t("toolbar.highSchoolTools")}</p>
            <div className="toolbar-shortcut-group toolbar-shortcut-group-symbols" aria-label={t("toolbar.highSchoolShortcuts")}>
              {visibleHighSchoolInlineShortcuts.map((shortcut) => (
                <button
                  key={shortcut.id}
                  type="button"
                  className={`toolbar-shortcut toolbar-shortcut-symbol ${pendingInsertTool?.kind === "shortcut" && pendingInsertTool.shortcutId === shortcut.id ? "toolbar-shortcut-active" : ""}`}
                  draggable
                  title={shortcut.hint}
                  aria-pressed={pendingInsertTool?.kind === "shortcut" && pendingInsertTool.shortcutId === shortcut.id}
                  onDragStart={(event) => onShortcutDragStart(shortcut.id, event)}
                  onDragEnd={onToolDragEnd}
                  onClick={() => {
                    if (shouldIgnoreToolbarClick()) {
                      return;
                    }

                    onTogglePendingShortcut(shortcut.id);
                  }}
                >
                  {renderShortcutGlyph(shortcut)}
                </button>
              ))}
            </div>
          </div>


        </div>

        <footer className="sidebar-footer">
          <div className="sidebar-settings">
            <button
              type="button"
              className={`sidebar-settings-button ${openMenu === "settings" ? "sidebar-settings-button-active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={openMenu === "settings"}
              aria-label={t("toolbar.settings")}
              title={t("toolbar.settings")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onToggleMenu("settings")}
            >
              <span className="sidebar-settings-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm9 4.8-.02-2-2.18-.5a7.2 7.2 0 0 0-.72-1.72l1.18-1.9-1.42-1.42-1.9 1.18a7.2 7.2 0 0 0-1.72-.72L13 3h-2l-.5 2.18a7.2 7.2 0 0 0-1.72.72l-1.9-1.18-1.42 1.42 1.18 1.9a7.2 7.2 0 0 0-.72 1.72L3 11v2l2.18.5c.15.6.39 1.18.72 1.72l-1.18 1.9 1.42 1.42 1.9-1.18c.54.33 1.12.57 1.72.72L11 21h2l.5-2.18c.6-.15 1.18-.39 1.72-.72l1.9 1.18 1.42-1.42-1.18-1.9c.33-.54.57-1.12.72-1.72L21 13Z" />
                </svg>
              </span>
              <span>{t("toolbar.settings")}</span>
            </button>

            {!isInstalledApp ? (
              <button
                type="button"
                className={`sidebar-settings-button ${openMenu === "install" ? "sidebar-settings-button-active" : ""}`}
                aria-label={t("toolbar.install")}
                title={t("toolbar.install")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={onInstallPwa}
              >
                <span className="sidebar-settings-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.29a1 1 0 1 1 1.4 1.41l-4 3.99a1 1 0 0 1-1.4 0l-4-3.99a1 1 0 1 1 1.4-1.41L11 12.59V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" />
                  </svg>
                </span>
                <span>{t("toolbar.install")}</span>
              </button>
            ) : null}

            {openMenu === "install" && !canInstallApp ? (
              <div className="sidebar-settings-panel" role="note" aria-label={t("toolbar.install")}>
                <p className="sidebar-settings-copy">{t("toolbar.installHelp")}</p>
              </div>
            ) : null}

            {openMenu === "settings" ? createPortal(
              <div className="sidebar-settings-backdrop" onClick={() => onToggleMenu("settings")}>
                <div className="sidebar-settings-panel sidebar-settings-portal" role="menu" aria-label={t("toolbar.settings")} onClick={(event) => event.stopPropagation()}>
                  <div className="sidebar-settings-field">
                    <div className="sidebar-profile-header">
                      <span>{t("profile.selectProfile")}</span>
                      <button type="button" className="sidebar-profile-action" title={t("profile.createProfile")} onClick={() => onSetProfileEditMode("create")}>+</button>
                    </div>
                    <ul className="sidebar-profile-list">
                      <li
                        className={`sidebar-profile-item ${activeProfileId === null ? "sidebar-profile-item-active" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => onProfileChange(null)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onProfileChange(null); }}
                      >
                        <span className="profile-switcher-badge" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </span>
                        <span className="sidebar-profile-item-name">{t("profile.anonymous")}</span>
                      </li>
                      {profiles.map((p) => (
                        <li
                          key={p.id}
                          className={`sidebar-profile-item ${p.id === activeProfileId ? "sidebar-profile-item-active" : ""}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => onProfileChange(p.id)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onProfileChange(p.id); }}
                        >
                          <span className={`profile-switcher-badge ${p.id === activeProfileId ? "profile-switcher-badge-active" : ""}`} aria-hidden="true">
                            {`${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase()}
                          </span>
                          <span className="sidebar-profile-item-name">{p.firstName} {p.lastName}</span>
                          <div className="sidebar-profile-item-actions" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="sidebar-profile-action" title={t("profile.editProfile")} onClick={() => { onProfileChange(p.id); onSetProfileEditMode("edit"); }}>✎</button>
                            <button type="button" className="sidebar-profile-action" title={t("profile.deleteProfile")} onClick={() => { if (window.confirm(t("profile.deleteProfileConfirm"))) { onDeleteProfile(p.id); } }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <hr className="sidebar-settings-divider" />
                  <label className="sidebar-settings-field-inline">
                    <span>{t("toolbar.language")}</span>
                    <select
                      className="sheet-style-select"
                      value={locale}
                      onChange={(event) => onLocaleChange(event.target.value)}
                      aria-label={t("toolbar.language")}
                      data-testid="language-select"
                    >
                      {Object.entries(localeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>,
              document.body
            ) : null}
          </div>
          <p className="sidebar-credit">
            {t("toolbar.creditPrefix")}{" "}
            <span className="sidebar-credit-links">
              <a href="https://www.champeau.info" target="_blank" rel="noreferrer">
                Guillaume Champeau
              </a>
              <a
                className="sidebar-credit-icon-link"
                href="https://github.com/gchampeau/dysmaths"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                title="GitHub repository"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.38-3.37-1.38-.46-1.2-1.12-1.52-1.12-1.52-.92-.65.07-.64.07-.64 1.02.07 1.56 1.07 1.56 1.07.9 1.57 2.36 1.12 2.93.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.38-2.03 1-2.75-.1-.26-.43-1.3.1-2.71 0 0 .83-.27 2.7 1.05a9.1 9.1 0 0 1 4.92 0c1.87-1.32 2.7-1.05 2.7-1.05.53 1.41.2 2.45.1 2.71.63.72 1 1.63 1 2.75 0 3.93-2.34 4.8-4.57 5.06.36.32.68.95.68 1.91 0 1.38-.01 2.49-.01 2.83 0 .27.18.58.69.48A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
                </svg>
              </a>
            </span>
          </p>
        </footer>
      </header>
    </>
  );
}

type WorkbookActionBarProps = {
  t: WorkbookTranslator;
  canOpenTools: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isExporting: "pdf" | "png" | "print" | null;
  sheetStyle: SheetStyle;
  sheetStyleOptions: SheetStyleOption[];
  profiles: UserProfile[];
  activeProfileId: string | null;
  onOpenTools: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  onPrint: () => void;
  onSheetStyleChange: (sheetStyle: SheetStyle) => void;
  onResetDocument: () => void;
  onProfileChange: (profileId: string | null) => void;
  onSetProfileEditMode: (mode: "create" | "edit" | null) => void;
};

export function WorkbookActionBar({
  t,
  canOpenTools,
  canUndo,
  canRedo,
  isExporting,
  sheetStyle,
  sheetStyleOptions,
  onOpenTools,
  onUndo,
  onRedo,
  onExportPdf,
  onExportPng,
  onPrint,
  onSheetStyleChange,
  onResetDocument,
  profiles,
  activeProfileId,
  onProfileChange,
  onSetProfileEditMode
}: WorkbookActionBarProps) {
  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const initials = activeProfile ? `${activeProfile.firstName.charAt(0)}${activeProfile.lastName.charAt(0)}`.toUpperCase() : null;

  function handleSwitcherChange(value: string) {
    if (value === "__create__") {
      onSetProfileEditMode("create");
    } else {
      onProfileChange(value || null);
    }
  }
  return (
    <div className="sheet-action-bar">
      <div className="sheet-action-group">
        {canOpenTools ? (
          <button type="button" className="toolbar-action ghost tablet-tools-toggle" onClick={onOpenTools}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            {t("toolbar.tools")}
          </button>
        ) : null}
        <button type="button" className="toolbar-action ghost" onClick={onUndo} disabled={!canUndo}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10h13a4 4 0 0 1 0 8H12" />
            <polyline points="7 6 3 10 7 14" />
          </svg>
          {t("toolbar.undo")}
        </button>
        <button type="button" className="toolbar-action ghost" onClick={onRedo} disabled={!canRedo}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10H8a4 4 0 0 0 0 8h5" />
            <polyline points="17 6 21 10 17 14" />
          </svg>
          {t("toolbar.redo")}
        </button>
      </div>
      <div className="sheet-action-group">
        <button type="button" className="toolbar-action primary" onClick={onExportPdf} disabled={isExporting !== null}>
          {isExporting === "pdf" ? t("toolbar.exportPdfLoading") : "PDF"}
        </button>
        <button type="button" className="toolbar-action secondary" onClick={onExportPng} disabled={isExporting !== null}>
          {isExporting === "png" ? t("toolbar.exportPngLoading") : "PNG"}
        </button>
        <button type="button" className="toolbar-action ghost" onClick={onPrint} disabled={isExporting !== null}>
          {isExporting === "print" ? t("toolbar.preparingPrint") : t("toolbar.print")}
        </button>
        <label className="sheet-style-picker sheet-style-picker-toolbar">
          <select className="sheet-style-select" value={sheetStyle} onChange={(event) => onSheetStyleChange(event.target.value as SheetStyle)} aria-label={t("toolbar.sheetStyle")} data-testid="sheet-style-select">
            {sheetStyleOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="toolbar-action ghost" onClick={onResetDocument}>
          {t("toolbar.newDocument")}
        </button>
        <div className="profile-switcher" title={t("profile.switcherHint")}>
          <select
            className="profile-switcher-select"
            value={activeProfileId ?? ""}
            onChange={(event) => handleSwitcherChange(event.target.value)}
            aria-label={t("profile.switcherHint")}
          >
            <option value="">{t("profile.noProfile")}</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
            <option value="__create__">+ {t("profile.createProfile")}</option>
          </select>
          <span className={`profile-switcher-badge ${initials ? "profile-switcher-badge-active" : ""}`} aria-hidden="true">
            {initials ?? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z" />
                <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

type GuidedBlockModalProps = {
  t: WorkbookTranslator;
  modalState: ModalState;
  blockTitles: Parameters<typeof getBlockTitle>[1];
  renderModalFields: (block: MathBlock) => ReactNode;
  onClose: () => void;
  onApply: () => void;
};

export function GuidedBlockModal({t, modalState, blockTitles, renderModalFields, onClose, onApply}: GuidedBlockModalProps) {
  if (!modalState) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="block-modal" role="dialog" aria-modal="true" aria-labelledby="block-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="block-modal-head">
          <div>
            <p className="card-kind">{t("modal.guidedBlock")}</p>
            <h2 id="block-modal-title">{getBlockTitle(modalState.block, blockTitles)}</h2>
            <p className="toolbar-helper">{t("modal.guidedBlockHelper")}</p>
          </div>
          <div className="card-actions">
            <button type="button" className="small-action" onClick={onClose}>
              {t("modal.cancel")}
            </button>
            <button type="button" className="small-action primary-inline-action" onClick={onApply}>
              {modalState.mode === "insert" ? t("modal.insert") : t("modal.save")}
            </button>
          </div>
        </div>

        {renderModalFields(modalState.block)}

        <div className="block-modal-preview">
          <section className="export-math-block">
            <div className="export-math-head">
              <span>{t("modal.preview")}</span>
            </div>
            {renderMathPreview(modalState.block)}
          </section>
        </div>
      </section>
    </div>
  );
}

type GraduatedLineModalProps = {
  t: WorkbookTranslator;
  graduatedLineModalState: GraduatedLineModalState;
  graduatedLineModalSettings: GraduatedLineModalSettings;
  onClose: () => void;
  onConfirm: () => void;
  onStartValueChange: (value: string) => void;
  onSectionsChange: (value: string) => void;
  onSelectPreset: (sections: number) => void;
  renderPreview: (startValue: string, sections: string) => ReactNode;
};

export function GraduatedLineModal({
  t,
  graduatedLineModalState,
  graduatedLineModalSettings,
  onClose,
  onConfirm,
  onStartValueChange,
  onSectionsChange,
  onSelectPreset,
  renderPreview
}: GraduatedLineModalProps) {
  if (!graduatedLineModalState) {
    return null;
  }

  const startValue = graduatedLineModalSettings?.startValue ?? graduatedLineModalState.startValue;
  const sections = graduatedLineModalSettings?.sections ?? graduatedLineModalState.sections;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="block-modal graduated-line-modal" role="dialog" aria-modal="true" aria-labelledby="graduated-line-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="block-modal-head">
          <div>
            <p className="card-kind">{t("modal.graduatedLine")}</p>
            <h2 id="graduated-line-modal-title">{t("modal.graduatedLine")}</h2>
            <p className="toolbar-helper">{t("modal.graduatedLineHelper")}</p>
          </div>
          <div className="card-actions">
            <button type="button" className="small-action" onClick={onClose}>
              {t("modal.cancel")}
            </button>
            <button type="button" className="small-action primary-inline-action" onClick={onConfirm}>
              {t("modal.insert")}
            </button>
          </div>
        </div>

        <div className="math-editor-grid graduated-line-modal-grid">
          <label className="wide-field">
            <span>{t("modalFields.startAt")}</span>
            <input type="text" inputMode="numeric" value={startValue} onChange={(event) => onStartValueChange(event.target.value)} placeholder="0" />
          </label>
          <label className="wide-field">
            <span>{t("modalFields.sections")}</span>
            <input type="text" inputMode="numeric" value={sections} onChange={(event) => onSectionsChange(event.target.value)} placeholder="10" />
          </label>
          <div className="graduated-line-preset-row" aria-label={t("modal.graduatedLinePresets")}>
            {GRADUATED_LINE_PRESET_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                className={`chip-button chip-button-compact graduated-line-preset-button ${sections === String(value) ? "graduated-line-preset-button-active" : ""}`}
                onClick={() => onSelectPreset(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="block-modal-preview graduated-line-modal-preview">
          <section className="export-math-block">
            <div className="export-math-head">
              <span>{t("modal.preview")}</span>
            </div>
            {renderPreview(startValue, sections)}
          </section>
        </div>
      </section>
    </div>
  );
}

type ConfirmResetModalProps = {
  t: WorkbookTranslator;
  confirmResetState: ConfirmResetState;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmResetModal({t, confirmResetState, onClose, onConfirm}: ConfirmResetModalProps) {
  if (!confirmResetState) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="block-modal" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="block-modal-head">
          <div>
            <p className="card-kind">{t("modal.confirmation")}</p>
            <h2 id="reset-modal-title">{t("modal.createNewDocument")}</h2>
            <p className="toolbar-helper">{t("modal.createNewDocumentHelper")}</p>
          </div>
          <div className="card-actions">
            <button type="button" className="small-action" onClick={onClose}>
              {t("modal.cancel")}
            </button>
            <button type="button" className="small-action primary-inline-action" onClick={onConfirm}>
              {t("modal.confirmNew")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

type InteractiveMathPreviewProps = {
  block: MathBlock;
  onBeginBlockEditing: (blockId: string, field: string) => void;
};

function PreviewButton({
  blockId,
  field,
  className,
  content,
  onActivate,
  onBeginBlockEditing
}: {
  blockId: string;
  field: string;
  className: string;
  content: ReactNode;
  onActivate?: () => void;
  onBeginBlockEditing: (blockId: string, field: string) => void;
}) {
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

        onBeginBlockEditing(blockId, field);
      }}
    >
      {content}
    </button>
  );
}

function InteractiveColumnArithmeticPreview({
  block,
  onBeginBlockEditing
}: {
  block: AdditionBlock | SubtractionBlock | MultiplicationBlock;
  onBeginBlockEditing: (blockId: string, field: string) => void;
}) {
  const columns = getColumnArithmeticColumns(block);
  const operator = getArithmeticOperator(block);
  const renderCarryPreview = (line: ArithmeticLineField) => {
    const carryCells = getArithmeticCarryCells(block, line);
    const carryField = getCarryFieldForArithmeticLine(line);
    const activeOffset = getLastFilledArithmeticCarryOffset(carryCells);

    if (!hasArithmeticCarryCells(carryCells)) {
      return null;
    }

    return (
      <div className="addition-line addition-line-carry">
        <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
        <PreviewButton
          blockId={block.id}
          field={carryField}
          className="addition-row-button"
          onBeginBlockEditing={onBeginBlockEditing}
          onActivate={() => onBeginBlockEditing(block.id, activeOffset === null ? carryField : `${carryField}:${activeOffset}`)}
          content={renderArithmeticCarryRow(carryCells, columns, "addition-row addition-carry-row addition-row-preview", undefined, {
            field: carryField,
            struckCells: block.struckCells
          })}
        />
      </div>
    );
  };

  const topCarryOverlay = renderCarryPreview("top");
  const bottomCarryOverlay = renderCarryPreview("bottom");
  const resultCarryOverlay = renderCarryPreview("result");

  return (
    <div className="math-layout addition-layout">
      <div className="addition-preview addition-preview-compact">
        <div className={`addition-line-stack ${topCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
          {topCarryOverlay ? <div className="addition-line-carry-overlay">{topCarryOverlay}</div> : null}
          <div className="addition-line">
            <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
            <PreviewButton
              blockId={block.id}
              field="top"
              className="addition-row-button"
              onBeginBlockEditing={onBeginBlockEditing}
              content={renderDivisionCellRow(block.top, columns, "addition-row addition-row-preview", "start", undefined, {field: "top", struckCells: block.struckCells})}
            />
          </div>
        </div>
        <div className={`addition-line-stack ${bottomCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
          {bottomCarryOverlay ? <div className="addition-line-carry-overlay">{bottomCarryOverlay}</div> : null}
          <div className="addition-line">
            <span className="addition-sign">{operator}</span>
            <PreviewButton
              blockId={block.id}
              field="bottom"
              className="addition-row-button"
              onBeginBlockEditing={onBeginBlockEditing}
              content={renderDivisionCellRow(block.bottom, columns, "addition-row addition-row-operation addition-row-preview", "start", undefined, {field: "bottom", struckCells: block.struckCells})}
            />
          </div>
        </div>
        <div className={`addition-line-stack ${resultCarryOverlay ? "addition-line-stack-with-carry" : ""}`}>
          {resultCarryOverlay ? <div className="addition-line-carry-overlay">{resultCarryOverlay}</div> : null}
          <div className="addition-line">
            <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
            <PreviewButton
              blockId={block.id}
              field="result"
              className="addition-row-button"
              onBeginBlockEditing={onBeginBlockEditing}
              content={renderDivisionCellRow(block.result, columns, "addition-row addition-row-result addition-row-preview", "start", undefined, {field: "result", struckCells: block.struckCells})}
            />
          </div>
        </div>
      </div>
      {block.caption ? <p className="math-caption">{block.caption}</p> : null}
    </div>
  );
}

export function InteractiveMathPreview({block, onBeginBlockEditing}: InteractiveMathPreviewProps) {
  if (block.type === "fraction") {
    return (
      <div className="math-layout fraction-layout">
        <div className="fraction-preview">
          <PreviewButton blockId={block.id} field="numerator" className="fraction-line top" onBeginBlockEditing={onBeginBlockEditing} content={block.numerator || "numérateur"} />
          <div className="fraction-bar" />
          <PreviewButton blockId={block.id} field="denominator" className="fraction-line" onBeginBlockEditing={onBeginBlockEditing} content={block.denominator || "dénominateur"} />
        </div>
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  if (isColumnArithmeticBlock(block)) {
    return <InteractiveColumnArithmeticPreview block={block} onBeginBlockEditing={onBeginBlockEditing} />;
  }

  if (block.type === "division") {
    const leftColumns = getDivisionLeftColumns(block);
    const divisorColumns = getDivisionDivisorColumns(block);
    const quotientColumns = getDivisionQuotientColumns(block);
    const workLines = getDivisionVisibleWorkLines(block.work, block.quotient);

    return (
      <div className="math-layout division-layout">
        <div className="division-preview division-preview-compact">
          <div className="division-left-column division-left-column-compact">
            <div className="division-work-line division-work-line-head">
              <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />
              <PreviewButton
                blockId={block.id}
                field="dividend"
                className="division-row-button"
                onBeginBlockEditing={onBeginBlockEditing}
                content={renderDivisionCellRow(block.dividend, leftColumns, "division-dividend division-row-preview", "start", undefined, {field: "dividend", struckCells: block.struckCells})}
              />
            </div>
            <div className="division-work-grid division-work-grid-compact">
              {workLines.map((line, index) => {
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
                    <PreviewButton
                      blockId={block.id}
                      field={`work:${index}`}
                      className="division-row-button"
                      onBeginBlockEditing={onBeginBlockEditing}
                      content={renderDivisionCellRow(line, leftColumns, "division-workpad division-row-preview", "start", undefined, {field: `work:${index}`, struckCells: block.struckCells})}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="division-right-column">
            <PreviewButton
              blockId={block.id}
              field="divisor"
              className="division-row-button"
              onBeginBlockEditing={onBeginBlockEditing}
              content={renderDivisionCellRow(block.divisor, divisorColumns, "division-divisor division-row-preview", "start", undefined, {field: "divisor", struckCells: block.struckCells})}
            />
            <PreviewButton
              blockId={block.id}
              field="quotient"
              className="division-row-button"
              onBeginBlockEditing={onBeginBlockEditing}
              content={renderDivisionCellRow(block.quotient, quotientColumns, "division-quotient division-row-preview", "start", undefined, {field: "quotient", struckCells: block.struckCells})}
            />
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
          <PreviewButton blockId={block.id} field="base" className="power-preview-main" onBeginBlockEditing={onBeginBlockEditing} content={block.base || "base"} />
          <sup>
            <PreviewButton blockId={block.id} field="exponent" className="power-preview-exponent" onBeginBlockEditing={onBeginBlockEditing} content={block.exponent || "exposant"} />
          </sup>
        </p>
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  return (
    <div className="math-layout root-layout">
      <div className="root-preview">
        <span className="root-symbol">√</span>
        <PreviewButton blockId={block.id} field="radicand" className="root-radicand" onBeginBlockEditing={onBeginBlockEditing} content={block.radicand || "radicande"} />
      </div>
      {block.caption ? <p className="math-caption">{block.caption}</p> : null}
    </div>
  );
}

type SelectionMenuProps = {
  t: WorkbookTranslator;
  position: {x: number; y: number; placement: "above" | "below"} | null;
  onAlign: () => void;
  onDelete: () => void;
};

export function SelectionMenu({t, position, onAlign, onDelete}: SelectionMenuProps) {
  if (!position) {
    return null;
  }

  return (
    <div
      className="canvas-quick-menu canvas-selection-menu"
      style={{left: `${position.x}px`, top: `${position.y}px`}}
      data-placement={position.placement}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button type="button" className="canvas-quick-action canvas-selection-action" aria-label={t("canvas.align")} title={t("canvas.align")} onClick={onAlign}>
        <span className="align-grid-icon" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
      </button>
      <button type="button" className="canvas-quick-action canvas-selection-action" aria-label={t("toolbar.delete")} title={t("toolbar.delete")} onClick={onDelete}>
        ×
      </button>
    </div>
  );
}

type GeometrySettingsMenuProps = {
  t: WorkbookTranslator;
  menuRef: ((node: HTMLDivElement | null) => void) | RefObject<HTMLDivElement | null>;
  position: {x: number; y: number; placement: "above" | "below"} | null;
  selectedGeometry: GeometryShape | null;
  selectedGraduatedLineSettings: {startValue: string; sections: string} | null;
  onClose: () => void;
  onPointLabelChange: (value: string) => void;
  onSegmentLengthChange: (value: string) => void;
  onCircleRadiusChange: (value: string) => void;
  onGraduatedLineStartValueChange: (value: string) => void;
  onGraduatedLineSectionsChange: (value: string) => void;
};

export function GeometrySettingsMenu({
  t,
  menuRef,
  position,
  selectedGeometry,
  selectedGraduatedLineSettings,
  onClose,
  onPointLabelChange,
  onSegmentLengthChange,
  onCircleRadiusChange,
  onGraduatedLineStartValueChange,
  onGraduatedLineSectionsChange
}: GeometrySettingsMenuProps) {
  if (!selectedGeometry || !position) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="canvas-quick-menu canvas-geometry-settings-menu"
      style={{left: `${position.x}px`, top: `${position.y}px`}}
      data-placement={position.placement}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button type="button" className="canvas-quick-close" aria-label={t("canvas.closeSettings")} title={t("canvas.closeSettings")} onClick={onClose}>
        ×
      </button>
      <p className="geometry-settings-title">{t("canvas.settings")}</p>
      {selectedGeometry.kind === "point" ? (
        <label className="geometry-settings-field">
          <span>{t("canvas.pointName")}</span>
          <input type="text" value={selectedGeometry.label} placeholder="A" onChange={(event) => onPointLabelChange(event.target.value.toUpperCase().slice(0, 4))} />
        </label>
      ) : null}
      {selectedGeometry.kind === "segment" ? (
        <label className="geometry-settings-field">
          <span>{t("canvas.segmentLength")}</span>
          <input
            type="number"
            min="1"
            step="1"
            value={Math.round(Math.hypot(selectedGeometry.bxMm - selectedGeometry.axMm, selectedGeometry.byMm - selectedGeometry.ayMm))}
            onChange={(event) => onSegmentLengthChange(event.target.value)}
          />
        </label>
      ) : null}
      {selectedGeometry.kind === "circle" ? (
        <label className="geometry-settings-field">
          <span>{t("canvas.circleRadius")}</span>
          <input type="number" min="1" step="1" value={Math.round(selectedGeometry.radiusMm)} onChange={(event) => onCircleRadiusChange(event.target.value)} />
        </label>
      ) : null}
      {selectedGeometry.kind === "graduated-line" ? (
        <label className="geometry-settings-field">
          <span>{t("modalFields.startAt")}</span>
          <input
            type="text"
            inputMode="numeric"
            value={selectedGraduatedLineSettings?.startValue ?? String(selectedGeometry.startValue ?? 0)}
            onChange={(event) => onGraduatedLineStartValueChange(event.target.value.replace(/[^0-9-]/g, ""))}
            placeholder="0"
          />
        </label>
      ) : null}
      {selectedGeometry.kind === "graduated-line" ? (
        <label className="geometry-settings-field">
          <span>{t("modalFields.sections")}</span>
          <input
            type="text"
            inputMode="numeric"
            value={selectedGraduatedLineSettings?.sections ?? String(selectedGeometry.sections ?? 10)}
            onChange={(event) => onGraduatedLineSectionsChange(event.target.value.replace(/[^0-9]/g, ""))}
          />
        </label>
      ) : null}
    </div>
  );
}

type TextFormatMenuProps = {
  t: WorkbookTranslator;
  menuRef: ((node: HTMLDivElement | null) => void) | RefObject<HTMLDivElement | null>;
  position: {x: number; y: number; placement: "above" | "below"} | null;
  colorOptions: Array<{ id: string; label: string; value: string }>;
  activeColor: string;
  highlightOptions: HighlightOption[];
  selectedHighlightColor: string | null;
  selectedFontWeight: number;
  selectedFontStyle: "normal" | "italic";
  selectedUnderline: boolean;
  onClose: () => void;
  onApplyColor: (color: string) => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onSizeChange: (direction: "down" | "up") => void;
  onHighlight: (color: string) => void;
};

export function TextFormatMenu({
  t,
  menuRef,
  position,
  colorOptions,
  activeColor,
  highlightOptions,
  selectedHighlightColor,
  selectedFontWeight,
  selectedFontStyle,
  selectedUnderline,
  onClose,
  onApplyColor,
  onBold,
  onItalic,
  onUnderline,
  onSizeChange,
  onHighlight
}: TextFormatMenuProps) {
  if (!position) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="canvas-quick-menu canvas-text-format-menu"
      style={{left: `${position.x}px`, top: `${position.y}px`}}
      data-placement={position.placement}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="canvas-format-row">
        <span className="toolbar-color-icon" title={t("toolbar.textColor")} aria-label={t("toolbar.textColor")}>
          <span className="toolbar-color-icon-letter" aria-hidden="true">A</span>
          <span className="toolbar-color-icon-bar" style={{backgroundColor: activeColor}} aria-hidden="true" />
        </span>
        {colorOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`canvas-quick-action canvas-text-color-chip ${activeColor === option.value ? "canvas-text-color-chip-active" : ""}`}
            style={{"--swatch-color": option.value} as ReactCSSProperties}
            aria-label={option.label}
            title={option.label}
            onClick={() => onApplyColor(option.value)}
          >
            <span className="canvas-text-color-sample" style={{backgroundColor: option.value}} />
          </button>
        ))}
        <button type="button" className="canvas-quick-close" aria-label={t("canvas.closeMenu")} title={t("canvas.closeMenu")} onClick={onClose}>
          ×
        </button>
      </div>

      <div className="canvas-format-row">
        <span className="toolbar-color-icon" title={t("toolbar.backgroundColor")} aria-label={t("toolbar.backgroundColor")}>
          <svg viewBox="0 0 16 14" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <rect x="1" y="1" width="14" height="12" rx="2" />
            <rect x="3" y="3" width="10" height="8" rx="1" fill={selectedHighlightColor ?? "none"} stroke={selectedHighlightColor ? "none" : "currentColor"} strokeWidth="0.8" strokeDasharray="2 1.2" />
          </svg>
        </span>
        <button
          type="button"
          className={`canvas-quick-action canvas-text-highlight-chip ${!selectedHighlightColor ? "canvas-text-highlight-chip-active" : ""}`}
          title={t("toolbar.noBackground")}
          aria-label={t("toolbar.noBackground")}
          onClick={() => onHighlight("")}
        >∅</button>
        {highlightOptions.filter((option) => option.value).map((option) => (
          <button
            key={option.id}
            type="button"
            className={`canvas-quick-action canvas-text-highlight-chip ${(option.value || null) === selectedHighlightColor ? "canvas-text-highlight-chip-active" : ""}`}
            aria-label={t("canvas.highlightColor", {color: option.label})}
            title={t("canvas.highlightColor", {color: option.label})}
            onClick={() => onHighlight((option.value || null) === selectedHighlightColor ? "" : option.value)}
          >
            <span className="canvas-text-highlight-sample" style={{backgroundColor: option.value}} />
          </button>
        ))}
      </div>

      <div className="canvas-format-row">
        <button type="button" className={`canvas-quick-action canvas-text-format-action${selectedFontWeight >= 700 ? " canvas-text-format-action-active" : ""}`} aria-label={t("toolbar.bold")} title={t("toolbar.bold")} onClick={onBold}>
          B
        </button>
        <button type="button" className={`canvas-quick-action canvas-text-format-action${selectedFontStyle === "italic" ? " canvas-text-format-action-active" : ""}`} aria-label={t("toolbar.italic")} title={t("toolbar.italic")} onClick={onItalic}>
          I
        </button>
        <button type="button" className={`canvas-quick-action canvas-text-format-action${selectedUnderline ? " canvas-text-format-action-active" : ""}`} aria-label={t("toolbar.underline")} title={t("toolbar.underline")} onClick={onUnderline}>
          <span style={{textDecoration: "underline"}}>U</span>
        </button>
        <button type="button" className="canvas-quick-action canvas-text-format-action" aria-label={t("toolbar.decrease")} title={t("toolbar.decrease")} onClick={() => onSizeChange("down")}>
          A-
        </button>
        <button type="button" className="canvas-quick-action canvas-text-format-action" aria-label={t("toolbar.increase")} title={t("toolbar.increase")} onClick={() => onSizeChange("up")}>
          A+
        </button>
      </div>
    </div>
  );
}

type CanvasQuickInsertMenuProps = {
  t: WorkbookTranslator;
  menu: NonNullable<CanvasQuickMenu>;
  structuredTools: StructuredToolOption[];
  inlineShortcuts: InlineShortcutItem[];
  onClose: () => void;
  onCreateText: () => void;
  onCreateStructured: (toolId: StructuredTool) => void;
  onCreateShortcut: (shortcutId: string) => void;
};

export function CanvasQuickInsertMenu({
  t,
  menu,
  structuredTools,
  inlineShortcuts,
  onClose,
  onCreateText,
  onCreateStructured,
  onCreateShortcut
}: CanvasQuickInsertMenuProps) {
  return (
    <>
      <div className="canvas-quick-anchor" style={{left: `${menu.clickX}px`, top: `${menu.clickY}px`}} aria-hidden="true" />
      <div className="canvas-quick-menu" style={{left: menu.left != null ? `${menu.left}px` : undefined, right: menu.right != null ? `${menu.right}px` : undefined, top: menu.top != null ? `${menu.top}px` : undefined, bottom: menu.bottom != null ? `${menu.bottom}px` : undefined}} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="canvas-quick-close" aria-label={t("canvas.closeMenu")} title={t("canvas.closeMenu")} onClick={onClose}>
          ×
        </button>
        <button type="button" className="canvas-quick-action" onClick={onCreateText}>
          T
        </button>
        {structuredTools.map((tool) => (
          <button key={`quick-${tool.id}`} type="button" className="canvas-quick-action" title={tool.label} onClick={() => onCreateStructured(tool.id)}>
            {renderStructuredToolGlyph(tool.id)}
          </button>
        ))}
        {inlineShortcuts.slice(0, 6).map((shortcut) => (
          <button key={`quick-symbol-${shortcut.id}`} type="button" className="canvas-quick-action" title={shortcut.hint} onClick={() => onCreateShortcut(shortcut.id)}>
            {renderShortcutGlyph(shortcut)}
          </button>
        ))}
      </div>
    </>
  );
}

type SelectionRectOverlayProps = {
  selectionRect: NonNullable<SelectionRect>;
};

export function SelectionRectOverlay({selectionRect}: SelectionRectOverlayProps) {
  return (
    <div
      className="canvas-selection-rect"
      style={{
        left: `${Math.min(selectionRect.originX, selectionRect.currentX)}px`,
        top: `${Math.min(selectionRect.originY, selectionRect.currentY)}px`,
        width: `${Math.abs(selectionRect.currentX - selectionRect.originX)}px`,
        height: `${Math.abs(selectionRect.currentY - selectionRect.originY)}px`
      }}
    />
  );
}

type ProfileModalProps = {
  t: WorkbookTranslator;
  mode: "create" | "edit" | null;
  profile: UserProfile | null;
  sheetStyleOptions: SheetStyleOption[];
  onSave: (data: Omit<UserProfile, "id">) => void;
  onClose: () => void;
};

export function ProfileModal({ t, mode, profile, sheetStyleOptions, onSave, onClose }: ProfileModalProps) {
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [className, setClassName] = useState(profile?.className ?? "");
  const [sheetStyle, setSheetStyle] = useState<SheetStyle>(profile?.preferredSheetStyle ?? "seyes");
  const [studyMode, setStudyMode] = useState<StudyMode>(profile?.preferredMode ?? "middleSchool");
  const [showName, setShowName] = useState(profile?.showName ?? true);
  const [showClass, setShowClass] = useState(profile?.showClass ?? true);
  const [showDate, setShowDate] = useState(profile?.showDate ?? true);
  const [highlightOnHover, setHighlightOnHover] = useState(profile?.highlightOnHover ?? true);

  if (!mode) {
    return null;
  }

  function handleSubmit() {
    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      className: className.trim(),
      preferredSheetStyle: sheetStyle,
      preferredMode: studyMode,
      showName,
      showClass,
      showDate,
      highlightOnHover
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="block-modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="block-modal-head">
          <div>
            <h2 id="profile-modal-title">{mode === "create" ? t("profile.createProfile") : t("profile.editProfile")}</h2>
          </div>
          <div className="card-actions">
            <button type="button" className="small-action" onClick={onClose}>
              {t("profile.cancel")}
            </button>
            <button type="button" className="small-action primary-inline-action" disabled={!firstName.trim() || !lastName.trim()} onClick={handleSubmit}>
              {t("profile.save")}
            </button>
          </div>
        </div>
        <div className="profile-modal-fields">
          <label className="profile-modal-field">
            <span>{t("profile.firstName")}</span>
            <input type="text" className="profile-modal-input" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </label>
          <label className="profile-modal-field">
            <span>{t("profile.lastName")}</span>
            <input type="text" className="profile-modal-input" value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </label>
          <label className="profile-modal-field">
            <span>{t("profile.className")}</span>
            <input type="text" className="profile-modal-input" value={className} onChange={(event) => setClassName(event.target.value)} />
          </label>
          <label className="profile-modal-field">
            <span>{t("profile.preferredSheetStyle")}</span>
            <select className="sheet-style-select" value={sheetStyle} onChange={(event) => setSheetStyle(event.target.value as SheetStyle)}>
              {sheetStyleOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="profile-modal-field">
            <span>{t("profile.preferredMode")}</span>
            <select className="sheet-style-select" value={studyMode} onChange={(event) => setStudyMode(event.target.value as StudyMode)}>
              <option value="middleSchool">{t("profile.middleSchool")}</option>
              <option value="highSchool">{t("profile.highSchool")}</option>
            </select>
          </label>
          <fieldset className="profile-modal-fieldset">
            <legend>{t("profile.visibleFields")}</legend>
            <label className="profile-modal-checkbox">
              <input type="checkbox" checked={showName} onChange={(event) => setShowName(event.target.checked)} />
              <span>{t("profile.showName")}</span>
            </label>
            <label className="profile-modal-checkbox">
              <input type="checkbox" checked={showClass} onChange={(event) => setShowClass(event.target.checked)} />
              <span>{t("profile.showClass")}</span>
            </label>
            <label className="profile-modal-checkbox">
              <input type="checkbox" checked={showDate} onChange={(event) => setShowDate(event.target.checked)} />
              <span>{t("profile.showDate")}</span>
            </label>
          </fieldset>
          <label className="profile-modal-checkbox">
            <input type="checkbox" checked={highlightOnHover} onChange={(event) => setHighlightOnHover(event.target.checked)} />
            <span>{t("profile.highlightOnHover")}</span>
          </label>
        </div>
      </section>
    </div>
  );
}
