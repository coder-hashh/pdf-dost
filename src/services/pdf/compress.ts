import { existsSync } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type CompressionLevel = "low" | "medium" | "high";

const COMPRESSION_SETTINGS: Record<CompressionLevel, string> = {
  low: "/printer",
  medium: "/ebook",
  high: "/screen",
};

/**
 * Compress a PDF file using Ghostscript.
 * @param inputPath - Path to the input PDF file
 * @param outputPath - Path where the compressed PDF will be saved
 * @param level - Compression level: low, medium, or high
 */
export async function compressPdf(
  inputPath: string,
  outputPath: string,
  level: CompressionLevel
): Promise<void> {
  const setting = COMPRESSION_SETTINGS[level];

  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    `-dPDFSETTINGS=${setting}`,
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-dColorImageDownsampleType=/Bicubic",
    "-dGrayImageDownsampleType=/Bicubic",
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];

  let command = "gs";
  if (process.platform === "win32") {
    const winPaths = [
      "C:\\Program Files\\gs\\gs10.03.1\\bin\\gswin64c.exe",
      "C:\\Program Files\\gs\\gs10.02.1\\bin\\gswin64c.exe",
      "C:\\Program Files\\gs\\gs10.01.1\\bin\\gswin64c.exe",
      "C:\\Program Files (x86)\\gs\\gs10.03.1\\bin\\gswin64c.exe",
    ];
    const found = winPaths.find((p) => existsSync(p));
    if (found) {
      command = found;
    } else {
      command = "gswin64c";
    }
  }

  try {
    await execFileAsync(command, args, { timeout: 120_000 });
  } catch (error) {
    if (command === "gs") {
      try {
        await execFileAsync("gswin64c", args, { timeout: 120_000 });
      } catch (innerError) {
        const message =
          innerError instanceof Error ? innerError.message : "Unknown error";
        throw new Error(`Ghostscript compression failed: ${message}`);
      }
    } else {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Ghostscript compression failed: ${message}`);
    }
  }
}
