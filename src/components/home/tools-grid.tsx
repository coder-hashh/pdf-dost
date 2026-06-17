"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TOOLS, TOOL_CATEGORIES, type ToolCategory } from "@/lib/constants";
import { ToolCard } from "@/components/tools/tool-card";
import { cn } from "@/lib/utils";

export function ToolsGrid() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("all");

  const filteredTools =
    activeCategory === "all"
      ? TOOLS
      : TOOLS.filter((tool) => tool.category === activeCategory);

  return (
    <section id="tools" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful{" "}
            <span className="gradient-text">PDF Tools</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Everything you need to work with PDFs. Fast, secure, and completely
            free.
          </p>
        </motion.div>

        {/* Category filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex flex-wrap items-center justify-center gap-2"
        >
          {TOOL_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                activeCategory === category.id
                  ? "gradient-primary text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
              }}
            >
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
