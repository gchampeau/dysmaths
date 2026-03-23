import type {MouseEvent as ReactMouseEvent, ReactNode, TouchEvent as ReactTouchEvent} from "react";
import {
  GEOMETRY_HIT_RADIUS_PX,
  GEOMETRY_POINT_RADIUS_MM,
  createStrokePath,
  getGeometryArcPathData,
  getGeometrySelectionMeasurement,
  getGeometryShapeBoundsPx,
  getGraduatedLineEndpointLabel,
  getGraduatedLineLabelPosition,
  getGraduatedLineRenderTicks,
  getRenderedLinearGeometryPx,
  getStrokeBounds,
  mmToPx,
  type FreehandStroke,
  type GeometryAngleMeasurement,
  type GeometryArcShape,
  type GeometryCompassDraft,
  type GeometryDraft,
  type GeometryMeasurement,
  type GeometryProtractorDraft,
  type GeometryShape,
  type GraduatedLineDraft
} from "@/components/math-workbook/shared";

type GeometryCanvasLayerProps = {
  width: number;
  height: number;
  geometry: GeometryShape[];
  selectedGeometryIds: string[];
  activeGeometryTool: string | null;
  geometryMeasurement: GeometryMeasurement | null;
  geometryAngleMeasurement: GeometryAngleMeasurement | null;
  geometryDraft: GeometryDraft | null;
  geometryProtractorDraft: GeometryProtractorDraft | null;
  geometryCompassDraft: GeometryCompassDraft | null;
  setGeometryNodeRef: (shapeId: string, node: SVGGElement | null) => void;
  startDraggingGeometry: (shapeId: string, x: number, y: number, event: ReactMouseEvent<Element>) => void;
  startTouchDraggingGeometry: (shapeId: string, x: number, y: number, event: ReactTouchEvent<Element>, ignoreDrag?: boolean) => void;
  renderProtractorOverlay: (vertex: GeometryAngleMeasurement["vertex"], baseline: GeometryAngleMeasurement["baseline"], end: GeometryAngleMeasurement["end"], mode: "draft" | "final") => ReactNode;
  createGeometryShapeFromDraft: (draft: GeometryDraft) => Exclude<GeometryShape, GeometryArcShape> | null;
};

