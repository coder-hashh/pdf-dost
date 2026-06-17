import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mergePdfs } from "@/services/pdf/merge";
import { logActivity } from "@/services/activity-logger";

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

    // Log activity
    const session = await auth();
    await logActivity(
      session?.user?.id || null,
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
