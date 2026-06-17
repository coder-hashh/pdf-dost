import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { libreofficeConvert } from "@/services/pdf/libreoffice-convert"
import {
  saveUploadedFile,
  getProcessedDir,
  deleteFile,
} from "@/services/file-manager"
import { logActivity } from "@/services/activity-logger"
import path from "path"

export async function POST(request: Request) {
  let inputPath: string | null = null
  let outputPath: string | null = null

  try {
    const formData = await request.formData()
    const file = formData.get("files") as File | null // client uploads as 'files' based on our tool pages

    if (!file) {
      return NextResponse.json({ error: "A file is required" }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    if (![".docx", ".doc"].includes(ext)) {
      return NextResponse.json({ error: "File must be a Word document (.doc or .docx)" }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    inputPath = await saveUploadedFile(buffer, file.name)
    
    // LibreOffice converts in the processed directory and returns the path
    const processedDir = getProcessedDir()
    outputPath = await libreofficeConvert(inputPath, processedDir, "pdf")

    const resultBuffer = await readFile(outputPath)

    // Save File record in DB for tracking if authenticated
    const session = await auth()
    const userId = session?.user?.id || null

    if (userId) {
      await prisma.file.create({
        data: {
          userId,
          originalName: file.name,
          generatedName: path.basename(outputPath),
          fileSize: resultBuffer.length,
          mimeType: "application/pdf",
          toolUsed: "word-to-pdf",
          status: "COMPLETED",
          filePath: "", // We can clear the input file path as we delete it below
          resultPath: outputPath,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
    }

    // Log Activity
    await logActivity(
      userId,
      "word_to_pdf",
      `Converted Word document to PDF: ${file.name}`,
      request
    )

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}.pdf"`,
        "Content-Length": resultBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Word to PDF conversion error:", error)
    const message = error instanceof Error ? error.message : "Failed to convert Word to PDF"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (inputPath) await deleteFile(inputPath).catch(() => {})
    // Note: If userId exists, we keep the outputPath on disk for dashboard download. Otherwise delete it.
    const session = await auth()
    if (!session?.user?.id && outputPath) {
      await deleteFile(outputPath).catch(() => {})
    }
  }
}
