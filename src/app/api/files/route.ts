import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/services/file-manager"

export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam) : undefined

    // Retrieve active (unexpired) files from DB
    const now = new Date()
    const files = await prisma.file.findMany({
      where: {
        userId,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    // Compute stats
    const totalCount = await prisma.file.count({
      where: { userId },
    })

    const activeCount = await prisma.file.count({
      where: {
        userId,
        expiresAt: { gt: now },
      },
    })

    const totalSizeAggregate = await prisma.file.aggregate({
      where: {
        userId,
        expiresAt: { gt: now },
      },
      _sum: {
        fileSize: true,
      },
    })

    return NextResponse.json({
      files,
      totalCount,
      activeCount,
      totalSizeBytes: totalSizeAggregate._sum.fileSize || 0,
    })
  } catch (error) {
    console.error("GET user files error:", error)
    return NextResponse.json({ error: "Failed to retrieve files" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Retrieve the file to ensure ownership
    const file = await prisma.file.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    if (file.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete file from disk
    if (file.resultPath) {
      await deleteFile(file.resultPath).catch(() => {})
    }

    // Delete record from DB
    await prisma.file.delete({
      where: { id },
    })

    return NextResponse.json({ message: "File successfully deleted" })
  } catch (error) {
    console.error("DELETE user file error:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
