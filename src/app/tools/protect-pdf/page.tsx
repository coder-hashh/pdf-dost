"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import { TOOLS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploadZone } from "@/components/tools/file-upload-zone";
import { FileList, type FileItem } from "@/components/tools/file-list";
import {
  ProcessingStatus,
  type ProcessingState,
} from "@/components/tools/processing-status";
import { DownloadButton } from "@/components/tools/download-button";

const tool = TOOLS.find((t) => t.slug === "protect-pdf")!;

export default function ProtectPdfPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleProcess = async () => {
    if (files.length === 0 || !passwordsMatch) return;

    setState("uploading");
    setProgress(0);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("files", files[0].file);
      formData.append("password", password);

      setProgress(30);
      setState("processing");

      const response = await fetch("/api/tools/protect", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { error?: string }).error || "Failed to protect PDF"
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
    setPassword("");
    setConfirmPassword("");
    setState("idle");
    setProgress(0);
    setDownloadUrl("");
    setResultSize(0);
    setErrorMessage("");
  };

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
            <Lock className={cn("h-8 w-8", tool.color)} />
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
                  {/* Password input */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a password"
                        className="rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className={cn(
                          "rounded-lg pr-10",
                          confirmPassword.length > 0 &&
                            !passwordsMatch &&
                            "border-destructive"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {files.length > 0 && passwordsMatch && (
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
                    <Lock className="mr-2 h-5 w-5" />
                    Protect PDF
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
              fileName="protected.pdf"
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
