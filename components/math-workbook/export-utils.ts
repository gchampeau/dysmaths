import {toPng} from "html-to-image";
import {jsPDF} from "jspdf";
import {
  type ImportedSheetBackground,
  SEYES_MAJOR_MM,
  SEYES_MINOR_MM,
  SEYES_MARGIN_CM,
  SMALL_GRID_MM,
  cmToPx,
  getDefaultCanvasFontSize,
  mmToPx,
  safeFileName,
  type SheetStyle
} from "@/components/math-workbook/shared";

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

  if (sheetStyle === "lined") {
    const lineStep = mmToPx(SEYES_MAJOR_MM);

    for (let y = lineStep; y < height; y += lineStep) {
      const snappedY = Math.round(y) + 0.5;
      addLine(0, snappedY, width, snappedY, "rgba(174, 204, 231, 0.74)");
    }

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

  const major = sheetStyle === "large-grid" ? mmToPx(8) : mmToPx(SMALL_GRID_MM);
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

function createExportCanvasNode(canvasNode: HTMLDivElement, sheetStyle: SheetStyle, sheetBackground: ImportedSheetBackground | null = null) {
  const exportWidth = Math.max(1, Math.round(canvasNode.offsetWidth));
  const exportHeight = Math.max(1, Math.round(canvasNode.offsetHeight));
  const wrapper = document.createElement("div");
  wrapper.className = "export-clone";

  const clone = canvasNode.cloneNode(true) as HTMLElement;
  clone.classList.remove("document-canvas-drop-active", "document-canvas-interacting", "document-canvas-draw-mode");
  clone.classList.add("export-sheet");
  clone.style.width = `${exportWidth}px`;
  clone.style.height = `${exportHeight}px`;
  clone.style.aspectRatio = "auto";
  clone.style.margin = "0";
  clone.style.borderRadius = "0";
  clone.style.boxShadow = "none";
  clone.style.background = "#fffdf9";
  if (sheetStyle === "imported" && sheetBackground) {
    clone.style.backgroundImage = `url("${sheetBackground.dataUrl}")`;
    clone.style.backgroundPosition = "center";
    clone.style.backgroundRepeat = "no-repeat";
    clone.style.backgroundSize = "100% 100%";
  } else {
    clone.style.backgroundImage = "none";
  }
  clone.style.setProperty("--canvas-type-size", `${getDefaultCanvasFontSize(sheetStyle)}rem`);
  clone.querySelectorAll(".canvas-snap-guide, .canvas-quick-menu, .canvas-quick-anchor").forEach((node) => node.remove());

  if (sheetStyle !== "imported") {
    const overlay = createExportSheetOverlay(sheetStyle, exportWidth, exportHeight);
    clone.insertBefore(overlay, clone.firstChild);
  }

  wrapper.append(clone);
  document.body.append(wrapper);

  return {
    node: clone,
    cleanup: () => wrapper.remove()
  };
}

async function renderCanvasImage(canvasNode: HTMLDivElement, sheetStyle: SheetStyle, sheetBackground: ImportedSheetBackground | null = null) {
  const exportNode = createExportCanvasNode(canvasNode, sheetStyle, sheetBackground);

  try {
    const imageUrl = await toPng(exportNode.node, {
      backgroundColor: "#fffdf8",
      cacheBust: true,
      skipFonts: true,
      pixelRatio: 2
    });

    return {imageUrl, cleanup: exportNode.cleanup};
  } catch (error) {
    exportNode.cleanup();
    throw error;
  }
}

export async function exportWorkbookPdf(canvasNode: HTMLDivElement, sheetStyle: SheetStyle, title: string, sheetBackground: ImportedSheetBackground | null = null) {
  const {imageUrl, cleanup} = await renderCanvasImage(canvasNode, sheetStyle, sheetBackground);

  try {
    const image = new Image();
    image.src = imageUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image export error"));
    });

    const pdf = new jsPDF({orientation: "portrait", unit: "pt", format: "a4"});
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imageUrl, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save(`${safeFileName(title) || "maths-facile"}.pdf`);
  } finally {
    cleanup();
  }
}

export async function exportWorkbookPng(canvasNode: HTMLDivElement, sheetStyle: SheetStyle, title: string, sheetBackground: ImportedSheetBackground | null = null) {
  const {imageUrl, cleanup} = await renderCanvasImage(canvasNode, sheetStyle, sheetBackground);

  try {
    const previewWindow = window.open("", "_blank");

    if (!previewWindow) {
      return;
    }

    const safeTitle = title || "maths-facile";
    previewWindow.document.title = `${safeTitle}.png`;
    previewWindow.document.body.style.margin = "0";
    previewWindow.document.body.style.background = "#1f2430";
    previewWindow.document.body.style.display = "grid";
    previewWindow.document.body.style.placeItems = "center";
    previewWindow.document.body.innerHTML = `<img src="${imageUrl}" alt="${safeTitle}" style="max-width:100vw;max-height:100vh;display:block;background:white;" />`;
    previewWindow.document.close();
  } finally {
    cleanup();
  }
}

export async function printWorkbook(canvasNode: HTMLDivElement, sheetStyle: SheetStyle, title: string, sheetBackground: ImportedSheetBackground | null = null) {
  const {imageUrl, cleanup} = await renderCanvasImage(canvasNode, sheetStyle, sheetBackground);

  try {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      return;
    }

    const safeTitle = title || "maths-facile";
    printWindow.document.title = `${safeTitle} - impression`;
    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle} - impression</title>
    <style>
      @page { size: A4 portrait; margin: 0; }
      html, body {
        margin: 0;
        padding: 0;
        background: white;
      }
      body {
        display: grid;
        place-items: start center;
      }
      img {
        display: block;
        width: 210mm;
        height: 297mm;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    <img src="${imageUrl}" alt="${safeTitle}" />
    <script>
      const firePrint = () => {
        window.focus();
        window.print();
      };
      window.addEventListener('load', () => window.setTimeout(firePrint, 80), { once: true });
      window.addEventListener('afterprint', () => window.close(), { once: true });
    </script>
  </body>
</html>`);
    printWindow.document.close();
  } finally {
    cleanup();
  }
}
