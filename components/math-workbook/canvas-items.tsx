import {useRef} from "react";
import type {CSSProperties as ReactCSSProperties, MouseEvent as ReactMouseEvent, ReactNode, TouchEvent as ReactTouchEvent} from "react";
import {InteractiveMathPreview} from "@/components/math-workbook/presentational";
import {DEFAULT_INTEGRAL_SYMBOL_SIZE, DEFAULT_SUM_SYMBOL_SIZE, renderIntegralSymbolSvg, renderShortcutGlyph, renderSumSymbolSvg} from "@/components/math-workbook/shared";
import type {FloatingSymbol, FloatingTextBox, MathBlock, WorkbookTranslator} from "@/components/math-workbook/shared";

const SCRIPT_CHARS: Record<string, string> = { x: "\u{1D4CD}", y: "\u{1D4CE}", z: "\u{1D4CF}" };
const DOUBLE_TAP_DELAY = 400;

type TextShortcutItem = {
  id: string;
  label: string;
  hint: string;
  content: string;
};

type FloatingMathBlockItemProps = {
  block: MathBlock;
  isSelected: boolean;
  isEditing: boolean;
  renderInlineBlockEditor: (block: MathBlock) => ReactNode;
  setNodeRef: (node: HTMLElement | null) => void;
  onDragStart: (event: ReactMouseEvent<HTMLElement>) => void;
  onTouchDragStart: (event: ReactTouchEvent<HTMLElement>) => void;
  onDoubleClick: () => void;
  onBeginBlockEditing: (blockId: string, field: string) => void;
};

export function FloatingMathBlockItem({
  block,
  isSelected,
  isEditing,
  renderInlineBlockEditor,
  setNodeRef,
  onDragStart,
  onTouchDragStart,
  onDoubleClick,
  onBeginBlockEditing
}: FloatingMathBlockItemProps) {
  return (
    <article
      ref={setNodeRef}
      className={`floating-math-block ${isSelected ? "floating-math-block-selected" : ""}`}
      data-testid={`floating-math-block-${block.type}`}
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
      onMouseDown={onDragStart}
      onTouchStart={onTouchDragStart}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onDoubleClick();
      }}
    >
      {isEditing ? renderInlineBlockEditor(block) : <InteractiveMathPreview block={block} onBeginBlockEditing={onBeginBlockEditing} />}
    </article>
  );
}

type FloatingMathSymbolItemProps = {
  symbol: FloatingSymbol;
  isSelected: boolean;
  setNodeRef: (node: HTMLButtonElement | null) => void;
  onDragStart: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onTouchDragStart: (event: ReactTouchEvent<HTMLButtonElement>) => void;
  onResizeStart: (handle: "nw" | "se", clientX: number, clientY: number) => void;
};

export function FloatingMathSymbolItem({
  symbol,
  isSelected,
  setNodeRef,
  onDragStart,
  onTouchDragStart,
  onResizeStart
}: FloatingMathSymbolItemProps) {
  const isVectorSymbol = symbol.kind === "sum" || symbol.kind === "integral";
  const symbolSize = Math.max(24, Math.round(symbol.size ?? (symbol.kind === "integral" ? DEFAULT_INTEGRAL_SYMBOL_SIZE : DEFAULT_SUM_SYMBOL_SIZE)));

  return (
    <button
      type="button"
      ref={setNodeRef}
      className={`floating-math-symbol ${isVectorSymbol ? "floating-math-symbol-sum" : ""} ${symbol.kind === "integral" ? "floating-math-symbol-integral" : ""} ${isSelected ? "floating-math-symbol-selected" : ""}`}
      data-testid={`floating-math-symbol-${symbol.kind}`}
      style={{
        left: `${symbol.x}px`,
        top: `${symbol.y}px`,
        width: isVectorSymbol ? `${symbolSize}px` : undefined,
        height: isVectorSymbol ? `${symbolSize}px` : undefined,
        color: symbol.color,
        fontSize: isVectorSymbol ? undefined : `${symbol.fontSize}rem`,
        fontWeight: symbol.fontWeight,
        fontStyle: symbol.fontStyle,
        textDecoration: symbol.underline ? "underline" : "none",
        backgroundColor: symbol.highlightColor ?? undefined
      }}
      onMouseDown={onDragStart}
      onTouchStart={onTouchDragStart}
    >
      {isVectorSymbol ? (
        <>
          <span className={`floating-math-symbol-sum-vector ${symbol.kind === "integral" ? "floating-math-symbol-integral-vector" : ""}`} aria-hidden="true">
            {symbol.kind === "integral" ? renderIntegralSymbolSvg(symbolSize) : renderSumSymbolSvg(symbolSize)}
          </span>
          {isSelected ? (
            <>
              <span
                className="floating-math-symbol-resize-handle floating-math-symbol-resize-handle-nw"
                aria-hidden="true"
                onMouseDownCapture={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onResizeStart("nw", event.clientX, event.clientY);
                }}
                onTouchStartCapture={(event) => {
                  const touch = event.touches[0];

                  if (!touch) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  onResizeStart("nw", touch.clientX, touch.clientY);
                }}
              />
              <span
                className="floating-math-symbol-resize-handle floating-math-symbol-resize-handle-se"
                aria-hidden="true"
                onMouseDownCapture={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onResizeStart("se", event.clientX, event.clientY);
                }}
                onTouchStartCapture={(event) => {
                  const touch = event.touches[0];

                  if (!touch) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  onResizeStart("se", touch.clientX, touch.clientY);
                }}
              />
            </>
          ) : null}
        </>
      ) : (
        symbol.content
      )}
    </button>
  );
}

