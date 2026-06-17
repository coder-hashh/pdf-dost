import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile, cleanupExpiredFiles } from "@/services/file-manager"

export async function GET() {
  try {
    const session = await auth()
    const isAdmin = session?.user?.role === "ADMIN"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const files = await prisma.file.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Admin files GET error:", error)
    return NextResponse.json({ error: "Failed to retrieve system files" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    const isAdmin = session?.user?.role === "ADMIN"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const expiredOnly = searchParams.get("expiredOnly")
    const id = searchParams.get("id")

    if (expiredOnly === "true") {
      const count = await cleanupExpiredFiles()
      
      // Also delete corresponding records from DB that have expired
      const now = new Date()
      await prisma.file.deleteMany({
        where: {
          expiresAt: { lte: now },
        },
      })

      return NextResponse.json({ message: "Expired files successfully cleared", count })
    }

    if (!id) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    const file = await prisma.file.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Delete file from disk
    if (file.resultPath) {
      await deleteFile(file.resultPath).catch(() => {})
    }

    // Delete record from DB
    await prisma.file.delete({
      where: { id },
    })

    return NextResponse.json({ message: "File successfully deleted from system storage" })
  } catch (error) {
    console.error("Admin files DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete files" }, { status: 500 })
  }
}
