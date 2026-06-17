"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Download, Trash2, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface ProcessedFile {
  id: string
  originalName: string
  generatedName: string
  toolUsed: string
  fileSize: number
  status: string
  createdAt: string
  expiresAt: string
}

export default function MyFilesPage() {
  const [files, setFiles] = React.useState<ProcessedFile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const { toast } = useToast()

  const fetchFiles = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/files")
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      } else {
        throw new Error("Failed to load files")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error loading files",
        description: "Something went wrong while retrieving your files.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/files?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file.id !== id))
        toast({
          title: "File deleted",
          description: "The file was successfully removed from our servers.",
        })
      } else {
        throw new Error("Failed to delete file")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "The file could not be deleted. Please try again.",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const filteredFiles = files.filter((file) =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.toolUsed.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Files</h1>
          <p className="text-muted-foreground mt-1">
            Manage your recently processed PDF documents. Files are auto-deleted after 24 hours.
          </p>
        </div>
        <Button onClick={fetchFiles} variant="outline" size="sm" className="gap-1.5 self-start">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Files Card */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files by name or tool..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 max-w-sm rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Retrieving files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No files found</h3>
              <p className="text-muted-foreground max-w-sm mt-1 text-sm">
                {searchTerm
                  ? "We couldn't find any files matching your search query."
                  : "You haven't processed any files yet. Upload a file using our PDF tools to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase font-semibold">
                    <th className="pb-3 px-2">File Name</th>
                    <th className="pb-3 px-2">Tool Used</th>
                    <th className="pb-3 px-2">Size</th>
                    <th className="pb-3 px-2">Expires In</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredFiles.map((file) => {
                      const expiresDate = new Date(file.expiresAt)
                      const now = new Date()
                      const diffMs = expiresDate.getTime() - now.getTime()
                      const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)))
                      const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)))

                      return (
                        <motion.tr
                          key={file.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 px-2 font-medium max-w-[240px] truncate pr-4">
                            {file.originalName}
                          </td>
                          <td className="py-4 px-2 capitalize">
                            <Badge variant="secondary" className="font-normal capitalize">
                              {file.toolUsed.replace("-", " ")}
                            </Badge>
                          </td>
                          <td className="py-4 px-2 text-muted-foreground">
                            {formatBytes(file.fileSize)}
                          </td>
                          <td className="py-4 px-2 text-muted-foreground">
                            {diffMs <= 0 ? (
                              <span className="text-red-500 font-medium">Expired</span>
                            ) : (
                              <span>
                                {diffHours}h {diffMins}m
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {diffMs > 0 && (
                                <Button
                                  asChild
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary hover:bg-primary/10"
                                >
                                  <a href={`/api/files/${file.id}`} download={file.originalName}>
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Download</span>
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deletingId === file.id}
                                onClick={() => handleDelete(file.id)}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              >
                                {deletingId === file.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
