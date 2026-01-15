"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { ready, isAuthenticated } = useAuth()

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login")
    }
  }, [ready, isAuthenticated, router])

  if (!ready) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16 text-muted-foreground">
        Checking session…
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
