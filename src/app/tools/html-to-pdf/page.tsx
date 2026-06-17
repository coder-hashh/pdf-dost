"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Code, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { TOOLS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProcessingStatus, type ProcessingState } from "@/components/tools/processing-status"
import { DownloadButton } from "@/components/tools/download-button"

const tool = TOOLS.find((t) => t.slug === "html-to-pdf")!

export default function HtmlToPdfPage() {
  const [htmlContent, setHtmlContent] = useState("")
  const [pageSize, setPageSize] = useState("A4")
  const [state, setState] = useState<ProcessingState>("idle")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [resultSize, setResultSize] = useState(0)

  const handleProcess = async () => {
    if (!htmlContent.trim()) return

    setState("uploading")
    setProgress(0)
    setErrorMessage("")

    try {
      setProgress(30)
      setState("processing")

      const response = await fetch("/api/tools/html-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: htmlContent, pageSize }),
      })

      setProgress(80)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate PDF from HTML")
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
    setHtmlContent("")
    setPageSize("A4")
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
            <Code className={cn("h-8 w-8", tool.color)} />
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
            <div className="bg-card border rounded-xl p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="html">HTML Markup Content</Label>
                <Textarea
                  id="html"
                  placeholder="&lt;html&gt;&#10;  &lt;body&gt;&#10;    &lt;h1 style='color: blue'&gt;Hello PDF Dost!&lt;/h1&gt;&#10;  &lt;/body&gt;&#10;&lt;/html&gt;"
                  rows={10}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageSize">Page Format Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger id="pageSize">
                    <SelectValue placeholder="Select page format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (Standard International)</SelectItem>
                    <SelectItem value="Letter">Letter (Standard US)</SelectItem>
                    <SelectItem value="Legal">Legal (Standard US Legal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  disabled={!htmlContent.trim()}
                  onClick={handleProcess}
                  className="rounded-xl px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Generate PDF Document
                </Button>
              </div>

              {state === "error" && (
                <ProcessingStatus
                  state={state}
                  errorMessage={errorMessage}
                  onRetry={() => setState("idle")}
                />
              )}
            </div>
          ) : state === "success" && downloadUrl ? (
            <DownloadButton
              downloadUrl={downloadUrl}
              fileName="generated.pdf"
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
