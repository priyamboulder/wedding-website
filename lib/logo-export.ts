import { jsPDF } from "jspdf";

export type LogoExportFormat = "svg" | "png-transparent" | "png-ivory" | "pdf";

const IVORY = "#F5F1EA";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildLogoFilename(opts: {
  coupleSlug: string;
  templateSlug: string;
  ext: string;
}): string {
  return `${opts.coupleSlug}-${opts.templateSlug}-logo.${opts.ext}`;
}

function serializeSvg(node: SVGElement): string {
  const clone = node.cloneNode(true) as SVGElement;
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  if (!clone.getAttribute("xmlns:xlink")) {
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  }
  return new XMLSerializer().serializeToString(clone);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function svgToImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function svgToPng(
  svg: SVGElement,
  size: number,
  background: string | null,
): Promise<Blob> {
  const svgString = serializeSvg(svg);
  const img = await svgToImage(svgString);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  }

  const viewBox = svg.getAttribute("viewBox")?.split(/\s+/).map(Number);
  const vbW = viewBox?.[2] ?? img.width ?? size;
  const vbH = viewBox?.[3] ?? img.height ?? size;
  const scale = Math.min(size / vbW, size / vbH) * 0.88;
  const drawW = vbW * scale;
  const drawH = vbH * scale;
  const dx = (size - drawW) / 2;
  const dy = (size - drawH) / 2;

  ctx.drawImage(img, dx, dy, drawW, drawH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

async function svgToPdf(svg: SVGElement): Promise<Blob> {
  const png = await svgToPng(svg, 2048, null);
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(png);
  });

  const pdf = new jsPDF({ unit: "in", format: "letter", orientation: "landscape" });
  const pageW = 11;
  const pageH = 8.5;
  // Logos read wider than monograms — give them a horizontal frame.
  const imgW = 7;
  const imgH = 4.375;
  const x = (pageW - imgW) / 2;
  const y = (pageH - imgH) / 2;
  pdf.addImage(dataUrl, "PNG", x, y, imgW, imgH);
  return pdf.output("blob");
}

export async function exportLogo(opts: {
  svgNode: SVGElement | null;
  format: LogoExportFormat;
  coupleSlug: string;
  templateSlug: string;
}): Promise<void> {
  const { svgNode, format, coupleSlug, templateSlug } = opts;
  if (!svgNode) throw new Error("Logo SVG node not available");

  if (format === "svg") {
    const svgString = serializeSvg(svgNode);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`], {
      type: "image/svg+xml;charset=utf-8",
    });
    triggerDownload(blob, buildLogoFilename({ coupleSlug, templateSlug, ext: "svg" }));
    return;
  }

  if (format === "png-transparent") {
    const blob = await svgToPng(svgNode, 2048, null);
    triggerDownload(blob, buildLogoFilename({ coupleSlug, templateSlug, ext: "png" }));
    return;
  }

  if (format === "png-ivory") {
    const blob = await svgToPng(svgNode, 2048, IVORY);
    triggerDownload(
      blob,
      buildLogoFilename({ coupleSlug, templateSlug, ext: "png" }).replace(
        /-logo\.png$/,
        "-logo-ivory.png",
      ),
    );
    return;
  }

  if (format === "pdf") {
    const filename = buildLogoFilename({ coupleSlug, templateSlug, ext: "pdf" });
    const blob = await svgToPdf(svgNode);
    triggerDownload(blob, filename);
    return;
  }
}
