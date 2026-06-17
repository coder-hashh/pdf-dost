import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { compressPdf } from "@/services/pdf/compress";
import {
  saveUploadedFile,
  getProcessedFilePath,
  deleteFile,
} from "@/services/file-manager";
import { logActivity } from "@/services/activity-logger";

export async function POST(request: Request) {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("files")) as File | null;
    const level = (formData.get("level") as string) || "medium";

    if (!file) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    if (!["low", "medium", "high"].includes(level)) {
      return NextResponse.json(
        { error: "Invalid compression level. Use: low, medium, or high" },
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

    // Save to temp files
    inputPath = await saveUploadedFile(buffer, file.name);
    outputPath = await getProcessedFilePath("compressed.pdf");

    await compressPdf(
      inputPath,
      outputPath,
      level as "low" | "medium" | "high"
    );

    const resultBuffer = await readFile(outputPath);

    // Log activity
    const session = await auth();
    await logActivity(
      session?.user?.id || null,
      "compress_pdf",
      `Compressed PDF (${level}): ${file.name}`,
      request
    );

    return new NextResponse(new Uint8Array(resultBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
        "Content-Length": resultBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Compress PDF error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to compress PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    // Cleanup temp files
    if (inputPath) await deleteFile(inputPath).catch(() => {});
    if (outputPath) await deleteFile(outputPath).catch(() => {});
  }
}
