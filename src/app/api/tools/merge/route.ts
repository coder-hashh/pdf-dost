import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mergePdfs } from "@/services/pdf/merge";
import { logActivity } from "@/services/activity-logger";
import { getProcessedFilePath } from "@/services/file-manager";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: "At least 2 PDF files are required for merging" },
        { status: 400 }
      );
    }

    // Validate all files are PDFs
    for (const file of files) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a valid PDF` },
          { status: 400 }
        );
      }
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 50MB size limit` },
          { status: 400 }
        );
      }
    }

    // Convert files to buffers
    const buffers = await Promise.all(
      files.map(async (file) => Buffer.from(await file.arrayBuffer()))
    );

    const mergedBuffer = await mergePdfs(buffers);

    const session = await auth();
    const userId = session?.user?.id || null;
    let outputPath: string | null = null;

    if (userId) {
      outputPath = await getProcessedFilePath("merged.pdf");
      await writeFile(outputPath, mergedBuffer);

      await prisma.file.create({
        data: {
          userId,
          originalName: "merged.pdf",
          generatedName: path.basename(outputPath),
          fileSize: mergedBuffer.length,
          mimeType: "application/pdf",
          toolUsed: "merge-pdf",
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
      "merge_pdf",
      `Merged ${files.length} PDFs`,
      request
    );

    return new NextResponse(new Uint8Array(mergedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
        "Content-Length": mergedBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Merge PDF error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to merge PDFs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
