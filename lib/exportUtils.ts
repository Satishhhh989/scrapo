// lib/exportUtils.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Poem } from "./types";
import { sanitizeFilename } from "./utils";

/**
 * Apply vintage CSS filter to canvas for that authentic film grain look
 */
function applyVintageFilter(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Apply sepia tone
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Sepia formula
    data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
    data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
    data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
  }

  // Add noise/grain
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 10 - 5;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Add vintage watermark to canvas
 */
function addWatermark(
  canvas: HTMLCanvasElement,
  text: string = "Scrapo.ai"
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Watermark styling
  ctx.font = "14px 'Courier New', monospace";
  ctx.fillStyle = "rgba(42, 42, 42, 0.3)";
  ctx.textAlign = "center";

  // Draw watermark at bottom
  const y = canvas.height - 20;
  ctx.fillText(`${text} • ${date}`, canvas.width / 2, y);
}

/**
 * Export poem as PNG with vintage aesthetic
 */
export async function exportAsPNG(
  elementId: string,
  filename: string = "poem"
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Element not found for export");
    }

    // Capture element as canvas
    const canvas = await html2canvas(element, {
      backgroundColor: "#FDFBF7",
      scale: 2, // High quality
      logging: false,
      useCORS: true,
    });

    // Apply vintage filter
    const filteredCanvas = applyVintageFilter(canvas);

    // Add watermark
    addWatermark(filteredCanvas);

    // Convert to blob and download
    filteredCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeFilename(filename)}.png`;
      link.click();

      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (error) {
    console.error("PNG Export Error:", error);
    throw error;
  }
}

/**
 * Export poem as PDF with beautiful vintage layout
 */
export async function exportAsPDF(poem: Poem): Promise<void> {
  try {
    // Create PDF with vintage paper size (A5 landscape for aesthetic)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5", // 148 x 210 mm (vintage postcard size)
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Margins
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Background color (vintage paper)
    pdf.setFillColor(253, 251, 247); // vintage-paper
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Add decorative border
    pdf.setDrawColor(197, 160, 89); // faded-gold
    pdf.setLineWidth(0.5);
    pdf.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - margin * 2 + 10);

    // Add corner decorations
    const cornerSize = 5;
    pdf.setLineWidth(1);
    // Top-left
    pdf.line(margin, margin, margin + cornerSize, margin);
    pdf.line(margin, margin, margin, margin + cornerSize);
    // Top-right
    pdf.line(pageWidth - margin - cornerSize, margin, pageWidth - margin, margin);
    pdf.line(pageWidth - margin, margin, pageWidth - margin, margin + cornerSize);
    // Bottom-left
    pdf.line(margin, pageHeight - margin - cornerSize, margin, pageHeight - margin);
    pdf.line(margin, pageHeight - margin, margin + cornerSize, pageHeight - margin);
    // Bottom-right
    pdf.line(pageWidth - margin, pageHeight - margin - cornerSize, pageWidth - margin, pageHeight - margin);
    pdf.line(pageWidth - margin - cornerSize, pageHeight - margin, pageWidth - margin, pageHeight - margin);

    let yPosition = margin + 10;

    // Title
    pdf.setFont("times", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(42, 42, 42); // ink-black
    const titleLines = pdf.splitTextToSize(poem.title, contentWidth);
    pdf.text(titleLines, pageWidth / 2, yPosition, { align: "center" });
    yPosition += titleLines.length * 8 + 5;

    // Decorative line under title
    pdf.setDrawColor(197, 160, 89);
    pdf.setLineWidth(0.3);
    const lineWidth = 40;
    pdf.line(
      pageWidth / 2 - lineWidth / 2,
      yPosition,
      pageWidth / 2 + lineWidth / 2,
      yPosition
    );
    yPosition += 8;

    // Mood badge
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(139, 0, 0); // cherry-red
    pdf.text(poem.mood.toUpperCase(), pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Poem content
    pdf.setFont("courier", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(42, 42, 42);
    
    // Clean content (remove markdown and HTML)
    const cleanContent = poem.content
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1");

    const contentLines = pdf.splitTextToSize(cleanContent, contentWidth - 10);
    
    // Check if content fits, otherwise adjust font size
    const lineHeight = 6;
    const availableHeight = pageHeight - yPosition - margin - 20;
    const requiredHeight = contentLines.length * lineHeight;

    if (requiredHeight > availableHeight) {
      // Reduce font size to fit
      pdf.setFontSize(9);
      const newContentLines = pdf.splitTextToSize(cleanContent, contentWidth - 10);
      pdf.text(newContentLines, pageWidth / 2, yPosition, {
        align: "center",
        maxWidth: contentWidth - 10,
      });
      yPosition += newContentLines.length * 5;
    } else {
      pdf.text(contentLines, pageWidth / 2, yPosition, {
        align: "center",
        maxWidth: contentWidth - 10,
      });
      yPosition += contentLines.length * lineHeight;
    }

    // Date at bottom
    yPosition = pageHeight - margin - 8;
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(44, 62, 80); // melancholy-blue
    const date = new Date(poem.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    pdf.text(date, pageWidth / 2, yPosition, { align: "center" });

    // Watermark at bottom
    yPosition += 5;
    pdf.setFontSize(7);
    pdf.setTextColor(42, 42, 42, 0.3);
    pdf.text("Scrapo.ai", pageWidth / 2, yPosition, { align: "center" });

    // Save PDF
    pdf.save(`${sanitizeFilename(poem.title)}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  }
}