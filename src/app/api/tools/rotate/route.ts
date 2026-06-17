import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rotatePdf } from "@/services/pdf/rotate";
import { logActivity } from "@/services/activity-logger";

function parsePages(rangeStr: string): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page)) {
        pages.add(page);
      }
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("files")) as File | null;
    const rotation = (formData.get("rotation") || formData.get("angle")) as string | null;
    const pagesStr = (formData.get("pages") || formData.get("applyTo")) as string | null;
    const selectedPagesStr = (formData.get("selectedPages") || formData.get("pages")) as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "A PDF file is required" },
        { status: 400 }
      );
    }

    if (!rotation || !["90", "180", "270"].includes(rotation)) {
      return NextResponse.json(
        { error: "Rotation must be 90, 180, or 270 degrees" },
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
    const rotationAngle = parseInt(rotation, 10);

    // Parse selected pages if provided
    let selectedPages: number[] | undefined;
    if ((pagesStr === "selected" || pagesStr === "applyTo") && selectedPagesStr) {
      try {
        if (selectedPagesStr.startsWith("[")) {
          selectedPages = JSON.parse(selectedPagesStr) as number[];
        } else {
          selectedPages = parsePages(selectedPagesStr);
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid selectedPages format" },
          { status: 400 }
        );
      }
    }

    const resultBuffer = await rotatePdf(buffer, rotationAngle, selectedPages);

    // Log activity
    const session = await auth();
    await logActivity(
      session?.user?.id || null,
      "rotate_pdf",
      `Rotated PDF ${rotation}°: ${file.name}`,
      request
    );

    return new NextResponse(new Uint8Array(resultBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rotated.pdf"',
        "Content-Length": resultBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Rotate PDF error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to rotate PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
