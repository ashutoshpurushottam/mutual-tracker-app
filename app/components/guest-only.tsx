"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

/** Redirects authenticated users away from guest-only pages (login/register). */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { ready, isAuthenticated } = useAuth()

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [ready, isAuthenticated, router])

  if (!ready) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16 text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}
