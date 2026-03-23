import type {InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode, TouchEvent as ReactTouchEvent} from "react";
import {
  getAlignedCaretCellIndex,
  getAlignedCellCharacter,
  getArithmeticCarryCell,
  getArithmeticOperator,
  getCarryFieldForArithmeticLine,
  getColumnArithmeticColumns,
  getLastFilledArithmeticCarryOffset,
  hasArithmeticCarryCells,
  hasStruckCell,
  normalizeDivisionDecimalInput,
  renderDivisionCellRow,
  setAlignedCellCharacter,
  type AdditionBlock,
  type ArithmeticCarryField,
  type ArithmeticLineField,
  type MathBlock,
  type MultiplicationBlock,
  type SubtractionBlock
} from "@/components/math-workbook/shared";

type ArithmeticBlock = AdditionBlock | SubtractionBlock | MultiplicationBlock;

type InputBinder = (
  field: string
) => InputHTMLAttributes<HTMLInputElement> & {
  ref: (node: HTMLInputElement | null) => void;
};

type ArithmeticInlineEditorProps = {
  t: (key: string) => string;
  block: ArithmeticBlock;
  currentField: string | null;
  strikeModeBlockId: string | null;
  numericFieldCaretPositions: Record<string, number>;
  activeResultCell: {blockId: string; cellIndex: number} | null;
  bindInlineInput: InputBinder;
  wrapInlineOperationEditor: (blockId: string, content: ReactNode) => ReactNode;
  setInlineInputRef: (blockId: string, field: string, node: HTMLInputElement | null) => void;
  shouldKeepInlineBlockEditing: (blockId: string) => boolean;
  finishBlockEditing: (blockId: string) => void;
  updateInlineBlockField: (blockId: string, key: string, value: string) => void;
  toggleInlineBlockStrikeMode: (blockId: string) => void;
  toggleInlineBlockCellStrike: (blockId: string, field: string, cellIndex: number) => void;
  updateNumericCaretPosition: (key: string, nextPosition: number) => void;
  handleInlineNumericDeleteKey: (blockId: string, field: string, value: string, event: ReactKeyboardEvent<HTMLInputElement>) => boolean;
  activateNumericCellSelection: (blockId: string, field: string, value: string, columns: number, align: "start" | "end", cellIndex: number) => void;
  activateResultCell: (blockId: string, value: string, columns: number, cellIndex: number) => void;
  focusInlineBlockField: (blockId: string, field: string) => void;
  setEditingField: (blockId: string, field: string) => void;
  setArithmeticCarryValue: (blockId: string, field: ArithmeticCarryField, index: number, value: string) => void;
};