export function GeometryCanvasLayer({
  width,
  height,
  geometry,
  selectedGeometryIds,
  activeGeometryTool,
  geometryMeasurement,
  geometryAngleMeasurement,
  geometryDraft,
  geometryProtractorDraft,
  geometryCompassDraft,
  setGeometryNodeRef,
  startDraggingGeometry,
  startTouchDraggingGeometry,
  renderProtractorOverlay,
  createGeometryShapeFromDraft
}: GeometryCanvasLayerProps) {
  return (
    <svg className={`canvas-geometry-layer ${activeGeometryTool ? "canvas-geometry-layer-passive" : ""}`} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" data-testid="geometry-layer">
      {geometry.map((shape) => {
        const isSelected = selectedGeometryIds.includes(shape.id);
        const bounds = getGeometryShapeBoundsPx(shape, width, height);
        const strokeWidthPx = Math.max(1.2, mmToPx(shape.strokeWidthMm));

        if (shape.kind === "point") {
          const x = mmToPx(shape.xMm);
          const y = mmToPx(shape.yMm);

          return (
            <g
              key={shape.id}
              ref={(node) => setGeometryNodeRef(shape.id, node)}
              className={`canvas-geometry-shape ${isSelected ? "canvas-geometry-shape-selected" : ""}`}
              data-testid={`geometry-shape-${shape.kind}`}
              onMouseDown={(event) => {
                if (activeGeometryTool) return;
                startDraggingGeometry(shape.id, bounds.x, bounds.y, event);
              }}
              onTouchStart={(event) => startTouchDraggingGeometry(shape.id, bounds.x, bounds.y, event, Boolean(activeGeometryTool))}
            >
              <circle className="canvas-geometry-hit" cx={x} cy={y} r={GEOMETRY_HIT_RADIUS_PX} />
              <circle className="canvas-geometry-point" cx={x} cy={y} r={mmToPx(GEOMETRY_POINT_RADIUS_MM)} fill={shape.color} />
              {isSelected ? <circle className="canvas-geometry-selection-ring" cx={x} cy={y} r={mmToPx(GEOMETRY_POINT_RADIUS_MM) + 6} fill="none" /> : null}
              {shape.label ? <text className="canvas-geometry-label" x={x + 10} y={y - 10} fill={shape.color}>{shape.label}</text> : null}
            </g>
          );
        }

        if (shape.kind === "circle") {
          const cx = mmToPx(shape.cxMm);
          const cy = mmToPx(shape.cyMm);
          const radius = mmToPx(shape.radiusMm);
          const measurement = isSelected ? getGeometrySelectionMeasurement(shape) : null;

          return (
            <g
              key={shape.id}
              ref={(node) => setGeometryNodeRef(shape.id, node)}
              className={`canvas-geometry-shape ${isSelected ? "canvas-geometry-shape-selected" : ""}`}
              data-testid={`geometry-shape-${shape.kind}`}
              onMouseDown={(event) => {
                if (activeGeometryTool) return;
                startDraggingGeometry(shape.id, bounds.x, bounds.y, event);
              }}
              onTouchStart={(event) => startTouchDraggingGeometry(shape.id, bounds.x, bounds.y, event, Boolean(activeGeometryTool))}
            >
              <circle className="canvas-geometry-hit" cx={cx} cy={cy} r={Math.max(radius + 8, GEOMETRY_HIT_RADIUS_PX)} fill="none" />
              <circle className="canvas-geometry-circle" cx={cx} cy={cy} r={radius} fill="none" stroke={shape.color} strokeWidth={strokeWidthPx} />
              <circle className="canvas-geometry-center" cx={cx} cy={cy} r={Math.max(1.2, strokeWidthPx)} fill={shape.color} />
              {isSelected ? <circle className="canvas-geometry-selection-ring" cx={cx} cy={cy} r={radius + 6} fill="none" /> : null}
              {measurement ? <text className="canvas-geometry-measure" x={cx} y={cy - radius - 14} textAnchor="middle">{measurement}</text> : null}
            </g>
          );
        }

        if (shape.kind === "arc") {
          const arc = getGeometryArcPathData({xMm: shape.cxMm, yMm: shape.cyMm}, shape.radiusMm, shape.startAngle, shape.endAngle);
          return (
            <g
              key={shape.id}
              ref={(node) => setGeometryNodeRef(shape.id, node)}
              className={`canvas-geometry-shape ${isSelected ? "canvas-geometry-shape-selected" : ""}`}
              data-testid={`geometry-shape-${shape.kind}`}
              onMouseDown={(event) => {
                if (activeGeometryTool) return;
                startDraggingGeometry(shape.id, bounds.x, bounds.y, event);
              }}
              onTouchStart={(event) => startTouchDraggingGeometry(shape.id, bounds.x, bounds.y, event, Boolean(activeGeometryTool))}
            >
              <path className="canvas-geometry-hit" d={arc.path} fill="none" />
              <path className="canvas-geometry-line" d={arc.path} fill="none" stroke={shape.color} strokeWidth={1} />
              {isSelected ? <path className="canvas-geometry-selection-ring" d={arc.path} fill="none" /> : null}
            </g>
          );
        }

        const rendered = getRenderedLinearGeometryPx(shape, width, height);
        if (!rendered) return null;

        const measurement = isSelected ? getGeometrySelectionMeasurement(shape) : null;
        const measurementX = (mmToPx(shape.axMm) + mmToPx(shape.bxMm)) / 2;
        const measurementY = (mmToPx(shape.ayMm) + mmToPx(shape.byMm)) / 2 - 14;
        const graduatedLineTicks = shape.kind === "graduated-line" ? getGraduatedLineRenderTicks(shape, width, height) : [];
        const graduatedLineStartLabelPosition = shape.kind === "graduated-line" ? getGraduatedLineLabelPosition(rendered.x1, rendered.y1, rendered.x2, rendered.y2, 0) : null;
        const graduatedLineEndLabelPosition = shape.kind === "graduated-line" ? getGraduatedLineLabelPosition(rendered.x1, rendered.y1, rendered.x2, rendered.y2, 1) : null;

        return (
          <g
            key={shape.id}
            ref={(node) => setGeometryNodeRef(shape.id, node)}
            className={`canvas-geometry-shape ${isSelected ? "canvas-geometry-shape-selected" : ""}`}
            data-testid={`geometry-shape-${shape.kind}`}
            onMouseDown={(event) => {
              if (activeGeometryTool) return;
              startDraggingGeometry(shape.id, bounds.x, bounds.y, event);
            }}
            onTouchStart={(event) => startTouchDraggingGeometry(shape.id, bounds.x, bounds.y, event, Boolean(activeGeometryTool))}
          >
            <line className="canvas-geometry-hit" x1={rendered.x1} y1={rendered.y1} x2={rendered.x2} y2={rendered.y2} />
            {isSelected ? <line className="canvas-geometry-selection-ring" x1={rendered.x1} y1={rendered.y1} x2={rendered.x2} y2={rendered.y2} strokeWidth={Math.max(8, strokeWidthPx + 6)} strokeLinecap="round" /> : null}
            <line className={`canvas-geometry-line ${shape.kind === "graduated-line" ? "canvas-geometry-graduated-line" : ""}`} x1={rendered.x1} y1={rendered.y1} x2={rendered.x2} y2={rendered.y2} stroke={shape.color} strokeWidth={strokeWidthPx} />
            {shape.kind === "graduated-line" ? graduatedLineTicks.map((tick, index) => (
              <line key={`${shape.id}-tick-${index}`} className="canvas-geometry-graduated-line-tick" x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} stroke={shape.color} strokeWidth={tick.strokeWidth} strokeLinecap="round" />
            )) : null}
            {shape.kind === "graduated-line" ? (
              <>
                <text className="canvas-geometry-measure canvas-geometry-graduated-line-label" x={graduatedLineStartLabelPosition?.x ?? rendered.x1} y={graduatedLineStartLabelPosition?.y ?? rendered.y1} textAnchor={graduatedLineStartLabelPosition?.textAnchor ?? "middle"} dominantBaseline={graduatedLineStartLabelPosition?.dominantBaseline}>
                  {getGraduatedLineEndpointLabel(shape, 0)}
                </text>
                <text className="canvas-geometry-measure canvas-geometry-graduated-line-label" x={graduatedLineEndLabelPosition?.x ?? rendered.x2} y={graduatedLineEndLabelPosition?.y ?? rendered.y2} textAnchor={graduatedLineEndLabelPosition?.textAnchor ?? "middle"} dominantBaseline={graduatedLineEndLabelPosition?.dominantBaseline}>
                  {getGraduatedLineEndpointLabel(shape, 1)}
                </text>
              </>
            ) : null}
            {measurement ? <text className="canvas-geometry-measure" x={measurementX} y={measurementY} textAnchor="middle">{measurement}</text> : null}
            {shape.kind === "segment" ? (
              <>
                <circle className="canvas-geometry-endpoint" cx={mmToPx(shape.axMm)} cy={mmToPx(shape.ayMm)} r={Math.max(2, strokeWidthPx + 0.6)} fill={shape.color} />
                <circle className="canvas-geometry-endpoint" cx={mmToPx(shape.bxMm)} cy={mmToPx(shape.byMm)} r={Math.max(2, strokeWidthPx + 0.6)} fill={shape.color} />
              </>
            ) : shape.kind === "ray" ? <circle className="canvas-geometry-endpoint" cx={mmToPx(shape.axMm)} cy={mmToPx(shape.ayMm)} r={Math.max(2, strokeWidthPx + 0.6)} fill={shape.color} /> : null}
          </g>
        );
      })}
      {geometryMeasurement ? (
        <>
          <line className="canvas-geometry-preview canvas-geometry-measure-line" x1={mmToPx(geometryMeasurement.start.xMm)} y1={mmToPx(geometryMeasurement.start.yMm)} x2={mmToPx(geometryMeasurement.end.xMm)} y2={mmToPx(geometryMeasurement.end.yMm)} />
          <text className="canvas-geometry-measure" x={(mmToPx(geometryMeasurement.start.xMm) + mmToPx(geometryMeasurement.end.xMm)) / 2} y={(mmToPx(geometryMeasurement.start.yMm) + mmToPx(geometryMeasurement.end.yMm)) / 2 - 14} textAnchor="middle">
            {`${Math.round(Math.hypot(geometryMeasurement.end.xMm - geometryMeasurement.start.xMm, geometryMeasurement.end.yMm - geometryMeasurement.start.yMm))} mm`}
          </text>
        </>
      ) : null}
      {geometryAngleMeasurement ? renderProtractorOverlay(geometryAngleMeasurement.vertex, geometryAngleMeasurement.baseline, geometryAngleMeasurement.end, "final") : null}
      {geometryDraft ? (() => {
        if (geometryDraft.tool === "measure") {
          return <line className="canvas-geometry-preview canvas-geometry-measure-line" x1={mmToPx(geometryDraft.start.xMm)} y1={mmToPx(geometryDraft.start.yMm)} x2={mmToPx(geometryDraft.current.xMm)} y2={mmToPx(geometryDraft.current.yMm)} />;
        }
        const previewShape = createGeometryShapeFromDraft(geometryDraft);
        if (!previewShape) return null;
        if (previewShape.kind === "point") {
          const x = mmToPx(previewShape.xMm);
          const y = mmToPx(previewShape.yMm);
          return <circle className="canvas-geometry-preview" cx={x} cy={y} r={mmToPx(GEOMETRY_POINT_RADIUS_MM)} />;
        }
        if (previewShape.kind === "circle") {
          return <circle className="canvas-geometry-preview" cx={mmToPx(previewShape.cxMm)} cy={mmToPx(previewShape.cyMm)} r={mmToPx(previewShape.radiusMm)} />;
        }
        const rendered = getRenderedLinearGeometryPx(previewShape, width, height);
        if (!rendered) return null;
        return <line className="canvas-geometry-preview" x1={rendered.x1} y1={rendered.y1} x2={rendered.x2} y2={rendered.y2} />;
      })() : null}
      {geometryProtractorDraft?.vertex ? renderProtractorOverlay(geometryProtractorDraft.vertex, geometryProtractorDraft.firstPoint, geometryProtractorDraft.current, "draft") : null}
      {geometryCompassDraft ? (() => {
        const centerX = mmToPx(geometryCompassDraft.center.xMm);
        const centerY = mmToPx(geometryCompassDraft.center.yMm);
        if (geometryCompassDraft.phase === "radius") {
          return (
            <>
              <circle className="canvas-geometry-point" cx={centerX} cy={centerY} r={mmToPx(GEOMETRY_POINT_RADIUS_MM)} />
              <line className="canvas-geometry-preview canvas-geometry-measure-line" x1={centerX} y1={centerY} x2={mmToPx(geometryCompassDraft.current.xMm)} y2={mmToPx(geometryCompassDraft.current.yMm)} />
            </>
          );
        }
        if (!geometryCompassDraft.startPoint || geometryCompassDraft.radiusMm === null || geometryCompassDraft.startAngle === null) return null;
        const radiusMm = Math.hypot(geometryCompassDraft.startPoint.xMm - geometryCompassDraft.center.xMm, geometryCompassDraft.startPoint.yMm - geometryCompassDraft.center.yMm);
        const arc = getGeometryArcPathData(geometryCompassDraft.center, radiusMm, geometryCompassDraft.startAngle, geometryCompassDraft.startAngle + geometryCompassDraft.accumulatedSweep);
        return (
          <>
            <circle className="canvas-geometry-point" cx={centerX} cy={centerY} r={mmToPx(GEOMETRY_POINT_RADIUS_MM)} />
            <line className="canvas-geometry-preview canvas-geometry-measure-line" x1={centerX} y1={centerY} x2={mmToPx(geometryCompassDraft.startPoint.xMm)} y2={mmToPx(geometryCompassDraft.startPoint.yMm)} />
            <line className="canvas-geometry-preview canvas-geometry-measure-line" x1={centerX} y1={centerY} x2={mmToPx(geometryCompassDraft.current.xMm)} y2={mmToPx(geometryCompassDraft.current.yMm)} />
            <path className="canvas-geometry-preview canvas-geometry-compass-arc" d={arc.path} fill="none" />
          </>
        );
      })() : null}
    </svg>
  );
}

