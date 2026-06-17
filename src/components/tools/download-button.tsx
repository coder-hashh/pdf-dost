"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Download, Clock, RefreshCw, Link2, Check } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FILE_EXPIRY_HOURS } from "@/lib/constants";

interface DownloadButtonProps {
  downloadUrl: string;
  fileName: string;
  fileSize?: number;
  onProcessAnother: () => void;
}

export function DownloadButton({
  downloadUrl,
  fileName,
  fileSize,
  onProcessAnother,
}: DownloadButtonProps) {
  const [timeLeft, setTimeLeft] = useState(FILE_EXPIRY_HOURS * 60 * 60);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${downloadUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center gap-4 rounded-xl border border-green-500/30 bg-green-500/5 p-8"
    >
      {/* Download button */}
      <Button
        size="lg"
        onClick={handleDownload}
        className={cn(
          "gap-2 rounded-xl px-8 py-6 text-base font-semibold",
          "bg-gradient-to-r from-primary to-accent text-primary-foreground",
          "hover:opacity-90 transition-opacity shadow-lg"
        )}
      >
        <Download className="h-5 w-5" />
        Download {fileName}
      </Button>

      {/* File info */}
      {fileSize && (
        <p className="text-sm text-muted-foreground">
          File size: {formatFileSize(fileSize)}
        </p>
      )}

      {/* Expiry timer */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>
          {timeLeft > 0
            ? `File expires in ${formatTime(timeLeft)}`
            : "File has expired"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onProcessAnother}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Process Another
        </Button>
      </div>
    </motion.div>
  );
}
