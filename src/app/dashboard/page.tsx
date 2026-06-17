"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion } from "motion/react"
import {
  FileText,
  Clock,
  HardDrive,
  Merge,
  Scissors,
  Minimize2,
  Lock,
  ArrowRight,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardStats {
  totalProcessed: number
  activeFiles: number
  storageUsedBytes: number
}

interface ProcessedFile {
  id: string
  originalName: string
  toolUsed: string
  fileSize: number
  status: string
  createdAt: string
  expiresAt: string
}

export default function DashboardOverview() {
  const { data: session } = useSession()
  const [stats, setStats] = React.useState<DashboardStats>({
    totalProcessed: 0,
    activeFiles: 0,
    storageUsedBytes: 0,
  })
  const [recentFiles, setRecentFiles] = React.useState<ProcessedFile[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/files?limit=5")
        if (response.ok) {
          const data = await response.json()
          setRecentFiles(data.files || [])
          setStats({
            totalProcessed: data.totalCount || 0,
            activeFiles: data.activeCount || 0,
            storageUsedBytes: data.totalSizeBytes || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const quickTools = [
    { name: "Merge PDF", slug: "merge-pdf", icon: Merge, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Split PDF", slug: "split-pdf", icon: Scissors, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Compress PDF", slug: "compress-pdf", icon: Minimize2, color: "text-orange-500", bg: "bg-orange-500/10" },
    { name: "Protect PDF", slug: "protect-pdf", icon: Lock, color: "text-red-500", bg: "bg-red-500/10" },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back, {session?.user?.name || "User"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your workspace activity, manage files, and process new PDF documents.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalProcessed}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Lifetime processed files</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Files</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeFiles}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Available for download (24h limit)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">{formatBytes(stats.storageUsedBytes)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Active files disk size</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tools */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">Quick Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {quickTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Button
                key={tool.slug}
                asChild
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl border-dashed hover:border-solid hover:bg-muted/30 hover:shadow-sm transition-all"
              >
                <Link href={`/tools/${tool.slug}`}>
                  <div className={`p-2.5 rounded-lg ${tool.bg} ${tool.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold">{tool.name}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Recent Files Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>
              Your last 5 processed files available for download.
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/dashboard/files">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : recentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="mb-4">No recent files found.</p>
              <Button asChild size="sm" className="gradient-primary text-white">
                <Link href="/tools">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Process First File
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase">
                    <th className="py-2.5">File Name</th>
                    <th className="py-2.5">Tool</th>
                    <th className="py-2.5">Size</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFiles.map((file) => (
                    <tr key={file.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-medium max-w-[200px] truncate pr-4">
                        {file.originalName}
                      </td>
                      <td className="py-3 capitalize">{file.toolUsed.replace("-", " ")}</td>
                      <td className="py-3">{formatBytes(file.fileSize)}</td>
                      <td className="py-3">
                        <Badge
                          variant={file.status === "COMPLETED" ? "default" : "destructive"}
                          className={file.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15" : ""}
                        >
                          {file.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(file.createdAt).toLocaleDateString()}
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
