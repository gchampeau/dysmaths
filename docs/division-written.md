# Written Division

## Purpose

The `written division` component recreates a school-style long division directly on the worksheet, as a floating, editable, and movable object.

It has two goals at the same time:

- provide a highly guided input flow for a child
- preserve a visual result close to a real written division on paper

The component is implemented mainly in [components/math-workbook.tsx](/C:/Users/micro/Documents/Dev/maths-facile/components/math-workbook.tsx) and styled in [app/globals.css](/C:/Users/micro/Documents/Dev/maths-facile/app/globals.css).

## UX Overview

Written division is designed as a small workspace rather than a simple formula.

It has 3 main zones:

- on the left, the `dividend`
- below the dividend, the `work lines`
- on the right, the `divisor` and the `quotient`

Visually:

- the dividend and work are shown in aligned cells
- the divisor and quotient are also shown in cells
- a division bracket is drawn with a vertical and horizontal line
- every other work line starts with a `-`
- operation lines use a green rule to show that the next line is the result of the step above

### Usability Principles

The interface follows a few simple principles:

- the child should be able to insert the division directly on the sheet, without a modal
- the main fields should be easy to fill in without understanding a technical structure
- digits should remain vertically aligned to support calculation
- progression should feel natural: the interface should not show too many empty lines at once
- editing should stay as close as possible to the normal display

### Input Behavior

In edit mode:

- `dividend`, `divisor`, and `quotient` are entered in single fields
- but those fields are displayed above a grid of cells to keep the school-style rendering
- work lines remain edited cell by cell

Keyboard navigation order:

1. `dividend`
2. `divisor`
3. `quotient`
4. `work:0`
5. next lines

`Tab` and `Enter` move forward. `Shift+Tab` moves backward.

### Work Lines

The component does not display all lines immediately.

Current rule:

- at the start, only one work line is visible
- when a visible line is filled, the next one appears
- an empty but visible line stays gray
- the component reserves a maximum number of lines depending mainly on the quotient, with a minimum of 8 lines

Goal:

- avoid overwhelming the child with a large empty block
- reveal the calculation area progressively

### Decimal Input

`dividend`, `divisor`, and `quotient` accept:

- digits
- one decimal separator

To help input:

- if the child types `.`, it is converted automatically to `,`
- other characters are ignored

The decimal separator is kept in the cell display.

## Technical Architecture

## Data Model

Written division corresponds to the `DivisionBlock` type.

Main structure:

```ts
type DivisionBlock = {
  id: string;
  type: "division";
  x: number;
  y: number;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  underline: boolean;
  highlightColor: string | null;
  caption: string;
  dividend: string;
  divisor: string;
  quotient: string;
  remainder: string;
  work: string;
};
```

Important points:

- `dividend`, `divisor`, and `quotient` are stored as strings
- `work` stores all calculation lines in a single string, separated by line breaks
- the position on the sheet is handled by `x` and `y`

## Main Utility Functions

### `getDivisionWorkLines(work)`

Converts the `work` string into an array of lines.

Responsibilities:

- split on `\n`
- trim trailing spaces
- guarantee at least one line

### `getDivisionQuotientDigits(quotient)`

Counts the useful digits in the quotient.

Responsibilities:

- ignore non-numeric characters
- guarantee at least 1

This value is used to calibrate the logical height of the division.

### `normalizeDivisionDecimalInput(value)`

Normalizes free-text input fields.

Responsibilities:

- convert `.` to `,`
- remove unauthorized characters
- allow only one decimal separator

This function is applied to `dividend`, `divisor`, and `quotient`.

### `getDivisionMaxWorkLines(quotient)`

Computes the maximum number of visible work lines.

Current rule:

```ts
Math.max(8, getDivisionQuotientDigits(quotient) * 2 + 1)
```

This formula gives:

- a comfortable minimum of 8 lines
- more room when the quotient has more digits

### `getDivisionVisibleWorkLines(work, quotient)`

Determines how many lines should be visible at a given moment.

Logic:

- take the real lines
- count the already filled prefix
- show one extra empty line after the last filled line
- never exceed `getDivisionMaxWorkLines()`

### `setDivisionWorkLine(work, lineIndex, value)`

Updates a specific line in `work`.

Responsibilities:

- grow the line array if needed
- replace the target line
- remove useless empty trailing lines

### `getDivisionLeftColumns(block)`

Computes the number of columns for the left side.

Calculation basis:

- dividend length
- work line lengths
- minimum visual width of 3 columns

Goal:

- ensure strict alignment between the dividend and the calculations

### `getDivisionDivisorColumns(block)` and `getDivisionQuotientColumns(block)`

Compute the right-side columns separately.

Why two functions:

- the `divisor` and `quotient` should not force each other to use the same width
- each area should adapt its cells to its own content

