import PDFMerger from "pdf-merger-js";

/**
 * Merge multiple PDF buffers into a single PDF document.
 * @param buffers - Array of PDF file buffers to merge
 * @returns A buffer containing the merged PDF
 */
export async function mergePdfs(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 0) {
    throw new Error("At least one PDF file is required for merging");
  }

  if (buffers.length === 1) {
    return buffers[0];
  }

  const merger = new PDFMerger();

  for (const buffer of buffers) {
    await merger.add(buffer);
  }

  const mergedBuffer = await merger.saveAsBuffer();
  return Buffer.from(mergedBuffer);
}
