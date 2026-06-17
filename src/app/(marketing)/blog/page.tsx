"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Calendar, User, Clock, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  authorName: string
  createdAt: string
}

export default function BlogListingPage() {
  const [posts, setPosts] = React.useState<BlogPost[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/blog")
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error("Error loading blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <div className="animated-bg min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            PDF Dost Blog
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Latest Articles &amp; Guides
          </h1>
          <p className="text-lg text-muted-foreground">
            Tips, tutorials, and productivity guides to help you work smarter with PDF documents.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="overflow-hidden h-[420px] flex flex-col justify-between animate-pulse">
                <div className="h-48 w-full bg-muted" />
                <div className="p-5 flex-1 space-y-3">
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-5/6 bg-muted rounded" />
                </div>
                <div className="p-5 border-t h-16 bg-muted/20" />
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-xl space-y-4 max-w-md mx-auto">
            <h3 className="text-xl font-bold">No articles yet</h3>
            <p className="text-muted-foreground text-sm">
              We're currently writing helpful articles. Check back soon for fresh content!
            </p>
            <Button asChild className="gradient-primary text-white">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-border group">
                  {/* Image wrapper */}
                  <div className="h-48 w-full overflow-hidden bg-muted relative">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary">
                        <svg
                          width="48"
                          height="52"
                          viewBox="0 0 28 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="opacity-40"
                        >
                          <rect
                            x="1"
                            y="1"
                            width="20"
                            height="26"
                            rx="4"
                            fill="currentColor"
                            fillOpacity="0.1"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </CardContent>

                  {/* Footer */}
                  <CardFooter className="p-5 border-t bg-muted/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {post.authorName}
                    </span>
                    <Button asChild variant="link" className="p-0 text-sm font-bold gap-1 text-primary group-hover:underline">
                      <Link href={`/blog/${post.slug}`}>
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
