import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { protectPdf } from "@/services/pdf/protect";
import {
  saveUploadedFile,
  getProcessedFilePath,
  deleteFile,
} from "@/services/file-manager";
import { logActivity } from "@/services/activity-logger";
import path from "path";

export async function POST(request: Request) {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("files")) as File | null;
    const password = formData.get("password") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
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
    outputPath = await getProcessedFilePath("protected.pdf");

    await protectPdf(inputPath, outputPath, password);

    const resultBuffer = await readFile(outputPath);

    // Save File record in DB for tracking if authenticated
    const session = await auth();
    const userId = session?.user?.id || null;

    if (userId) {
      await prisma.file.create({
        data: {
          userId,
          originalName: file.name,
          generatedName: path.basename(outputPath),
          fileSize: resultBuffer.length,
          mimeType: "application/pdf",
          toolUsed: "protect-pdf",
          status: "COMPLETED",
          filePath: "",
          resultPath: outputPath,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    // Log activity
    await logActivity(
      userId,
      "protect_pdf",
      `Protected PDF: ${file.name}`,
      request
    );

    return new NextResponse(new Uint8Array(resultBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="protected.pdf"',
        "Content-Length": resultBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Protect PDF error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to protect PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (inputPath) await deleteFile(inputPath).catch(() => {});
    
    // If not authenticated, delete the output file to free space
    const session = await auth();
    if (!session?.user?.id && outputPath) {
      await deleteFile(outputPath).catch(() => {});
    }
  }
}
