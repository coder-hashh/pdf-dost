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

    const logs = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // retrieve last 100 logs for administration audits
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Admin logs GET error:", error)
    return NextResponse.json({ error: "Failed to retrieve logs" }, { status: 500 })
  }
}
