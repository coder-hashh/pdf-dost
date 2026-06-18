import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { splitPdf } from "@/services/pdf/split";
import { logActivity } from "@/services/activity-logger";
import { getProcessedFilePath } from "@/services/file-manager";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("files")) as File | null;
    const pages = (formData.get("pages") || formData.get("pageRange")) as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    if (!pages) {
      return NextResponse.json(
        { error: "Page ranges are required (e.g., 1-3, 5, 7-9)" },
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
    const resultBuffer = await splitPdf(buffer, pages);

    const session = await auth();
    const userId = session?.user?.id || null;
    let outputPath: string | null = null;

    if (userId) {
      outputPath = await getProcessedFilePath("split.pdf");
      await writeFile(outputPath, resultBuffer);

      await prisma.file.create({
        data: {
          userId,
          originalName: "split.pdf",
          generatedName: path.basename(outputPath),
          fileSize: resultBuffer.length,
          mimeType: "application/pdf",
          toolUsed: "split-pdf",
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
      "split_pdf",
      `Split PDF: pages ${pages}`,
      request
    );

    return new NextResponse(new Uint8Array(resultBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="split.pdf"',
        "Content-Length": resultBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Split PDF error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to split PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
