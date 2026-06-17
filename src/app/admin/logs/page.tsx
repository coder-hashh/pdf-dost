"use client"

import * as React from "react"
import { Search, Terminal, Loader2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface ActivityLogItem {
  id: string
  action: string
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    name: string
    email: string
  } | null
}

export default function AdminLogsPage() {
  const [logs, setLogs] = React.useState<ActivityLogItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const { toast } = useToast()

  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/logs")
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      } else {
        throw new Error("Failed to load logs")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error fetching activity logs",
        description: "Could not retrieve audit logs from server.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">
          Audit system actions, authentication events, and PDF conversion activities.
        </p>
      </div>

      {/* Logs Card */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by action, details, or user..."
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
              <p className="text-sm text-muted-foreground">Retrieving audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No logs found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                We couldn't find any activities matching your query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase font-semibold">
                    <th className="pb-3 px-2">Timestamp</th>
                    <th className="pb-3 px-2">User</th>
                    <th className="pb-3 px-2">Action</th>
                    <th className="pb-3 px-2">Details</th>
                    <th className="pb-3 px-2">IP &amp; Device</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-2 text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-2">
                        {log.user ? (
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {log.user.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {log.user.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-light text-xs italic">
                            Guest / Anonymous
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant="outline" className="font-semibold text-[10px] capitalize">
                          {log.action.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-xs max-w-[200px] truncate" title={log.details || ""}>
                        {log.details || "-"}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-foreground font-mono">
                            {log.ipAddress || "Unknown IP"}
                          </span>
                          <span className="text-[9px] text-muted-foreground max-w-[150px] truncate" title={log.userAgent || ""}>
                            {log.userAgent || "Unknown UA"}
                          </span>
                        </div>
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
