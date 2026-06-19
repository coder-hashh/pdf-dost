import { existsSync, createWriteStream, readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { readdir, unlink } from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";
import { ZipArchive } from "archiver";
import { getTempDir, deleteDirectory } from "@/services/file-manager";

const execFileAsync = promisify(execFile);

/**
 * Convert a document using LibreOffice in headless mode.
 * @param inputPath - Path to the input file
 * @param outputDir - Directory where the converted file will be saved
 * @param format - Target format (e.g., 'pdf', 'docx', 'xlsx', 'pptx')
 * @returns Path to the converted file
 */
export async function libreofficeConvert(
  inputPath: string,
  outputDir: string,
  format: string
): Promise<string> {
  const isPdfInput = inputPath.toLowerCase().endsWith(".pdf");

  // If input is PDF and format is docx, convert using python pdf2docx with a fallback to LibreOffice
  if (isPdfInput && format === "docx") {
    const inputBasename = path.basename(inputPath, path.extname(inputPath));
    const expectedOutputPath = path.join(outputDir, `${inputBasename}.docx`);
    try {
      await convertPdfToDocxWithPython(inputPath, expectedOutputPath);
      return expectedOutputPath;
    } catch (error) {
      console.warn("Python pdf2docx conversion failed. Falling back to LibreOffice PDF import.", error);
    }
  }


  // If input is PDF and format is xlsx, perform a two-step conversion via HTML
  if (isPdfInput && format === "xlsx") {
    const tempHtmlPath = await libreofficeConvert(inputPath, outputDir, "html");
    try {
      const resultPath = await libreofficeConvert(tempHtmlPath, outputDir, "xlsx");
      return resultPath;
    } finally {
      await unlink(tempHtmlPath).catch(() => {});
    }
  }

  // Post-processing handles fixing DOCX VML duplicate IDs directly

  const args = [
    "--headless",
    "--norestore",
  ];

  if (isPdfInput) {
    if (format === "docx" || format === "doc") {
      args.push("--infilter=writer_pdf_import");
    } else if (format === "pptx") {
      args.push("--infilter=impress_pdf_import");
    } else if (format === "html") {
      args.push("--infilter=writer_pdf_import");
    }
  }

  // Force Calc HTML WebQuery filter when converting intermediate HTML to xlsx
  if (inputPath.toLowerCase().endsWith(".html") && format === "xlsx") {
    args.push("--infilter=calc_HTML_WebQuery");
  }

  args.push("--convert-to", format, "--outdir", outputDir, inputPath);

  let command = "libreoffice";
  if (process.platform === "win32") {
    const winPaths = [
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
    ];
    const found = winPaths.find((p) => existsSync(p));
    if (found) {
      command = found;
    }
  }

  try {
    await execFileAsync(command, args, {
      timeout: 120_000,
      env: {
        ...process.env,
        HOME: process.env.HOME || process.env.USERPROFILE || "/tmp",
      },
    });
  } catch (error) {
    if (command === "libreoffice") {
      try {
        await execFileAsync("soffice", args, {
          timeout: 120_000,
          env: {
            ...process.env,
            HOME: process.env.HOME || process.env.USERPROFILE || "/tmp",
          },
        });
      } catch (innerError) {
        const message =
          innerError instanceof Error ? innerError.message : "Unknown error";
        throw new Error(`LibreOffice conversion failed: ${message}`);
      }
    } else {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`LibreOffice conversion failed: ${message}`);
    }
  }

  // Find the output file
  const inputBasename = path.basename(inputPath, path.extname(inputPath));
  const expectedOutputName = `${inputBasename}.${format}`;
  const expectedOutputPath = path.join(outputDir, expectedOutputName);

  // Check if expected file exists, otherwise search for it
  const files = await readdir(outputDir);
  const outputFile = files.find(
    (f) => f === expectedOutputName || (f.startsWith(inputBasename) && f.toLowerCase().endsWith("." + format.toLowerCase()))
  );

  if (!outputFile) {
    throw new Error(
      `Conversion output file not found. Expected: ${expectedOutputName}`
    );
  }

  const resultPath = path.join(outputDir, outputFile) === expectedOutputPath
    ? expectedOutputPath
    : path.join(outputDir, outputFile);

  if (format === "docx") {
    await fixDocxCorruption(resultPath);
  }

  return resultPath;
}

/**
 * Fixes VML shape ID duplicate corruption in LibreOffice generated docx files.
 */
/**
 * Fixes VML shape ID duplicate corruption in LibreOffice generated docx files.
 * Uses archiver to rebuild the ZIP structure for full MS Word compatibility (especially Word 2007).
 */
async function fixDocxCorruption(docxPath: string): Promise<void> {
  let tempDir: string | null = null;
  try {
    tempDir = await getTempDir();

    // Extract DOCX using adm-zip
    const zip = new AdmZip(docxPath);
    zip.extractAllTo(tempDir, true);

    let shapeCounter = 0;

    // Recursively process files in directory
    function processDir(dir: string) {
      const files = readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativePath = path.relative(tempDir!, fullPath).replace(/\\/g, "/");

        if (statSync(fullPath).isDirectory()) {
          processDir(fullPath);
        } else if (relativePath.startsWith("word/") && file.endsWith(".xml")) {
          let xmlContent = readFileSync(fullPath, "utf-8");
          const originalContent = xmlContent;

          // Replace all instances of id="shape_X" to be globally unique
          xmlContent = xmlContent.replace(/id="shape_\d+"/g, () => {
            shapeCounter++;
            return `id="shape_${shapeCounter}"`;
          });

          // Replace corresponding spid="shape_X" to keep IDs in sync
          xmlContent = xmlContent.replace(/spid="shape_\d+"/g, () => {
            return `spid="shape_${shapeCounter}"`;
          });

          if (xmlContent !== originalContent) {
            writeFileSync(fullPath, xmlContent, "utf-8");
          }
        }
      }
    }

    processDir(tempDir);

    // Re-archive using archiver
    const outputStream = createWriteStream(docxPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    await new Promise<void>((resolve, reject) => {
      outputStream.on("close", () => resolve());
      archive.on("error", (err) => reject(err));
      archive.pipe(outputStream);
      archive.directory(tempDir!, false);
      archive.finalize();
    });
  } catch (error) {
    console.error("Failed to fix DOCX VML shape IDs:", error);
  } finally {
    if (tempDir) {
      await deleteDirectory(tempDir).catch(() => {});
    }
  }
}

/**
 * Execute the python pdf_to_docx script to convert PDF to DOCX using pdf2docx.
 */
async function convertPdfToDocxWithPython(inputPath: string, outputPath: string): Promise<void> {
  const scriptPath = path.join(process.cwd(), "scripts", "pdf_to_docx.py");
  const args = [scriptPath, inputPath, outputPath];
  
  let pythonError: Error | null = null;
  
  // Try 'python' first
  try {
    await execFileAsync("python", args, { timeout: 180_000 });
    return;
  } catch (error) {
    pythonError = error as Error;
  }
  
  // Try 'python3' as a fallback
  try {
    await execFileAsync("python3", args, { timeout: 180_000 });
    return;
  } catch (error) {
    throw new Error(
      `Python pdf2docx conversion failed. python error: ${pythonError?.message || "unknown"}. python3 error: ${(error as Error).message}`
    );
  }
}

