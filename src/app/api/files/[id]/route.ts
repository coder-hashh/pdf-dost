import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { prisma } from "@/lib/prisma"
import { existsSync } from "fs"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15, route params is a Promise
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Retrieve file record
    const fileRecord = await prisma.file.findUnique({
      where: { id },
    })

    if (!fileRecord) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Check expiration
    const now = new Date()
    if (fileRecord.expiresAt < now) {
      return NextResponse.json({ error: "File has expired and been deleted" }, { status: 410 })
    }

    if (!fileRecord.resultPath || !existsSync(fileRecord.resultPath)) {
      return NextResponse.json({ error: "File physical content not found on server" }, { status: 404 })
    }

    const fileBuffer = await readFile(fileRecord.resultPath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": fileRecord.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileRecord.originalName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Download file API error:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
