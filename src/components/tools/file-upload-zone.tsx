"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, FileWarning } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";

interface FileUploadZoneProps {
  acceptedTypes: string[];
  maxFiles: number;
  maxFileSize: number;
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export function FileUploadZone({
  acceptedTypes,
  maxFiles,
  maxFileSize,
  onFilesAdded,
  disabled = false,
}: FileUploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      const resolvedAcceptedFiles = [...acceptedFiles];
      const actualRejectedFiles: FileRejection[] = [];

      for (const rejection of rejectedFiles) {
        const file = rejection.file;
        const extension = "." + file.name.split(".").pop()?.toLowerCase();

        // Check if the file's extension or MIME type is in the acceptedTypes array
        const isExtensionAccepted = acceptedTypes.some(
          (type) => type.startsWith(".") && type.toLowerCase() === extension
        );

        const isMimeAccepted = acceptedTypes.some(
          (type) => !type.startsWith(".") && file.type && type.toLowerCase() === file.type.toLowerCase()
        );

        if (isExtensionAccepted || isMimeAccepted) {
          resolvedAcceptedFiles.push(file);
        } else {
          actualRejectedFiles.push(rejection);
        }
      }

      if (actualRejectedFiles.length > 0) {
        const firstError = actualRejectedFiles[0].errors[0];
        if (firstError) {
          const message = firstError.code === "file-invalid-type"
            ? `File type not supported. Please upload: ${acceptedTypes.filter(t => t.startsWith(".")).join(", ")}`
            : firstError.message;
          setError(message);
        }
        return;
      }

      if (resolvedAcceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`);
        return;
      }

      const oversizedFiles = resolvedAcceptedFiles.filter((f) => f.size > maxFileSize);
      if (oversizedFiles.length > 0) {
        setError(
          `File "${oversizedFiles[0].name}" exceeds the ${formatFileSize(maxFileSize)} limit`
        );
        return;
      }

      onFilesAdded(resolvedAcceptedFiles);
    },
    [maxFiles, maxFileSize, onFilesAdded, acceptedTypes]
  );

  const accept: Record<string, string[]> = {};
  const extensions: string[] = [];
  acceptedTypes.forEach((type) => {
    if (type.startsWith(".")) {
      extensions.push(type);
    } else {
      accept[type] = [];
    }
  });
  if (extensions.length > 0) {
    const mimeKeys = Object.keys(accept);
    if (mimeKeys.length > 0) {
      mimeKeys.forEach((key) => {
        accept[key] = [...(accept[key] || []), ...extensions];
      });
    } else {
      accept["application/octet-stream"] = extensions;
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(accept).length > 0 ? accept : undefined,
    maxFiles,
    maxSize: maxFileSize,
    disabled,
    multiple: maxFiles > 1,
  });

  const extensionLabels = acceptedTypes
    .filter((t) => t.startsWith("."))
    .map((t) => t.replace(".", "").toUpperCase());

  return (
    <div className="w-full">
      <motion.div
        {...(getRootProps() as any)}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 md:p-12 cursor-pointer transition-all duration-300",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive/50"
        )}
        whileHover={!disabled ? { scale: 1.01 } : undefined}
        whileTap={!disabled ? { scale: 0.99 } : undefined}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="drag-active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-semibold text-primary">
                Drop your files here
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="drag-inactive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="rounded-full bg-muted p-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  Drag & drop your file{maxFiles > 1 ? "s" : ""} here
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or{" "}
                  <span className="font-medium text-primary underline underline-offset-2">
                    browse files
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                {extensionLabels.length > 0 && (
                  <span className="rounded-md bg-muted px-2 py-1">
                    {extensionLabels.join(", ")}
                  </span>
                )}
                <span className="rounded-md bg-muted px-2 py-1">
                  Max {formatFileSize(maxFileSize)}
                </span>
                {maxFiles > 1 && (
                  <span className="rounded-md bg-muted px-2 py-1">
                    Up to {maxFiles} files
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated border glow on drag */}
        {isDragActive && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              boxShadow:
                "inset 0 0 30px oklch(0.55 0.2 260 / 0.1), 0 0 20px oklch(0.55 0.2 260 / 0.1)",
            }}
          />
        )}
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2 text-sm text-destructive"
          >
            <FileWarning className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
