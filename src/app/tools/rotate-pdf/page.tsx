"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { RotateCw } from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import { TOOLS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileUploadZone } from "@/components/tools/file-upload-zone";
import { FileList, type FileItem } from "@/components/tools/file-list";
import {
  ProcessingStatus,
  type ProcessingState,
} from "@/components/tools/processing-status";
import { DownloadButton } from "@/components/tools/download-button";

const tool = TOOLS.find((t) => t.slug === "rotate-pdf")!;

type RotationAngle = 90 | 180 | 270;
type ApplyTo = "all" | "selected";

export default function RotatePdfPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [angle, setAngle] = useState<RotationAngle>(90);
  const [applyTo, setApplyTo] = useState<ApplyTo>("all");
  const [selectedPages, setSelectedPages] = useState("");
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

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
      formData.append("angle", angle.toString());
      formData.append("applyTo", applyTo);
      if (applyTo === "selected") {
        formData.append("pages", selectedPages);
      }

      setProgress(30);
      setState("processing");

      const response = await fetch("/api/tools/rotate", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || "Failed to rotate PDF"
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
    setAngle(90);
    setApplyTo("all");
    setSelectedPages("");
    setState("idle");
    setProgress(0);
    setDownloadUrl("");
    setResultSize(0);
    setErrorMessage("");
  };

  const angles: RotationAngle[] = [90, 180, 270];

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
            <RotateCw className={cn("h-8 w-8", tool.color)} />
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
                  className="space-y-6 rounded-xl border bg-card p-6"
                >
                  {/* Rotation angle */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Rotation Angle
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {angles.map((a) => (
                        <button
                          key={a}
                          onClick={() => setAngle(a)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                            angle === a
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <RotateCw
                            className="h-6 w-6 text-muted-foreground"
                            style={{
                              transform: `rotate(${a}deg)`,
                            }}
                          />
                          <span className="text-sm font-semibold">{a}°</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Apply to */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Apply To</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setApplyTo("all")}
                        className={cn(
                          "rounded-xl border p-3 text-sm font-medium transition-all",
                          applyTo === "all"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        All Pages
                      </button>
                      <button
                        onClick={() => setApplyTo("selected")}
                        className={cn(
                          "rounded-xl border p-3 text-sm font-medium transition-all",
                          applyTo === "selected"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        Selected Pages
                      </button>
                    </div>
                    {applyTo === "selected" && (
                      <Input
                        value={selectedPages}
                        onChange={(e) => setSelectedPages(e.target.value)}
                        placeholder="e.g., 1, 3, 5-7"
                        className="mt-2 rounded-lg"
                      />
                    )}
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
                    <RotateCw className="mr-2 h-5 w-5" />
                    Rotate PDF
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
            <DownloadButton
              downloadUrl={downloadUrl}
              fileName="rotated.pdf"
              fileSize={resultSize}
              onProcessAnother={handleReset}
            />
          ) : (
            <ProcessingStatus state={state} progress={progress} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
