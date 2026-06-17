"use client"

import * as React from "react"
import { Users, FileText, HardDrive, ShieldCheck, Mail, RefreshCw, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface SystemStats {
  usersCount: number
  filesCount: number
  activeFilesCount: number
  storageUsedBytes: number
  unreadMessagesCount: number
  recentLogsCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<SystemStats>({
    usersCount: 0,
    filesCount: 0,
    activeFilesCount: 0,
    storageUsedBytes: 0,
    unreadMessagesCount: 0,
    recentLogsCount: 0,
  })
  const [loading, setLoading] = React.useState(true)
  const [clearing, setClearing] = React.useState(false)
  const { toast } = useToast()

  const fetchStats = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error("Failed to load stats")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error loading statistics",
        description: "Could not retrieve the system metrics from servers.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleClearExpired = async () => {
    setClearing(true)
    try {
      const response = await fetch("/api/admin/files?expiredOnly=true", {
        method: "DELETE",
      })
      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Cleanup completed",
          description: `Successfully cleared ${data.count} expired files from disk storage.`,
        })
        fetchStats()
      } else {
        throw new Error("Failed to clear files")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Cleanup failed",
        description: "Something went wrong during manual cache deletion.",
      })
    } finally {
      setClearing(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">System Overview</h1>
          <p className="text-muted-foreground mt-1">
            Real-time analytics and management utility dashboard for PDF Dost.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchStats} variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">{stats.usersCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Registered accounts in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Files Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">{stats.filesCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Lifetime files processed by users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cached Files</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeFilesCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Files currently stored on disk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cache Size</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold">{formatBytes(stats.storageUsedBytes)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Disk space consumed by cache</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Administration Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Cleanup Utilities</CardTitle>
            <CardDescription>
              Perform manual administrative disk cleanup and database seed operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-semibold text-sm">Prune Expired Cache</p>
                <p className="text-xs text-muted-foreground">
                  Remove all files processed more than 24 hours ago.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearExpired}
                disabled={clearing || stats.activeFilesCount === 0}
              >
                {clearing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Run Cleanup
              </Button>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-semibold text-sm">System Database Seeding</p>
                <p className="text-xs text-muted-foreground">
                  Generates default blog posts and logs.
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Seeded
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Message Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              Inbound Messages
            </CardTitle>
            <CardDescription>
              Audit queries submitted through the Contact Us form.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 text-center">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : stats.unreadMessagesCount > 0 ? (
              <div className="space-y-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold text-lg animate-pulse">
                  {stats.unreadMessagesCount}
                </span>
                <p className="text-sm font-semibold text-foreground">
                  You have unread feedback queries!
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-muted-foreground text-sm">
                <Sparkles className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                <p>All client queries have been addressed!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
