"use client"

import { useState, useCallback } from "react"
import { motion } from "motion/react"
import { Image as ImageIcon } from "lucide-react"
import { cn, generateId } from "@/lib/utils"
import { TOOLS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { FileUploadZone } from "@/components/tools/file-upload-zone";
import { FileList, type FileItem } from "@/components/tools/file-list"
import { ProcessingStatus, type ProcessingState } from "@/components/tools/processing-status"
import { DownloadButton } from "@/components/tools/download-button"

// Wait! In the import of FileUploadZone, let's make sure it is correct.
// The file is at `src/components/tools/file-upload-zone.tsx` and exported as `FileUploadZone`.
// Let's import `FileUploadZone` from `@/components/tools/file-upload-zone`.
// Let's write the complete file.

const tool = TOOLS.find((t) => t.slug === "jpg-to-pdf")!

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [state, setState] = useState<ProcessingState>("idle")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [resultSize, setResultSize] = useState(0)

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const items: FileItem[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
    }))
    setFiles((prev) => [...prev, ...items].slice(0, tool.maxFiles))
  }, [])

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleReorder = useCallback((reordered: FileItem[]) => {
    setFiles(reordered)
  }, [])

  const handleProcess = async () => {
    if (files.length === 0) return

    setState("uploading")
    setProgress(0)
    setErrorMessage("")

    try {
      const formData = new FormData()
      files.forEach((f) => formData.append("files", f.file))

      setProgress(30)
      setState("processing")

      const response = await fetch("/api/tools/jpg-to-pdf", {
        method: "POST",
        body: formData,
      })

      setProgress(80)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to convert images to PDF")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      setProgress(100)
      setDownloadUrl(url)
      setResultSize(blob.size)
      setState("success")
    } catch (err) {
      setState("error")
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred")
    }
  }

  const handleReset = () => {
    setFiles([])
    setState("idle")
    setProgress(0)
    setDownloadUrl("")
    setResultSize(0)
    setErrorMessage("")
  }

  return (
    <div className="animated-bg min-h-screen">
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className={cn("mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl", tool.bgColor)}>
            <ImageIcon className={cn("h-8 w-8", tool.color)} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tool.title}</h1>
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
                onReorder={handleReorder}
                sortable
              />

              {files.length > 0 && (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleProcess}
                    className="rounded-xl px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg"
                  >
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Convert {files.length} {files.length === 1 ? "Image" : "Images"} to PDF
                  </Button>
                </div>
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
              fileName="converted.pdf"
              fileSize={resultSize}
              onProcessAnother={handleReset}
            />
          ) : (
            <ProcessingStatus state={state} progress={progress} />
          )}
        </motion.div>
      </div>
    </div>
  )
}
