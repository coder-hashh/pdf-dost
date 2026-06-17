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
 * Encrypt a PDF file with password protection using qpdf.
 * Uses AES-256 encryption with both user and owner passwords.
 * @param inputPath - Path to the input PDF file
 * @param outputPath - Path where the encrypted PDF will be saved
 * @param password - The password to protect the PDF with
 */
export async function protectPdf(
  inputPath: string,
  outputPath: string,
  password: string
): Promise<void> {
  const args = [
    "--encrypt",
    password, // user password
    password, // owner password
    "256",    // AES-256 encryption
    "--",
    inputPath,
    outputPath,
  ];

  try {
    const qpdfPath = getQpdfPath();
    await execFileAsync(qpdfPath, args, { timeout: 60_000 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`PDF encryption failed: ${message}`);
  }
}
