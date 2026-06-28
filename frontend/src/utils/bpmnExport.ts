import type BpmnModelerLib from "bpmn-js/lib/Modeler";
import { jsPDF } from "jspdf";
import { downloadFile } from "./downloadFile";

export type ExportFormat = "xml" | "png" | "pdf";

function safeFileName(name: string) {
  const base = (name || "processo").trim().replace(/[\\/:*?"<>|]+/g, "_");
  return base.length ? base : "processo";
}

export async function exportXml(
  modeler: BpmnModelerLib,
  processName: string,
): Promise<void> {
  const { xml } = await modeler.saveXML({ format: true });
  if (!xml) throw new Error("Não foi possível gerar o XML.");
  downloadFile(`${safeFileName(processName)}.bpmn`, xml, "application/xml");
}

/** Renderiza o SVG do modeler em um canvas e devolve o PNG. */
async function renderToPngBlob(
  modeler: BpmnModelerLib,
  scale = 2,
  padding = 24,
): Promise<{ blob: Blob; width: number; height: number }> {
  const { svg } = await modeler.saveSVG();
  if (!svg) throw new Error("Não foi possível gerar o SVG.");

  // Descobre as dimensões do diagrama a partir do viewBox.
  const viewBoxMatch = svg.match(/viewBox="([\d.\-\s]+)"/);
  let width = 1200;
  let height = 800;
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      width = Math.max(100, Math.ceil(parts[2]));
      height = Math.max(100, Math.ceil(parts[3]));
    }
  }

  const canvasWidth = (width + padding * 2) * scale;
  const canvasHeight = (height + padding * 2) * scale;

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Falha ao carregar SVG."));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível neste navegador.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      img,
      padding * scale,
      padding * scale,
      width * scale,
      height * scale,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );
    if (!blob) throw new Error("Falha ao gerar PNG.");
    return { blob, width: canvasWidth, height: canvasHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportPng(
  modeler: BpmnModelerLib,
  processName: string,
): Promise<void> {
  const { blob } = await renderToPngBlob(modeler);
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFileName(processName)}.png`;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportPdf(
  modeler: BpmnModelerLib,
  processName: string,
): Promise<void> {
  const { blob, width, height } = await renderToPngBlob(modeler);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler PNG."));
    reader.readAsDataURL(blob);
  });

  // A4 paisagem (mm). Mantém proporção do diagrama dentro das margens.
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const titleHeight = 10;
  const footerHeight = 8;
  const usableW = pageWidth - margin * 2;
  const usableH = pageHeight - margin * 2 - titleHeight - footerHeight;

  const ratio = Math.min(usableW / width, usableH / height);
  const drawW = width * ratio;
  const drawH = height * ratio;
  const offsetX = margin + (usableW - drawW) / 2;
  const offsetY = margin + titleHeight + (usableH - drawH) / 2;

  pdf.setFontSize(14);
  pdf.setTextColor(20, 20, 20);
  pdf.text(processName || "Processo", margin, margin + 6);

  pdf.addImage(dataUrl, "PNG", offsetX, offsetY, drawW, drawH);

  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text(
    `Gerado pela EfficiencIA — ${new Date().toLocaleString()}`,
    margin,
    pageHeight - margin,
  );

  pdf.save(`${safeFileName(processName)}.pdf`);
}

export async function exportBpmn(
  modeler: BpmnModelerLib,
  format: ExportFormat,
  processName: string,
): Promise<void> {
  if (format === "xml") return exportXml(modeler, processName);
  if (format === "png") return exportPng(modeler, processName);
  return exportPdf(modeler, processName);
}