import { PDFDocument } from "pdf-lib";

/**
 * Parse page range string like '1-3, 5, 7-9' into an array of zero-indexed page numbers.
 */
function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid page range: "${part}"`);
      }
      if (start < 1 || end < 1) {
        throw new Error(`Page numbers must be at least 1: "${part}"`);
      }
      if (start > end) {
        throw new Error(`Invalid range: start (${start}) > end (${end})`);
      }
      if (end > totalPages) {
        throw new Error(
          `Page ${end} exceeds total pages (${totalPages})`
        );
      }

      for (let i = start; i <= end; i++) {
        pages.add(i - 1); // Convert to zero-indexed
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page)) {
        throw new Error(`Invalid page number: "${part}"`);
      }
      if (page < 1 || page > totalPages) {
        throw new Error(
          `Page ${page} is out of range (1-${totalPages})`
        );
      }
      pages.add(page - 1); // Convert to zero-indexed
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Split a PDF by extracting specific pages based on a range string.
 * @param buffer - The source PDF buffer
 * @param pageRanges - Page ranges like '1-3, 5, 7-9'
 * @returns A buffer containing the extracted pages as a new PDF
 */
export async function splitPdf(
  buffer: Buffer,
  pageRanges: string
): Promise<Buffer> {
  const srcDoc = await PDFDocument.load(buffer);
  const totalPages = srcDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error("The PDF document has no pages");
  }

  const pageIndices = parsePageRanges(pageRanges, totalPages);

  if (pageIndices.length === 0) {
    throw new Error("No valid pages specified");
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  const pdfBytes = await newDoc.save();
  return Buffer.from(pdfBytes);
}
