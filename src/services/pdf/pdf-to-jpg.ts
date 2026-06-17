import { existsSync } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { readdir } from "fs/promises";
import path from "path";

const execFileAsync = promisify(execFile);

/**
 * Convert PDF pages to JPEG images using Ghostscript.
 * @param inputPath - Path to the input PDF file
 * @param outputDir - Directory where the output images will be saved
 * @returns Array of paths to the generated image files
 */
export async function pdfToImages(
  inputPath: string,
  outputDir: string
): Promise<string[]> {
  const outputPattern = path.join(outputDir, "page_%d.jpg");

  const args = [
    "-sDEVICE=jpeg",
    "-dJPEGQ=95",
    "-r200",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-dSAFER",
    `-sOutputFile=${outputPattern}`,
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
        throw new Error(`PDF to image conversion failed: ${message}`);
      }
    } else {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`PDF to image conversion failed: ${message}`);
    }
  }

  // Read the output directory and return sorted file paths
  const files = await readdir(outputDir);
  const imageFiles = files
    .filter((f) => f.startsWith("page_") && f.endsWith(".jpg"))
    .sort((a, b) => {
      const numA = parseInt(a.replace("page_", "").replace(".jpg", ""), 10);
      const numB = parseInt(b.replace("page_", "").replace(".jpg", ""), 10);
      return numA - numB;
    })
    .map((f) => path.join(outputDir, f));

  if (imageFiles.length === 0) {
    throw new Error("No images were generated from the PDF");
  }

  return imageFiles;
}
