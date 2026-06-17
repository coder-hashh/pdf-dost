"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/constants";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link href={`/tools/${tool.slug}`} className="group block h-full">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "glass relative flex h-full flex-col rounded-2xl p-6 transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/5",
          "border border-transparent hover:border-primary/20"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            tool.bgColor
          )}
        >
          <Icon className={cn("h-6 w-6", tool.color)} />
        </div>

        {/* Title */}
        <h3 className="mb-1 text-base font-semibold">{tool.title}</h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {tool.description}
        </p>
      </motion.div>
    </Link>
  );
}
