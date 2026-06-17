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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users GET error:", error)
    return NextResponse.json({ error: "Failed to retrieve users" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    const isAdmin = session?.user?.role === "ADMIN"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, role } = await request.json()

    if (!userId || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Do not demote yourself
    if (userId === session?.user?.id) {
      return NextResponse.json({ error: "Cannot modify your own administrative privileges" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({ message: "User role updated successfully", user: updatedUser })
  } catch (error) {
    console.error("Admin user PATCH error:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}