### `renderDivisionCellRow(value, columns, className)`

Renders a visible row of cells.

Responsibilities:

- create `columns` cells
- place characters one by one
- leave remaining cells empty

This function is reused both in the normal view and in the edit preview layers.

## Rendering

## Normal View

Read-only rendering is handled by `renderMathPreview(block)`.

For written division:

- compute left and right columns
- compute visible lines
- render the left column
- render the right column

General structure:

```tsx
division-preview
  division-left-column
    division-work-line head
      dividend
    division-work-grid
      work lines
  division-right-column
    divisor
    quotient
```

## Interactive View

Interactive rendering is handled by `renderInteractiveMathPreview(block)`.

It reuses the same structure as the normal view, but each clickable sub-area is wrapped in `renderBlockPreviewButton(...)`.

Goal:

- let the child click directly on the part to edit
- keep exactly the same visual structure

## Inline Editing

Inline editing is handled by `renderInlineBlockEditor(block)`.

There are 2 different strategies:

- free fields layered over the visual cells for `dividend`, `divisor`, `quotient`
- individual cells for the work lines

### Layered Free Fields

`renderDivisionNumericField(...)` is used for:

- `dividend`
- `divisor`
- `quotient`

Principle:

- a real `<input>` captures the typing
- the input is visually transparent
- underneath, a row of cells displays the value
- the child feels like they are typing directly into the cells, but input stays simple

Why this approach:

- typing `584` in a single field is much more natural than moving cell by cell
- the school-style alignment is still preserved

### Work Lines in Cells

The `work` lines are edited through `renderDivisionEditableRow(...)`.

Each cell:

- accepts one character
- manages its own focus
- advances automatically to the next cell
- supports coherent backspace and delete behavior

This part is intentionally stricter, because it represents the step-by-step written calculation.

## Keyboard Navigation

Navigation is mainly handled in:

- `handleInlineBlockKeyDown(...)`
- `moveDivisionCellFocus(...)`

Notable behaviors:

- `Tab` moves between logical areas
- `Shift+Tab` moves backward
- `Enter` advances like a local validation
- in work lines, `Enter` can move to the next line
- `ArrowLeft` and `ArrowRight` move between cells
- `Backspace` on an empty cell can move back to the previous one

## CSS and Visual Structure

The styles are in [app/globals.css](/C:/Users/micro/Documents/Dev/maths-facile/app/globals.css).

Important classes:

- `.division-layout`
- `.division-preview`
- `.division-left-column`
- `.division-right-column`
- `.division-work-grid`
- `.division-work-line`
- `.division-work-line-operation`
- `.division-work-line-pending`
- `.division-cell-row`
- `.division-cell`
- `.division-cell-input`
- `.division-number-field`
- `.division-dividend-field`
- `.division-divisor-field`
- `.division-quotient-field`

### Main CSS Roles

`.division-preview`
- organizes the division into 2 columns: left and right

`.division-right-column`
- carries the vertical black line
- stretches to the full height of the block

`.division-quotient`
- carries the horizontal black line

`.division-work-line-operation`
- adds the green line under an operation step

`.division-number-field`
- serves as the shared container for layered free fields

## Important UX Decisions

### Why Free Fields for Some Areas

For a child, entering `584` or `12,5` in a single field is much simpler than:

- clicking the first cell
- typing one digit
- moving to the next cell
- handling the decimal separator manually

The chosen approach is therefore:

- free input for the structural fields
- cell-based editing for the work lines

### Why Lines Appear Gradually

A written division can contain a lot of empty space. Showing it all at once:

- clutters the screen
- feels intimidating
- makes the object taller than necessary

The progressive system keeps the division compact.

### Why Keep Cells in Edit Mode

The normal view and the edit view should feel similar.

If editing switches to a very different interface:

- the child loses visual landmarks
- the link between input and output breaks

The layered free-field plus visible-cells approach preserves that continuity.

## Current Limits

- the decimal separator still occupies a full cell
- the block does not yet guide the mathematical steps of division itself
- handling of carries, decimal shifts, and added zeros is still manual
- `remainder` exists in the type, but is no longer central to the visual model

## Future Ideas

### UX Improvements

- make the decimal separator visually narrower than a full cell
- provide contextual help for decimal divisions
- show a marker on the active line
- offer an even more school-like "guided division" mode

### Technical Improvements

- extract all division logic into a dedicated module
- isolate helpers in a utility file
- add unit tests for:
  - `normalizeDivisionDecimalInput`
  - `getDivisionVisibleWorkLines`
  - column count calculations

## Summary

The `written division` component combines:

- a floating-block logic on a free worksheet
- a highly school-oriented visual structure
- a hybrid editing model:
  - free fields for the main numbers
  - cell-by-cell editing for the calculations

The key design balance is between:

- ease of input for the child
- visual fidelity to a real written division
