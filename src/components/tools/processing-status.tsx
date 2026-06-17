"use client";

import { motion, AnimatePresence } from "motion/react";
import { Loader2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ProcessingState = "idle" | "uploading" | "processing" | "success" | "error";

interface ProcessingStatusProps {
  state: ProcessingState;
  progress?: number;
  errorMessage?: string;
  onRetry?: () => void;
}

const STATUS_CONFIG: Record<
  Exclude<ProcessingState, "idle">,
  { label: string; sublabel: string }
> = {
  uploading: { label: "Uploading...", sublabel: "Sending your files to our server" },
  processing: { label: "Processing...", sublabel: "This may take a few moments" },
  success: { label: "Done!", sublabel: "Your file is ready to download" },
  error: { label: "Something went wrong", sublabel: "Please try again" },
};

export function ProcessingStatus({
  state,
  progress = 0,
  errorMessage,
  onRetry,
}: ProcessingStatusProps) {
  if (state === "idle") return null;

  const config = STATUS_CONFIG[state];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex flex-col items-center gap-4 rounded-xl border p-8",
          state === "success" && "border-green-500/30 bg-green-500/5",
          state === "error" && "border-destructive/30 bg-destructive/5",
          (state === "uploading" || state === "processing") &&
            "border-primary/30 bg-primary/5 animate-pulse-glow"
        )}
      >
        {/* Icon */}
        <div className="relative">
          {(state === "uploading" || state === "processing") && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12 text-primary" />
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <XCircle className="h-12 w-12 text-destructive" />
            </motion.div>
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-lg font-semibold">{config.label}</p>
          <p className="text-sm text-muted-foreground">
            {state === "error" && errorMessage ? errorMessage : config.sublabel}
          </p>
        </div>

        {/* Progress bar */}
        {(state === "uploading" || state === "processing") && (
          <div className="w-full max-w-xs">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Retry */}
        {state === "error" && onRetry && (
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
