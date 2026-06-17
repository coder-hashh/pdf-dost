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
    const file = formData.get("files") as File | null

    if (!file) {
      return NextResponse.json({ error: "A PDF file is required" }, { status: 400 })
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a valid PDF" }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    inputPath = await saveUploadedFile(buffer, file.name)
    
    const processedDir = getProcessedDir()
    outputPath = await libreofficeConvert(inputPath, processedDir, "xlsx")

    const resultBuffer = await readFile(outputPath)

    const session = await auth()
    const userId = session?.user?.id || null

    if (userId) {
      await prisma.file.create({
        data: {
          userId,
          originalName: file.name,
          generatedName: path.basename(outputPath),
          fileSize: resultBuffer.length,
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          toolUsed: "pdf-to-excel",
          status: "COMPLETED",
          filePath: "",
          resultPath: outputPath,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
    }

    await logActivity(
      userId,
      "pdf_to_excel",
      `Converted PDF to Excel spreadsheet: ${file.name}`,
      request
    )

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}.xlsx"`,
        "Content-Length": resultBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("PDF to Excel conversion error:", error)
    const message = error instanceof Error ? error.message : "Failed to convert PDF to Excel"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (inputPath) await deleteFile(inputPath).catch(() => {})
    const session = await auth()
    if (!session?.user?.id && outputPath) {
      await deleteFile(outputPath).catch(() => {})
    }
  }
}
