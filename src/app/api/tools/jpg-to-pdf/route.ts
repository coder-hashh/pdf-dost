import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { imagesToPdf } from "@/services/pdf/jpg-to-pdf";
import { logActivity } from "@/services/activity-logger";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "At least one image file is required" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    for (const file of files) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a valid image (JPG, PNG, WEBP)` },
          { status: 400 }
        );
      }
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 20MB size limit` },
          { status: 400 }
        );
      }
    }

    const buffers = await Promise.all(
      files.map(async (file) => Buffer.from(await file.arrayBuffer()))
    );

    const pdfBuffer = await imagesToPdf(buffers);

    // Log activity
    const session = await auth();
    await logActivity(
      session?.user?.id || null,
      "jpg_to_pdf",
      `Converted ${files.length} images to PDF`,
      request
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="images.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("JPG to PDF error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to convert images to PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
