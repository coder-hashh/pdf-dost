import { PDFDocument, degrees } from "pdf-lib";

/**
 * Rotate pages in a PDF document.
 * @param buffer - The source PDF buffer
 * @param rotation - Rotation angle in degrees (90, 180, 270)
 * @param pages - Optional array of 1-indexed page numbers to rotate. If omitted, rotates all pages.
 * @returns A buffer containing the rotated PDF
 */
export async function rotatePdf(
  buffer: Buffer,
  rotation: number,
  pages?: number[]
): Promise<Buffer> {
  if (![90, 180, 270].includes(rotation)) {
    throw new Error("Rotation must be 90, 180, or 270 degrees");
  }

  const pdfDoc = await PDFDocument.load(buffer);
  const totalPages = pdfDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error("The PDF document has no pages");
  }

  const pagesToRotate = pages
    ? pages.map((p) => {
        if (p < 1 || p > totalPages) {
          throw new Error(
            `Page ${p} is out of range (1-${totalPages})`
          );
        }
        return p - 1; // Convert to zero-indexed
      })
    : Array.from({ length: totalPages }, (_, i) => i);

  for (const pageIndex of pagesToRotate) {
    const page = pdfDoc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotation));
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
