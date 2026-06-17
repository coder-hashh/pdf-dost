"use client"

import * as React from "react"
import { Search, Trash2, Loader2, HardDrive, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface SystemFile {
  id: string
  originalName: string
  toolUsed: string
  fileSize: number
  status: string
  createdAt: string
  expiresAt: string
  user: {
    name: string
    email: string
  } | null
}

export default function AdminFilesPage() {
  const [files, setFiles] = React.useState<SystemFile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const { toast } = useToast()

  const fetchFiles = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/files")
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
        title: "Error fetching system files",
        description: "Could not retrieve document list from server.",
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
      const response = await fetch(`/api/admin/files?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file.id !== id))
        toast({
          title: "File deleted",
          description: "File successfully cleared from server.",
        })
      } else {
        throw new Error("Failed to delete file")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: "Could not remove file from storage.",
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
    file.toolUsed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">System Files</h1>
        <p className="text-muted-foreground mt-1">
          Monitor all active PDF documents currently stored in the cache.
        </p>
      </div>

      {/* Files Card */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files by name, tool, or user..."
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
              <Loader2 className="h-8 w-8 animate-spin text-destructive" />
              <p className="text-sm text-muted-foreground">Retrieving document index...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No files in cache</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                There are currently no active document conversions on the disk.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase font-semibold">
                    <th className="pb-3 px-2">File Name</th>
                    <th className="pb-3 px-2">Processed By</th>
                    <th className="pb-3 px-2">Tool</th>
                    <th className="pb-3 px-2">Size</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-2 font-medium max-w-[180px] truncate pr-4" title={file.originalName}>
                        {file.originalName}
                      </td>
                      <td className="py-4 px-2">
                        {file.user ? (
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {file.user.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {file.user.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-light text-xs italic">
                            Guest / Anonymous
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2 capitalize text-xs">
                        {file.toolUsed.replace("-", " ")}
                      </td>
                      <td className="py-4 px-2 text-muted-foreground text-xs">
                        {formatBytes(file.fileSize)}
                      </td>
                      <td className="py-4 px-2">
                        <Badge
                          variant={file.status === "COMPLETED" ? "default" : "destructive"}
                          className={`text-[10px] ${
                            file.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15"
                              : ""
                          }`}
                        >
                          {file.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-right">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
