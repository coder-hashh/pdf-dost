import { execFile } from "child_process";
import { promisify } from "util";
import { existsSync, readdirSync } from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

function getQpdfPath(): string {
  if (process.platform !== "win32") return "qpdf";
  const exactPath = "C:\\Program Files\\qpdf 12.3.2\\bin\\qpdf.exe";
  if (existsSync(exactPath)) {
    return exactPath;
  }
  return "qpdf";
}

/**
 * Remove password protection from a PDF file using qpdf.
 * @param inputPath - Path to the encrypted PDF file
 * @param outputPath - Path where the decrypted PDF will be saved
 * @param password - The password to unlock the PDF
 */
export async function unlockPdf(
  inputPath: string,
  outputPath: string,
  password: string
): Promise<void> {
  const args = [
    `--password=${password}`,
    "--decrypt",
    inputPath,
    outputPath,
  ];

  try {
    const qpdfPath = getQpdfPath();
    await execFileAsync(qpdfPath, args, { timeout: 60_000 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("invalid password")) {
      throw new Error("Invalid password. Please check and try again.");
    }

    throw new Error(`PDF decryption failed: ${message}`);
  }
}