type FloatingTextBoxItemProps = {
  textBox: FloatingTextBox;
  t: WorkbookTranslator;
  isSelected: boolean;
  isEditing: boolean;
  shortcuts: TextShortcutItem[];
  setNodeRef: (node: HTMLElement | null) => void;
  getShortcutLayout: (textBoxId: string) => {className: string; style: ReactCSSProperties};
  onDragStart: (event: ReactMouseEvent<HTMLElement>) => void;
  onTouchDragStart: (event: ReactTouchEvent<HTMLElement>) => void;
  onDoubleClick: () => void;
  onMouseDownInput: () => void;
  onFocusInput: () => void;
  onTextChange: (nextText: string) => void;
  onSubmit: () => void;
  onBlurInput: (value: string) => void;
  onInsertShortcut: (content: string) => void;
};

export function FloatingTextBoxItem({
  textBox,
  t,
  isSelected,
  isEditing,
  shortcuts,
  setNodeRef,
  getShortcutLayout,
  onDragStart,
  onTouchDragStart,
  onDoubleClick,
  onMouseDownInput,
  onFocusInput,
  onTextChange,
  onSubmit,
  onBlurInput,
  onInsertShortcut
}: FloatingTextBoxItemProps) {
  const isAngleTextBox = textBox.notation === "angle";
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null);

  return (
    <article
      ref={setNodeRef}
      suppressHydrationWarning
      className={`floating-text-box ${textBox.variant === "note" ? "floating-text-box-note" : ""} ${isSelected ? "floating-text-box-selected" : ""}`}
      data-testid={`floating-text-box-${textBox.variant}`}
      style={{
        left: `${textBox.x}px`,
        top: `${textBox.y}px`,
        width: `${textBox.width}px`,
        zIndex: isEditing ? 9 : undefined,
        color: textBox.color,
        fontSize: `${textBox.fontSize}rem`,
        fontWeight: textBox.fontWeight,
        fontStyle: textBox.fontStyle,
        textDecoration: textBox.underline ? "underline" : "none",
        backgroundColor: textBox.highlightColor ?? undefined
      }}
      onMouseDown={(event) => {
        if (isEditing) {
          return;
        }

        onDragStart(event);
      }}
      onTouchStart={(event) => onTouchDragStart(event)}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onDoubleClick();
      }}
    >
      {isEditing ? (
        (() => {
          const shortcutLayout = getShortcutLayout(textBox.id);
          return (
            <>
              <div className={`floating-text-shortcuts ${shortcutLayout.className}`} style={shortcutLayout.style} onMouseDown={(event) => event.stopPropagation()}>
                {shortcuts.map((shortcut) => (
                  <button
                    key={shortcut.id}
                    type="button"
                    className="floating-text-shortcut"
                    title={shortcut.hint}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onInsertShortcut(shortcut.content)}
                  >
                    {renderShortcutGlyph(shortcut)}
                  </button>
                ))}
              </div>
              <div className={isAngleTextBox ? "floating-text-angle-prefix" : ""}>
                {isAngleTextBox ? <span className="floating-text-angle-marker" aria-hidden="true">∠</span> : null}
                <textarea
                  className="floating-text-input"
                  value={textBox.text}
                  placeholder={t("canvas.writeHere")}
                  rows={1}
                  ref={(el) => {
                    if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }
                  }}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    onMouseDownInput();
                  }}
                  onFocus={onFocusInput}
                  onChange={(event) => {
                    const el = event.target;
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                    onTextChange(el.value || "");
                  }}
                  onKeyDown={(event) => {
                    if (!event.repeat && event.key in SCRIPT_CHARS) {
                      const now = Date.now();
                      const last = lastKeyRef.current;
                      if (last && last.key === event.key && now - last.time < DOUBLE_TAP_DELAY) {
                        event.preventDefault();
                        const ta = event.currentTarget;
                        const pos = ta.selectionStart ?? ta.value.length;
                        const scriptChar = SCRIPT_CHARS[event.key];
                        const newValue = ta.value.slice(0, Math.max(0, pos - 1)) + scriptChar + ta.value.slice(pos);
                        onTextChange(newValue);
                        const newPos = Math.max(0, pos - 1) + scriptChar.length;
                        requestAnimationFrame(() => { ta.setSelectionRange(newPos, newPos); });
                        lastKeyRef.current = null;
                        return;
                      }
                      lastKeyRef.current = { key: event.key, time: now };
                    } else if (!(event.key in SCRIPT_CHARS)) {
                      lastKeyRef.current = null;
                    }

                    if (event.key !== "Enter" || event.shiftKey) {
                      return;
                    }

                    event.preventDefault();
                    onSubmit();
                    event.currentTarget.blur();
                  }}
                  onBlur={(event) => {
                    onBlurInput(event.currentTarget.value);
                  }}
                />
              </div>
            </>
          );
        })()
      ) : isAngleTextBox ? (
        <div className="floating-text-angle-prefix">
          <span className="floating-text-angle-marker" aria-hidden="true">∠</span>
          <div className="floating-text-content">{textBox.text || "ABC"}</div>
        </div>
      ) : (
        <div className="floating-text-content">{textBox.text || t("canvas.emptyTextBox")}</div>
      )}
    </article>
  );
}
