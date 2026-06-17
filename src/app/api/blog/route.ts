import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("GET blog posts error:", error)
    return NextResponse.json({ error: "Failed to retrieve blog posts" }, { status: 500 })
  }
}
