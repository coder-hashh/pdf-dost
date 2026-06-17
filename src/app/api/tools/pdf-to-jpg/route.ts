import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { pdfToImages } from "@/services/pdf/pdf-to-jpg";
import {
  saveUploadedFile,
  getTempDir,
  deleteFile,
  deleteDirectory,
} from "@/services/file-manager";
import { logActivity } from "@/services/activity-logger";
import { ZipArchive } from "archiver";


export async function POST(request: Request) {
  let inputPath: string | null = null;
  let tempDir: string | null = null;

  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("files")) as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File must be a valid PDF" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds the 50MB size limit" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    inputPath = await saveUploadedFile(buffer, file.name);
    tempDir = await getTempDir();

    const imagePaths = await pdfToImages(inputPath, tempDir);

    // If only one page, return single image
    if (imagePaths.length === 1) {
      const imageBuffer = await readFile(imagePaths[0]);

      const session = await auth();
      await logActivity(
        session?.user?.id || null,
        "pdf_to_jpg",
        `Converted PDF to 1 image`,
        request
      );

      return new NextResponse(new Uint8Array(imageBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": 'attachment; filename="page_1.jpg"',
          "Content-Length": imageBuffer.length.toString(),
        },
      });
    }

    // Multiple pages: create a zip archive
    const { Readable } = await import("stream");

    // Build zip in memory using archiver if available, otherwise send individual files info
    try {
      const archive = new ZipArchive({ zlib: { level: 5 } });
      const chunks: Buffer[] = [];

      await new Promise<void>((resolve, reject) => {
        archive.on("data", (chunk: Buffer) => chunks.push(chunk));
        archive.on("end", () => resolve());
        archive.on("error", (err: Error) => reject(err));

        for (let i = 0; i < imagePaths.length; i++) {
          const imgPath = imagePaths[i];
          const stream = Readable.from(
            (async function* () {
              yield await readFile(imgPath);
            })()
          );
          archive.append(stream, { name: `page_${i + 1}.jpg` });
        }

        archive.finalize();
      });

      const zipBuffer = Buffer.concat(chunks);

      const session = await auth();
      await logActivity(
        session?.user?.id || null,
        "pdf_to_jpg",
        `Converted PDF to ${imagePaths.length} images`,
        request
      );

      return new NextResponse(new Uint8Array(zipBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="pdf_images.zip"',
          "Content-Length": zipBuffer.length.toString(),
        },
      });
    } catch {
      // Fallback: return just the first image if archiver not available
      const imageBuffer = await readFile(imagePaths[0]);
      return new NextResponse(new Uint8Array(imageBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": 'attachment; filename="page_1.jpg"',
          "Content-Length": imageBuffer.length.toString(),
        },
      });
    }
  } catch (error) {
    console.error("PDF to JPG error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to convert PDF to images";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (inputPath) await deleteFile(inputPath).catch(() => {});
    if (tempDir) await deleteDirectory(tempDir).catch(() => {});
  }
}
