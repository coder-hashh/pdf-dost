"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Minimize2 } from "lucide-react";
import { cn, generateId, formatFileSize } from "@/lib/utils";
import { TOOLS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUploadZone } from "@/components/tools/file-upload-zone";
import { FileList, type FileItem } from "@/components/tools/file-list";
import {
  ProcessingStatus,
  type ProcessingState,
} from "@/components/tools/processing-status";
import { DownloadButton } from "@/components/tools/download-button";

const tool = TOOLS.find((t) => t.slug === "compress-pdf")!;

type CompressionLevel = "low" | "medium" | "high";

const compressionOptions: {
  value: CompressionLevel;
  label: string;
  description: string;
}[] = [
  { value: "low", label: "Low", description: "Best quality" },
  { value: "medium", label: "Medium", description: "Balanced" },
  { value: "high", label: "High", description: "Smallest size" },
];

export default function CompressPdfPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  const originalSize = files[0]?.size ?? 0;

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
    }));
    setFiles(items.slice(0, 1));
  }, []);

  const handleRemove = useCallback(() => {
    setFiles([]);
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;

    setState("uploading");
    setProgress(0);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("files", files[0].file);
      formData.append("level", level);

      setProgress(30);
      setState("processing");

      const response = await fetch("/api/tools/compress", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || "Failed to compress PDF"
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setDownloadUrl(url);
      setResultSize(blob.size);
      setState("success");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  const handleReset = () => {
    setFiles([]);
    setLevel("medium");
    setState("idle");
    setProgress(0);
    setDownloadUrl("");
    setResultSize(0);
    setErrorMessage("");
  };

  const savedPercent =
    originalSize > 0 && resultSize > 0
      ? Math.round(((originalSize - resultSize) / originalSize) * 100)
      : 0;

  return (
    <div className="animated-bg min-h-screen">
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div
            className={cn(
              "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl",
              tool.bgColor
            )}
          >
            <Minimize2 className={cn("h-8 w-8", tool.color)} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {tool.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{tool.longDescription}</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {state === "idle" || state === "error" ? (
            <>
              <FileUploadZone
                acceptedTypes={tool.acceptedTypes}
                maxFiles={tool.maxFiles}
                maxFileSize={tool.maxFileSize}
                onFilesAdded={handleFilesAdded}
              />

              <FileList
                files={files}
                onRemove={handleRemove}
                onReorder={() => {}}
              />

              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 rounded-xl border bg-card p-6"
                >
                  <Label className="text-sm font-medium">
                    Compression Level
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {compressionOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setLevel(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border p-4 transition-all",
                          level === opt.value
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <span className="text-sm font-semibold">
                          {opt.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {opt.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <Button
                    size="lg"
                    onClick={handleProcess}
                    className={cn(
                      "rounded-xl px-8 py-6 text-base font-semibold",
                      "bg-gradient-to-r from-primary to-accent text-white",
                      "hover:opacity-90 transition-opacity shadow-lg"
                    )}
                  >
                    <Minimize2 className="mr-2 h-5 w-5" />
                    Compress PDF
                  </Button>
                </motion.div>
              )}

              {state === "error" && (
                <ProcessingStatus
                  state={state}
                  errorMessage={errorMessage}
                  onRetry={() => setState("idle")}
                />
              )}
            </>
          ) : state === "success" && downloadUrl ? (
            <div className="space-y-4">
              {/* Size comparison */}
              {originalSize > 0 && resultSize > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-4 rounded-xl border bg-card p-4"
                >
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Original</p>
                    <p className="text-sm font-semibold">
                      {formatFileSize(originalSize)}
                    </p>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Compressed</p>
                    <p className="text-sm font-semibold text-green-500">
                      {formatFileSize(resultSize)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-bold text-green-500">
                    -{savedPercent}%
                  </div>
                </motion.div>
              )}

              <DownloadButton
                downloadUrl={downloadUrl}
                fileName="compressed.pdf"
                fileSize={resultSize}
                onProcessAnother={handleReset}
              />
            </div>
          ) : (
            <ProcessingStatus state={state} progress={progress} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
