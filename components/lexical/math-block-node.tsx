"use client";

import { DecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import type { SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  type ElementFormatType,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type Spread
} from "lexical";
import { createContext, type JSX, useContext } from "react";

export type StudyMode = "middleSchool" | "highSchool";

export type FractionBlock = {
  id: string;
  type: "fraction";
  numerator: string;
  denominator: string;
  simplified: string;
  caption: string;
};

export type DivisionBlock = {
  id: string;
  type: "division";
  dividend: string;
  divisor: string;
  quotient: string;
  remainder: string;
  caption: string;
};

export type PowerBlock = {
  id: string;
  type: "power";
  base: string;
  exponent: string;
  result: string;
  caption: string;
};

export type RootBlock = {
  id: string;
  type: "root";
  radicand: string;
  result: string;
  caption: string;
};

export type StructuredBlock = FractionBlock | DivisionBlock | PowerBlock | RootBlock;

export type StructuredTool = {
  id: StructuredBlock["type"];
  label: string;
  hint: string;
  modes: StudyMode[];
};

export const STRUCTURED_TOOLS: StructuredTool[] = [
  {
    id: "fraction",
    label: "Fraction posée",
    hint: "Numérateur au-dessus, dénominateur en dessous",
    modes: ["middleSchool", "highSchool"]
  },
  {
    id: "division",
    label: "Division posée",
    hint: "Diviseur, dividende, quotient et reste",
    modes: ["middleSchool", "highSchool"]
  },
  {
    id: "power",
    label: "Puissance",
    hint: "Base, exposant et résultat",
    modes: ["middleSchool", "highSchool"]
  },
  {
    id: "root",
    label: "Racine",
    hint: "Radicande et résultat",
    modes: ["middleSchool", "highSchool"]
  }
];

type MathBlockActions = {
  openEditor: (nodeKey: NodeKey) => void;
  draggingNodeKey: NodeKey | null;
  dropTargetNodeKey: NodeKey | null;
  dropPosition: "before" | "after" | null;
  startDrag: (nodeKey: NodeKey) => void;
  updateDropTarget: (nodeKey: NodeKey, position: "before" | "after") => void;
  commitDrop: (nodeKey: NodeKey, position: "before" | "after") => void;
  endDrag: () => void;
};

const MathBlockActionsContext = createContext<MathBlockActions | null>(null);

export function MathBlockActionsProvider({
  children,
  openEditor,
  draggingNodeKey,
  dropTargetNodeKey,
  dropPosition,
  startDrag,
  updateDropTarget,
  commitDrop,
  endDrag
}: {
  children: JSX.Element;
  openEditor: (nodeKey: NodeKey) => void;
  draggingNodeKey: NodeKey | null;
  dropTargetNodeKey: NodeKey | null;
  dropPosition: "before" | "after" | null;
  startDrag: (nodeKey: NodeKey) => void;
  updateDropTarget: (nodeKey: NodeKey, position: "before" | "after") => void;
  commitDrop: (nodeKey: NodeKey, position: "before" | "after") => void;
  endDrag: () => void;
}) {
  return (
    <MathBlockActionsContext.Provider
      value={{
        openEditor,
        draggingNodeKey,
        dropTargetNodeKey,
        dropPosition,
        startDrag,
        updateDropTarget,
        commitDrop,
        endDrag
      }}
    >
      {children}
    </MathBlockActionsContext.Provider>
  );
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createStructuredBlock(type: StructuredTool["id"]): StructuredBlock {
  if (type === "fraction") {
    return { id: createId("fraction"), type, numerator: "", denominator: "", simplified: "", caption: "" };
  }

  if (type === "division") {
    return {
      id: createId("division"),
      type,
      dividend: "",
      divisor: "",
      quotient: "",
      remainder: "",
      caption: ""
    };
  }

  if (type === "power") {
    return { id: createId("power"), type, base: "", exponent: "", result: "", caption: "" };
  }

  return { id: createId("root"), type, radicand: "", result: "", caption: "" };
}

export function cloneStructuredBlock(block: StructuredBlock): StructuredBlock {
  return JSON.parse(JSON.stringify(block)) as StructuredBlock;
}

export function getStructuredBlockTitle(block: StructuredBlock) {
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

export function getDefaultMathWidth(type: StructuredBlock["type"]) {
  switch (type) {
    case "division":
      return 360;
    case "fraction":
      return 280;
    case "power":
      return 220;
    case "root":
      return 240;
    default:
      return 280;
  }
}

export function clampMathWidth(width: number) {
  return Math.min(440, Math.max(180, Math.round(width)));
}

export function MathBlockPreview({
  block
}: {
  block: StructuredBlock;
}) {
  if (block.type === "fraction") {
    return (
      <div className="math-block-preview fraction-layout">
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
      <div className="math-block-preview division-layout">
        <div className="division-preview">
          <div className="division-left">{block.divisor || "diviseur"}</div>
          <div className="division-right">
            <div className="division-dividend">{block.dividend || "dividende"}</div>
            <div className="division-quotient">{block.quotient || "quotient"}</div>
          </div>
        </div>
        {block.remainder ? <p className="math-result">Reste : {block.remainder}</p> : null}
        {block.caption ? <p className="math-caption">{block.caption}</p> : null}
      </div>
    );
  }

  if (block.type === "power") {
    return (
      <div className="math-block-preview power-layout">
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
    <div className="math-block-preview root-layout">
      <div className="root-preview">
        <span className="root-symbol">√</span>
        <span className="root-radicand">{block.radicand || "radicande"}</span>
      </div>
      {block.result ? <p className="math-result">Résultat : {block.result}</p> : null}
      {block.caption ? <p className="math-caption">{block.caption}</p> : null}
    </div>
  );
}

function MathBlockDecorator({
  nodeKey,
  block,
  width
}: {
  nodeKey: NodeKey;
  block: StructuredBlock;
  width: number;
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const actions = useContext(MathBlockActionsContext);

  const isDragSource = actions?.draggingNodeKey === nodeKey;
  const showDropBefore = actions?.dropTargetNodeKey === nodeKey && actions.dropPosition === "before";
  const showDropAfter = actions?.dropTargetNodeKey === nodeKey && actions.dropPosition === "after";

  function updateWidth(nextWidth: number) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if ($isMathBlockNode(node)) {
        node.setWidth(clampMathWidth(nextWidth));
      }
    });
  }

  function moveNode(direction: "up" | "down") {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if (!$isMathBlockNode(node)) {
        return;
      }

      if (direction === "up") {
        const previous = node.getPreviousSibling();

        if (previous) {
          previous.insertBefore(node);
        }

        return;
      }

      const next = node.getNextSibling();

      if (next) {
        next.insertAfter(node);
      }
    });
  }

  function removeNode() {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if ($isMathBlockNode(node)) {
        node.remove();
      }
    });
  }

  return (
    <div
      className={`lexical-math-node ${isSelected ? "lexical-math-node-selected" : ""} ${isDragSource ? "lexical-math-node-drag-source" : ""}`}
      data-node-key={String(nodeKey)}
      style={{ width: `${width}px` }}
      onClick={(event) => {
        event.preventDefault();
        clearSelection();
        setSelected(true);
        editor.update(() => {
          const selection = $getSelection();

          if ($isNodeSelection(selection)) {
            selection.clear();
          }
        });
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        clearSelection();
        setSelected(true);
        actions?.openEditor(nodeKey);
      }}
    >
      <div className={`lexical-drop-indicator lexical-drop-indicator-top ${showDropBefore ? "lexical-drop-indicator-visible" : ""}`} />
      <div className="lexical-math-node-head">
        <div className="lexical-math-node-title">
          <button
            type="button"
            className="lexical-inline-drag-handle"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              actions?.startDrag(nodeKey);
            }}
            aria-label="Déplacer le bloc"
            title="Déplacer le bloc"
            onClick={(event) => event.preventDefault()}
          >
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </button>
          <p className="math-block-kind">{getStructuredBlockTitle(block)}</p>
        </div>
        <div className="math-block-controls">
          <button type="button" onClick={() => updateWidth(width - 32)}>
            -
          </button>
          <button type="button" onClick={() => updateWidth(getDefaultMathWidth(block.type))}>
            1:1
          </button>
          <button type="button" onClick={() => updateWidth(width + 32)}>
            +
          </button>
          <button type="button" onClick={() => moveNode("up")}>
            Haut
          </button>
          <button type="button" onClick={() => moveNode("down")}>
            Bas
          </button>
          <button
            type="button"
            onClick={() => {
              actions?.openEditor(nodeKey);
            }}
          >
            Modifier
          </button>
          <button type="button" onClick={removeNode}>
            Supprimer
          </button>
        </div>
      </div>
      <MathBlockPreview block={block} />
      <div className={`lexical-drop-indicator lexical-drop-indicator-bottom ${showDropAfter ? "lexical-drop-indicator-visible" : ""}`} />
    </div>
  );
}

