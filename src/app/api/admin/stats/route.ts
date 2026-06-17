import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    const isAdmin = session?.user?.role === "ADMIN"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    const usersCount = await prisma.user.count()
    const filesCount = await prisma.file.count()
    
    const activeFilesCount = await prisma.file.count({
      where: {
        expiresAt: { gt: now },
      },
    })

    const sizeAggregate = await prisma.file.aggregate({
      where: {
        expiresAt: { gt: now },
      },
      _sum: {
        fileSize: true,
      },
    })

    const unreadMessagesCount = await prisma.contactMessage.count({
      where: { read: false },
    })

    const recentLogsCount = await prisma.activityLog.count()

    return NextResponse.json({
      usersCount,
      filesCount,
      activeFilesCount,
      storageUsedBytes: sizeAggregate._sum.fileSize || 0,
      unreadMessagesCount,
      recentLogsCount,
    })
  } catch (error) {
    console.error("Admin stats GET error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
