import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

interface ImageDimensions {
  width: number;
  height: number;
  buffer: Buffer;
  format: "jpeg" | "png";
}

/**
 * Process an image buffer with sharp, converting to JPEG or PNG as needed.
 */
async function processImage(imageBuffer: Buffer): Promise<ImageDimensions> {
  const metadata = await sharp(imageBuffer).metadata();

  // Determine if the image has transparency (use PNG) or not (use JPEG)
  const hasAlpha = metadata.hasAlpha ?? false;
  const format = hasAlpha ? "png" : "jpeg";

  let processed: Buffer;
  if (format === "jpeg") {
    processed = await sharp(imageBuffer)
      .rotate()
      .jpeg({ quality: 95 })
      .toBuffer();
  } else {
    processed = await sharp(imageBuffer)
      .rotate()
      .png({ quality: 95 })
      .toBuffer();
  }

  const processedMeta = await sharp(processed).metadata();

  return {
    width: processedMeta.width ?? 612,
    height: processedMeta.height ?? 792,
    buffer: processed,
    format,
  };
}

/**
 * Convert multiple image buffers into a single PDF document.
 * Each image becomes a page in the PDF, sized to fit the image dimensions.
 * @param imageBuffers - Array of image file buffers
 * @returns A buffer containing the resulting PDF
 */
export async function imagesToPdf(imageBuffers: Buffer[]): Promise<Buffer> {
  if (imageBuffers.length === 0) {
    throw new Error("At least one image is required");
  }

  const pdfDoc = await PDFDocument.create();

  for (const imageBuffer of imageBuffers) {
    const processed = await processImage(imageBuffer);

    let embeddedImage;
    if (processed.format === "jpeg") {
      try {
        embeddedImage = await pdfDoc.embedJpg(processed.buffer);
      } catch (embedError) {
        console.warn("embedJpg failed, falling back to PNG conversion:", embedError);
        // Fallback: convert to PNG
        const fallbackPng = await sharp(imageBuffer)
          .rotate()
          .png({ quality: 95 })
          .toBuffer();
        embeddedImage = await pdfDoc.embedPng(fallbackPng);
      }
    } else {
      embeddedImage = await pdfDoc.embedPng(processed.buffer);
    }

    // Scale image to fit within standard page size while maintaining aspect ratio
    const maxWidth = 612; // Letter width in points (8.5")
    const maxHeight = 792; // Letter height in points (11")

    const imageAspect = processed.width / processed.height;
    let pageWidth: number;
    let pageHeight: number;

    if (processed.width <= maxWidth && processed.height <= maxHeight) {
      // Image fits within page, use image dimensions
      pageWidth = processed.width;
      pageHeight = processed.height;
    } else if (imageAspect > maxWidth / maxHeight) {
      // Image is wider relative to page
      pageWidth = maxWidth;
      pageHeight = maxWidth / imageAspect;
    } else {
      // Image is taller relative to page
      pageHeight = maxHeight;
      pageWidth = maxHeight * imageAspect;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
