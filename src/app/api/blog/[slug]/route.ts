import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 })
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (!post || !post.published) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("GET blog post by slug error:", error)
    return NextResponse.json({ error: "Failed to retrieve blog post" }, { status: 500 })
  }
}
