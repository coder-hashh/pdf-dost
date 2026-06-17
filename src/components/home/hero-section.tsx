"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="animated-bg relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Free &amp; Open PDF Tools</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          All{" "}
          <span className="gradient-text">PDF Tools</span>{" "}
          in One Place
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Merge, Split, Compress, Convert, Edit and Protect PDF Files Online for
          Free.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button
            asChild
            size="lg"
            className="gradient-primary h-12 min-w-[160px] rounded-xl text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
          >
            <Link href="/tools">
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 min-w-[160px] rounded-xl text-base font-semibold transition-all"
          >
            <Link href="#tools">Explore Tools</Link>
          </Button>
        </motion.div>

        {/* Floating PDF Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pointer-events-none mt-16 flex justify-center"
        >
          <motion.svg
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            width="120"
            height="140"
            viewBox="0 0 120 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* Page body */}
            <rect
              x="10"
              y="10"
              width="80"
              height="110"
              rx="8"
              fill="var(--card)"
              stroke="var(--border)"
              strokeWidth="2"
            />
            {/* Folded corner */}
            <path
              d="M70 10L90 30H78C73.5817 30 70 26.4183 70 22V10Z"
              fill="var(--muted)"
              stroke="var(--border)"
              strokeWidth="2"
            />
            {/* PDF text */}
            <text
              x="50"
              y="78"
              textAnchor="middle"
              className="fill-primary"
              fontWeight="800"
              fontSize="24"
              fontFamily="var(--font-sans)"
            >
              PDF
            </text>
            {/* Lines */}
            <rect
              x="24"
              y="92"
              width="52"
              height="4"
              rx="2"
              className="fill-muted-foreground/20"
            />
            <rect
              x="24"
              y="102"
              width="36"
              height="4"
              rx="2"
              className="fill-muted-foreground/20"
            />
          </motion.svg>
        </motion.div>
      </div>

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
    </section>
  );
}
