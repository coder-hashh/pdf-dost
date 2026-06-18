"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Menu, LogOut, LayoutDashboard, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NAV_LINKS } from "@/lib/constants"
import { ThemeToggle } from "./theme-toggle"

export function MobileMenu() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 rounded-lg"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col justify-between">
        <div className="flex flex-col gap-6">
          <SheetHeader className="text-left border-b pb-4">
            <SheetTitle className="text-lg font-bold gradient-text">PDF Dost</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t pt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>

          {!isLoading && (
            session ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-1 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold truncate">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                </div>
                <Button asChild className="w-full justify-start gap-2" variant="outline" onClick={() => setOpen(false)}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                {session.user?.role === "ADMIN" && (
                  <Button asChild className="w-full justify-start gap-2" variant="outline" onClick={() => setOpen(false)}>
                    <Link href="/admin">
                      <User className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setOpen(false)
                    signOut({ redirectTo: "/" })
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full justify-center rounded-xl font-semibold" onClick={() => setOpen(false)}>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="w-full justify-center rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-md" onClick={() => setOpen(false)}>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
