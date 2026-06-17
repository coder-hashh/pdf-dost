"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="animated-bg flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-md"
      >
        {/* SVG Illustration */}
        <div className="relative mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-primary/10">
          <FileQuestion className="h-20 w-20 text-primary" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
          />
        </div>

        {/* Status code */}
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
          404 Error
        </span>

        {/* Heading */}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mt-4 text-base text-muted-foreground">
          Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="h-11 px-6 rounded-lg gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild className="gradient-primary text-white h-11 px-6 rounded-lg gap-2 shadow-md">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
