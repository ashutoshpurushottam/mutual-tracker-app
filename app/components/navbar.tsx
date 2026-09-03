"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function NavBar() {
  const router = useRouter()
  const { ready, isAuthenticated, user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">MutualTrack</span>
          </Link>
          <div className="hidden gap-6 md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Research
            </Link>
            {ready && isAuthenticated && (
              <Link
                href="/watchlist"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Watchlist
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {ready && isAuthenticated && user?.fullName && (
            <span className="hidden text-sm text-muted-foreground md:inline">
              {user.fullName}
            </span>
          )}
          {ready && isAuthenticated ? (
            <Button variant="outline" className="hidden md:flex" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <Button
              variant="outline"
              className="hidden md:flex"
              onClick={() => router.push("/login")}
              disabled={!ready}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
