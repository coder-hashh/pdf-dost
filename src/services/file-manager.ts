import { mkdir, writeFile, unlink, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const STORAGE_BASE = process.env.STORAGE_PATH || path.join(process.cwd(), "storage");
const UPLOADS_DIR = path.join(STORAGE_BASE, "uploads");
const PROCESSED_DIR = path.join(STORAGE_BASE, "processed");
const TEMP_DIR = path.join(STORAGE_BASE, "temp");

const FILE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Ensure all required storage directories exist.
 */
export function ensureStorageDirectories(): void {
  const dirs = [STORAGE_BASE, UPLOADS_DIR, PROCESSED_DIR, TEMP_DIR];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      // Use sync version during initialization
      require("fs").mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Save an uploaded file to the uploads directory.
 * @param file - The file buffer to save
 * @param filename - The original filename
 * @returns The full path to the saved file
 */
export async function saveUploadedFile(
  file: Buffer,
  filename: string
): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true });

  const ext = path.extname(filename);
  const safeName = `${uuidv4()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, safeName);

  await writeFile(filePath, file);
  return filePath;
}

/**
 * Get a path in the processed directory for a file.
 * @param filename - The filename for the processed file
 * @returns The full path in the processed directory
 */
export async function getProcessedFilePath(
  filename: string
): Promise<string> {
  await mkdir(PROCESSED_DIR, { recursive: true });

  const ext = path.extname(filename);
  const safeName = `${uuidv4()}${ext}`;
  return path.join(PROCESSED_DIR, safeName);
}

/**
 * Get a temporary directory path for processing.
 * @returns Path to a unique temporary directory
 */
export async function getTempDir(): Promise<string> {
  const tempSubDir = path.join(TEMP_DIR, uuidv4());
  await mkdir(tempSubDir, { recursive: true });
  return tempSubDir;
}

/**
 * Delete a file from the filesystem.
 * @param filepath - The path to the file to delete
 */
export async function deleteFile(filepath: string): Promise<void> {
  try {
    await unlink(filepath);
  } catch (error) {
    // Ignore if file doesn't exist
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 * Delete a directory and all its contents.
 * @param dirPath - The path to the directory to delete
 */
export async function deleteDirectory(dirPath: string): Promise<void> {
  const { rm } = await import("fs/promises");
  try {
    await rm(dirPath, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Clean up files older than 24 hours from uploads, processed, and temp directories.
 * @returns The number of files deleted
 */
export async function cleanupExpiredFiles(): Promise<number> {
  let deletedCount = 0;
  const now = Date.now();
  const dirs = [UPLOADS_DIR, PROCESSED_DIR, TEMP_DIR];

  for (const dir of dirs) {
    if (!existsSync(dir)) continue;

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      try {
        const fileStat = await stat(fullPath);
        const ageMs = now - fileStat.mtimeMs;

        if (ageMs > FILE_EXPIRY_MS) {
          if (entry.isDirectory()) {
            await deleteDirectory(fullPath);
          } else {
            await unlink(fullPath);
          }
          deletedCount++;
        }
      } catch {
        // Skip files that can't be accessed
      }
    }
  }

  return deletedCount;
}

/**
 * Get the uploads directory path.
 */
export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

/**
 * Get the processed directory path.
 */
export function getProcessedDir(): string {
  return PROCESSED_DIR;
}

/**
 * Get the temp directory path.
 */
export function getTempBaseDir(): string {
  return TEMP_DIR;
}