export function renderArithmeticInlineEditor({
  t,
  block,
  currentField,
  strikeModeBlockId,
  numericFieldCaretPositions,
  activeResultCell,
  bindInlineInput,
  wrapInlineOperationEditor,
  setInlineInputRef,
  shouldKeepInlineBlockEditing,
  finishBlockEditing,
  updateInlineBlockField,
  toggleInlineBlockStrikeMode,
  toggleInlineBlockCellStrike,
  updateNumericCaretPosition,
  handleInlineNumericDeleteKey,
  activateNumericCellSelection,
  activateResultCell,
  focusInlineBlockField,
  setEditingField,
  setArithmeticCarryValue
}: ArithmeticInlineEditorProps): ReactNode {
  const columns = getColumnArithmeticColumns(block);
  const operator = getArithmeticOperator(block);
  const isStrikeModeActive = strikeModeBlockId === block.id;
  const getCurrentLineTargetIndex = (line: ArithmeticLineField) => {
    const lineValue = block[line];
    const caretKey = `${block.id}:${line}`;
    const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(lineValue).length;
    return getAlignedCaretCellIndex(lineValue, columns, line === "result" ? "start" : "end", caretPosition);
  };
  const activeLine =
    currentField === "top" || currentField?.startsWith("carryTop")
      ? "top"
      : currentField === "bottom" || currentField?.startsWith("carryBottom")
        ? "bottom"
        : currentField === "result" || currentField?.startsWith("carryResult")
          ? "result"
          : null;

  const activateCarryEditing = (field: ArithmeticCarryField, cellIndex: number) => {
    setEditingField(block.id, `${field}:${cellIndex}`);
    focusInlineBlockField(block.id, `${field}:${cellIndex}`);
  };

  const handleBlur = (field: string) => (event: React.FocusEvent<HTMLInputElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget) {
      return;
    }
    setTimeout(() => {
      if (shouldKeepInlineBlockEditing(block.id)) {
        return;
      }
      if (strikeModeBlockId === block.id) {
        return;
      }
      if (currentField === field) {
        finishBlockEditing(block.id);
      }
    }, 0);
  };

  const renderArithmeticNumericField = (field: ArithmeticCarryField | ArithmeticLineField, value: string, displayClassName: string) => {
    if (field === "result") {
      const isActive = currentField === field;
      const activeCellIndex = isActive && activeResultCell?.blockId === block.id ? activeResultCell.cellIndex : null;
      const commitResultCell = (cellIndex: number, nextCharacter: string, move: "stay" | "left" | "right" = "right") => {
        const isOverflowWrite = cellIndex === columns - 1 && nextCharacter.length > 0 && getAlignedCellCharacter(value, columns, "start", cellIndex).trim().length > 0;
        const nextValue = isOverflowWrite
          ? normalizeDivisionDecimalInput(`${value}${nextCharacter}`)
          : setAlignedCellCharacter(value, columns, "start", cellIndex, nextCharacter);
        updateInlineBlockField(block.id, field, nextValue);
        const nextCellIndex = isOverflowWrite
          ? Array.from(nextValue).length - 1
          : move === "right"
            ? Math.min(columns - 1, cellIndex + 1)
            : move === "left"
              ? Math.max(0, cellIndex - 1)
              : cellIndex;
        activateResultCell(block.id, nextValue, Math.max(columns, Array.from(nextValue).length), nextCellIndex);
      };

      return (
        <div className={`addition-number-field ${isActive ? "addition-number-field-active" : ""}`} style={{["--division-columns" as string]: columns}}>
          <div className={`division-cell-row ${displayClassName} addition-number-display ${isStrikeModeActive ? "addition-number-display-strike-mode" : ""}`}>
            {Array.from({length: columns}).map((_, cellIndex) => {
              const cellValue = getAlignedCellCharacter(value, columns, "start", cellIndex);
              const isCellActive = isActive && activeCellIndex === cellIndex;
              const isStruck = hasStruckCell(block.struckCells, field, cellIndex);
              const cellClassName = `division-cell ${isCellActive ? "division-cell-target" : ""} ${isStruck ? "division-cell-struck" : ""} division-cell-button`;
              return (
                <div key={cellIndex} className={`addition-result-cell-editor ${isCellActive ? "addition-result-cell-editor-active" : ""}`}>
                  <button
                    type="button"
                    className={cellClassName}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (isStrikeModeActive) {
                        if (!cellValue.trim()) return;
                        toggleInlineBlockCellStrike(block.id, field, cellIndex);
                        return;
                      }
                      activateResultCell(block.id, value, columns, cellIndex);
                    }}
                    onTouchStart={(event) => {
                      event.stopPropagation();
                      if (isStrikeModeActive) {
                        if (!cellValue.trim()) return;
                        toggleInlineBlockCellStrike(block.id, field, cellIndex);
                        return;
                      }
                      activateResultCell(block.id, value, columns, cellIndex);
                    }}
                  >
                    {cellValue}
                  </button>
                  {isCellActive && !isStrikeModeActive ? (
                    <input
                      ref={(node) => setInlineInputRef(block.id, field, node)}
                      value={cellValue}
                      inputMode="decimal"
                      pattern="[0-9,]*"
                      maxLength={1}
                      className="addition-result-cell-input"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      onMouseDown={(event) => event.stopPropagation()}
                      onFocus={() => activateResultCell(block.id, value, columns, cellIndex)}
                      onBlur={handleBlur(field)}
                      onChange={(event) => {
                        const nextCharacter = normalizeDivisionDecimalInput(event.target.value).slice(-1);
                        if (nextCharacter.length === 0) return;
                        commitResultCell(cellIndex, nextCharacter);
                      }}
                      onKeyDown={(event) => {
                        const isDigit = /^[0-9]$/.test(event.key);
                        const isComma = event.key === ",";
                        if (isDigit || isComma) {
                          event.preventDefault();
                          commitResultCell(cellIndex, event.key);
                          return;
                        }
                        if (event.key === "Backspace") {
                          event.preventDefault();
                          if (cellValue.trim().length > 0) {
                            commitResultCell(cellIndex, "", "stay");
                            return;
                          }
                          if (cellIndex > 0) {
                            const previousCellIndex = cellIndex - 1;
                            const previousValue = setAlignedCellCharacter(value, columns, "start", previousCellIndex, "");
                            updateInlineBlockField(block.id, field, previousValue);
                            activateResultCell(block.id, previousValue, columns, previousCellIndex);
                          }
                          return;
                        }
                        if (event.key === "Delete") {
                          event.preventDefault();
                          commitResultCell(cellIndex, "", "stay");
                          return;
                        }
                        if (event.key === "ArrowLeft") {
                          event.preventDefault();
                          activateResultCell(block.id, value, columns, Math.max(0, cellIndex - 1));
                          return;
                        }
                        if (event.key === "ArrowRight") {
                          event.preventDefault();
                          activateResultCell(block.id, value, columns, Math.min(columns - 1, cellIndex + 1));
                          return;
                        }
                        if (event.key === "Tab" || event.key === "Enter") {
                          setEditingField(block.id, field);
                          return;
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          finishBlockEditing(block.id);
                        }
                      }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const isActive = currentField === field;
    const caretKey = `${block.id}:${field}`;
    const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(value).length;
    const baseInputProps = bindInlineInput(field);
    const targetCellIndex = getAlignedCaretCellIndex(value, columns, "end", caretPosition);

    return (
      <div className={`addition-number-field ${isActive ? "addition-number-field-active" : ""}`} style={{["--division-columns" as string]: columns}}>
        <input
          {...baseInputProps}
          value={value}
          inputMode="decimal"
          pattern="[0-9,]*"
          className={`addition-number-input ${isStrikeModeActive ? "addition-number-input-strike-mode" : ""}`}
          onClick={(event) => updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(value).length)}
          onKeyUp={(event) => updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length)}
          onSelect={(event) => updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length)}
          onKeyDown={(event) => {
            if (handleInlineNumericDeleteKey(block.id, field, value, event)) return;
            baseInputProps.onKeyDown?.(event);
          }}
          onChange={(event) => {
            const nextValue = normalizeDivisionDecimalInput(event.target.value);
            updateInlineBlockField(block.id, field, nextValue);
            updateNumericCaretPosition(caretKey, event.target.selectionStart ?? Array.from(nextValue).length);
          }}
        />
        {renderDivisionCellRow(value, columns, `${displayClassName} addition-number-display ${isStrikeModeActive ? "addition-number-display-strike-mode" : ""}`, "end", isActive ? targetCellIndex : undefined, {
          field,
          struckCells: block.struckCells,
          onCellToggle: (cellIndex, cellValue) => {
            if (!isStrikeModeActive) {
              activateNumericCellSelection(block.id, field, value, columns, "end", cellIndex);
              return;
            }
            if (!cellValue.trim()) return;
            toggleInlineBlockCellStrike(block.id, field, cellIndex);
          }
        })}
      </div>
    );
  };

  const renderCarryControl = (line: ArithmeticLineField) => {
    const carryField = getCarryFieldForArithmeticLine(line);
    const carryCells = block[carryField];
    const activeCarryMatch = currentField?.match(new RegExp(`^${carryField}:(\\d+)$`));
    const activeOffset = activeCarryMatch ? Number.parseInt(activeCarryMatch[1] ?? "0", 10) : null;
    const targetCellIndex = line === activeLine ? getCurrentLineTargetIndex(line) : undefined;
    const targetOffset = typeof targetCellIndex === "number" ? targetCellIndex : 0;
    const showCarryRow = hasArithmeticCarryCells(carryCells) || activeCarryMatch !== null;
    const allowCarryCreation = line === "top";

    if (!showCarryRow) {
      if (isStrikeModeActive || !allowCarryCreation) return null;
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
    }

    return (
      <div className="addition-line addition-line-carry">
        <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
        <div className="division-cell-row addition-row addition-carry-row" style={{["--division-columns" as string]: columns}}>
          {Array.from({length: columns}).map((_, index) => {
            const isActive = activeOffset === index;
            const carryCellValue = getArithmeticCarryCell(carryCells, index);
            const isStruck = hasStruckCell(block.struckCells, carryField, index);
            const isTargetCell = typeof targetCellIndex === "number" && targetCellIndex === index;
            const cellClassName = `division-cell division-cell-button addition-carry-cell addition-carry-cell-display ${isActive || isTargetCell ? "division-cell-target" : ""} ${isStruck ? "division-cell-struck" : ""}`;
            const handleCellPointerDown = (event: ReactMouseEvent<HTMLButtonElement> | ReactTouchEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              if (isStrikeModeActive) {
                if (!carryCellValue.trim()) return;
                toggleInlineBlockCellStrike(block.id, carryField, index);
                return;
              }
              activateCarryEditing(carryField, index);
            };
            return (
              <div key={index} className={`addition-carry-cell-editor ${isActive ? "addition-carry-cell-editor-active" : ""}`}>
                <button type="button" className={cellClassName} onMouseDown={handleCellPointerDown} onTouchStart={handleCellPointerDown}>
                  {carryCellValue}
                </button>
                {isActive && !isStrikeModeActive ? (
                  <input
                    ref={(node) => setInlineInputRef(block.id, `${carryField}:${index}`, node)}
                    value={carryCellValue}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="addition-carry-input"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    onMouseDown={(event) => event.stopPropagation()}
                    onFocus={() => activateCarryEditing(carryField, index)}
                    onBlur={handleBlur(`${carryField}:${index}`)}
                    onChange={(event) => setArithmeticCarryValue(block.id, carryField, index, event.target.value.replace(/\D+/g, "").slice(-1))}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" || event.key === "Delete") {
                        event.preventDefault();
                        if (carryCellValue.trim().length > 0) {
                          setArithmeticCarryValue(block.id, carryField, index, "");
                          return;
                        }
                        if (event.key === "Backspace" && index > 0) activateCarryEditing(carryField, index - 1);
                        return;
                      }
                      if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        activateCarryEditing(carryField, Math.max(0, index - 1));
                        return;
                      }
                      if (event.key === "ArrowRight") {
                        event.preventDefault();
                        activateCarryEditing(carryField, Math.min(columns - 1, index + 1));
                        return;
                      }
                      if (event.key === "Tab" || event.key === "Enter") {
                        event.preventDefault();
                        setEditingField(block.id, line);
                      }
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const topCarryControl = renderCarryControl("top");
  const bottomCarryControl = renderCarryControl("bottom");
  const resultCarryControl = renderCarryControl("result");

  return wrapInlineOperationEditor(
    block.id,
    <div className="math-layout addition-layout">
      <div className="addition-preview">
        <div className={`addition-line-stack ${topCarryControl ? "addition-line-stack-with-carry" : ""}`}>
          {topCarryControl ? <div className="addition-line-carry-overlay">{topCarryControl}</div> : null}
          <div className="addition-line">
            <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
            {renderArithmeticNumericField("top", block.top, "addition-row")}
          </div>
        </div>
        <div className={`addition-line-stack ${bottomCarryControl ? "addition-line-stack-with-carry" : ""}`}>
          {bottomCarryControl ? <div className="addition-line-carry-overlay">{bottomCarryControl}</div> : null}
          <div className="addition-line">
            <span className="addition-sign">{operator}</span>
            {renderArithmeticNumericField("bottom", block.bottom, "addition-row addition-row-operation")}
          </div>
        </div>
        <div className={`addition-line-stack ${resultCarryControl ? "addition-line-stack-with-carry" : ""}`}>
          {resultCarryControl ? <div className="addition-line-carry-overlay">{resultCarryControl}</div> : null}
          <div className="addition-line">
            <span className="addition-sign addition-sign-spacer" aria-hidden="true">{operator}</span>
            {renderArithmeticNumericField("result", block.result, "addition-row addition-row-result")}
          </div>
        </div>
      </div>
    </div>
  );
}
