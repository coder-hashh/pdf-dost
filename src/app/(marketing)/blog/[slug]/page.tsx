"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Calendar, User, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  authorName: string
  createdAt: string
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [post, setPost] = React.useState<BlogPost | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    async function fetchPostDetail() {
      try {
        const { slug } = await params
        const response = await fetch(`/api/blog/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setPost(data.post)
        } else {
          setError("Article not found.")
        }
      } catch (err) {
        console.error(err)
        setError("An error occurred loading the article.")
      } finally {
        setLoading(false)
      }
    }

    fetchPostDetail()
  }, [params])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="animated-bg flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">{error || "Article not found"}</h2>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          The blog post you are trying to view doesn't exist or has been unpublished.
        </p>
        <Button asChild className="gradient-primary text-white">
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    )
  }

  return (
    <article className="animated-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-3xl space-y-8">
        {/* Back Link */}
        <Button asChild variant="ghost" size="sm" className="gap-1.5 self-start">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blog</span>
          </Link>
        </Button>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="h-[350px] w-full overflow-hidden rounded-2xl bg-muted border relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Article Meta */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.authorName}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed italic border-l-4 pl-4 py-1">
            {post.excerpt}
          </p>
        </div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="prose prose-neutral dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed whitespace-pre-wrap space-y-6 pt-4"
        >
          {post.content}
        </motion.div>
      </div>
    </article>
  )
}