type DrawCanvasLayerProps = {
  advancedTool: string | null;
  strokes: FreehandStroke[];
  selectedStrokeIds: string[];
  draftStroke: Array<{x: number; y: number}> | null;
  draftStrokeStyle: {color: string; width: number; opacity: number};
  graduatedLineDraft: GraduatedLineDraft | null;
  setStrokeNodeRef: (strokeId: string, node: SVGGElement | null) => void;
  beginDrawOrGraduatedLine: (clientX: number, clientY: number, isTouch: boolean) => void;
  updateHighlightCursor: (clientX: number, clientY: number) => void;
  hideHighlightCursor: () => void;
  startDraggingStroke: (strokeId: string, x: number, y: number, event: ReactMouseEvent<Element>) => void;
  startTouchDraggingStroke: (strokeId: string, x: number, y: number, event: ReactTouchEvent<Element>, ignoreDrag?: boolean) => void;
};

export function DrawCanvasLayer({
  advancedTool,
  strokes,
  selectedStrokeIds,
  draftStroke,
  draftStrokeStyle,
  graduatedLineDraft,
  setStrokeNodeRef,
  beginDrawOrGraduatedLine,
  updateHighlightCursor,
  hideHighlightCursor,
  startDraggingStroke,
  startTouchDraggingStroke
}: DrawCanvasLayerProps) {
  return (
    <svg
      className={`canvas-draw-layer ${advancedTool === "draw" || advancedTool === "highlight" || advancedTool === "graduated-line" ? "canvas-draw-layer-active" : ""}`}
      width="100%"
      height="100%"
      onMouseMove={(event) => {
        if (advancedTool === "highlight") updateHighlightCursor(event.clientX, event.clientY);
      }}
      onMouseLeave={() => {
        if (advancedTool === "highlight") hideHighlightCursor();
      }}
      onMouseDown={(event) => {
        if (advancedTool !== "draw" && advancedTool !== "highlight" && advancedTool !== "graduated-line") return;
        event.preventDefault();
        event.stopPropagation();
        beginDrawOrGraduatedLine(event.clientX, event.clientY, false);
      }}
      onTouchStart={(event) => {
        if ((advancedTool !== "draw" && advancedTool !== "highlight" && advancedTool !== "graduated-line") || event.touches.length === 0) return;
        event.preventDefault();
        event.stopPropagation();
        const touch = event.touches[0];
        if (!touch) return;
        beginDrawOrGraduatedLine(touch.clientX, touch.clientY, true);
      }}
    >
      {strokes.map((stroke) => {
        const strokeBounds = getStrokeBounds(stroke.points);
        return (
          <g
            key={stroke.id}
            ref={(node) => setStrokeNodeRef(stroke.id, node)}
            className={`canvas-draw-stroke-group ${selectedStrokeIds.includes(stroke.id) ? "canvas-draw-stroke-group-selected" : ""}`}
            onMouseDown={(event) => {
              if (advancedTool === "draw" || advancedTool === "highlight") return;
              startDraggingStroke(stroke.id, strokeBounds.x, strokeBounds.y, event);
            }}
            onTouchStart={(event) => startTouchDraggingStroke(stroke.id, strokeBounds.x, strokeBounds.y, event, advancedTool === "draw" || advancedTool === "highlight")}
          >
            <path className="canvas-draw-hit" d={createStrokePath(stroke.points)} fill="none" />
            <path className="canvas-draw-path" d={createStrokePath(stroke.points)} fill="none" stroke={stroke.color} strokeWidth={stroke.width} strokeOpacity={stroke.opacity} />
            {selectedStrokeIds.includes(stroke.id) ? <path className="canvas-draw-path canvas-draw-path-selected" d={createStrokePath(stroke.points)} fill="none" stroke="rgba(217, 119, 69, 0.8)" strokeWidth={5.2} /> : null}
          </g>
        );
      })}
      {draftStroke && draftStroke.length >= 2 ? <path className="canvas-draw-path canvas-draw-path-draft" d={createStrokePath(draftStroke)} fill="none" stroke={draftStrokeStyle.color} strokeWidth={draftStrokeStyle.width} strokeOpacity={draftStrokeStyle.opacity} /> : null}
      {graduatedLineDraft ? <line className="canvas-geometry-preview canvas-geometry-graduated-line-preview" x1={mmToPx(graduatedLineDraft.start.xMm)} y1={mmToPx(graduatedLineDraft.start.yMm)} x2={mmToPx(graduatedLineDraft.current.xMm)} y2={mmToPx(graduatedLineDraft.current.yMm)} /> : null}
    </svg>
  );
}
