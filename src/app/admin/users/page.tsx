"use client"

import * as React from "react"
import { Search, Shield, UserCheck, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface UserItem {
  id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = React.useState<UserItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)
  const { toast } = useToast()

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        throw new Error("Failed to load users")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: "Could not retrieve user profiles from server.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleRole = async (id: string, currentRole: "USER" | "ADMIN") => {
    if (id === session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Action unauthorized",
        description: "You cannot change your own admin privileges.",
      })
      return
    }

    setUpdatingId(id)
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN"

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, role: newRole }),
      })

      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
        )
        toast({
          title: "User role updated",
          description: `User role has been successfully changed to ${newRole}.`,
        })
      } else {
        throw new Error("Failed to update user role")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Role update failed",
        description: "An error occurred while changing user permissions.",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor registration details and adjust user system permission levels.
        </p>
      </div>

      {/* Users Card */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
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
              <p className="text-sm text-muted-foreground">Retrieving accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-lg font-bold text-foreground">No users found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                We couldn't find any accounts matching your search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase font-semibold">
                    <th className="pb-3 px-2">Name</th>
                    <th className="pb-3 px-2">Email</th>
                    <th className="pb-3 px-2">Role</th>
                    <th className="pb-3 px-2">Joined Date</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-2 font-medium">{user.name}</td>
                      <td className="py-4 px-2 text-muted-foreground">{user.email}</td>
                      <td className="py-4 px-2">
                        <Badge
                          variant={user.role === "ADMIN" ? "default" : "secondary"}
                          className={user.role === "ADMIN" ? "bg-red-500/10 text-red-600 hover:bg-red-500/15" : ""}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-muted-foreground font-light text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2 text-right">
                        {updatingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto mr-4" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={user.id === session?.user?.id}
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className="text-xs h-8 px-2.5 font-medium gap-1.5"
                          >
                            {user.role === "ADMIN" ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Demote to User</span>
                              </>
                            ) : (
                              <>
                                <Shield className="h-3.5 w-3.5 text-red-500" />
                                <span>Promote to Admin</span>
                              </>
                            )}
                          </Button>
                        )}
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
