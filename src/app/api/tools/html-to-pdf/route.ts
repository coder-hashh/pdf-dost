import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { htmlToPdf } from "@/services/pdf/html-to-pdf"
import { getProcessedFilePath, deleteFile } from "@/services/file-manager"
import { logActivity } from "@/services/activity-logger"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  let outputPath: string | null = null

  try {
    const { html, pageSize } = await request.json()

    if (!html || !html.trim()) {
      return NextResponse.json({ error: "HTML content is required" }, { status: 400 })
    }

    const format = pageSize || "A4"
    if (!["A4", "Letter", "Legal"].includes(format)) {
      return NextResponse.json({ error: "Invalid page size" }, { status: 400 })
    }

    const pdfBuffer = await htmlToPdf(html, { format })

    // Save to processed folder if authenticated
    const session = await auth()
    const userId = session?.user?.id || null

    if (userId) {
      outputPath = await getProcessedFilePath("generated.pdf")
      await writeFile(outputPath, pdfBuffer)

      await prisma.file.create({
        data: {
          userId,
          originalName: "generated.pdf",
          generatedName: path.basename(outputPath),
          fileSize: pdfBuffer.length,
          mimeType: "application/pdf",
          toolUsed: "html-to-pdf",
          status: "COMPLETED",
          filePath: "",
          resultPath: outputPath,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
    }

    await logActivity(
      userId,
      "html_to_pdf",
      `Generated PDF from HTML content`,
      request
    )

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="generated.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("HTML to PDF generation error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate PDF from HTML"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    // If user is not logged in, we didn't save outputPath to DB, so we don't have to clean it up.
    // If user is logged in, we keep the processed file.
  }
}