export type SerializedMathBlockNode = Spread<
  {
    type: "math-block";
    version: 1;
    block: StructuredBlock;
    width: number;
  },
  SerializedDecoratorBlockNode
>;

export class MathBlockNode extends DecoratorBlockNode {
  __block: StructuredBlock;
  __width: number;

  static getType() {
    return "math-block";
  }

  static clone(node: MathBlockNode) {
    return new MathBlockNode(node.__block, node.__width, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedMathBlockNode) {
    return new MathBlockNode(
      serializedNode.block,
      serializedNode.width ?? getDefaultMathWidth(serializedNode.block.type),
      serializedNode.format
    );
  }

  constructor(
    block: StructuredBlock,
    width = getDefaultMathWidth(block.type),
    format?: ElementFormatType,
    key?: NodeKey
  ) {
    super(format, key);
    this.__block = block;
    this.__width = clampMathWidth(width);
  }

  exportJSON(): SerializedMathBlockNode {
    return {
      ...super.exportJSON(),
      type: "math-block",
      version: 1,
      block: this.__block,
      width: this.__width
    };
  }

  createDOM(): HTMLElement {
    const element = super.createDOM();
    element.className = "lexical-math-node-shell";
    return element;
  }

  updateDOM(): false {
    return false;
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return <MathBlockDecorator nodeKey={this.getKey()} block={this.__block} width={this.__width} />;
  }

  getBlock() {
    return this.getLatest().__block;
  }

  getWidth() {
    return this.getLatest().__width;
  }

  setBlock(block: StructuredBlock) {
    const writable = this.getWritable();
    writable.__block = cloneStructuredBlock(block);
  }

  setWidth(width: number) {
    const writable = this.getWritable();
    writable.__width = clampMathWidth(width);
  }
}

export function $createMathBlockNode(
  block: StructuredBlock,
  width = getDefaultMathWidth(block.type)
) {
  return new MathBlockNode(cloneStructuredBlock(block), width);
}

export function $isMathBlockNode(node: LexicalNode | null | undefined): node is MathBlockNode {
  return node instanceof MathBlockNode;
}
