"use client"

import { useEffect, useState, type MouseEvent } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import {
  isOnWatchlist,
  toggleWatchlist,
  WATCHLIST_CHANGED_EVENT,
} from "@/app/util/watchlist"
import { useRouter } from "next/navigation"

type WatchButtonProps = {
  schemeId: string
  schemeName: string
  amcName?: string
  category?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showLabel?: boolean
}

export function WatchButton({
  schemeId,
  schemeName,
  amcName,
  category,
  variant = "outline",
  size = "sm",
  className,
  showLabel = true,
}: WatchButtonProps) {
  const { ready, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const userId = user?.userId ?? null
  const [watched, setWatched] = useState(false)

  useEffect(() => {
    const sync = () => setWatched(isOnWatchlist(userId, schemeId))
    sync()
    window.addEventListener(WATCHLIST_CHANGED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(WATCHLIST_CHANGED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [userId, schemeId])

  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!ready) return

    if (!isAuthenticated || !userId) {
      toast({
        title: "Sign in required",
        description: "Sign in to save funds to your watchlist.",
      })
      router.push("/login")
      return
    }

    const { added } = toggleWatchlist(userId, {
      schemeId,
      schemeName,
      amcName,
      category,
    })
    setWatched(added)
    toast({
      title: added ? "Added to watchlist" : "Removed from watchlist",
      description: schemeName,
    })
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      aria-pressed={watched}
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
    >
      {watched ? (
        <BookmarkCheck className={showLabel ? "mr-2 h-4 w-4" : "h-4 w-4"} />
      ) : (
        <Bookmark className={showLabel ? "mr-2 h-4 w-4" : "h-4 w-4"} />
      )}
      {showLabel ? (watched ? "Watching" : "Watch") : null}
    </Button>
  )
}
