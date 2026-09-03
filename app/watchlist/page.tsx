"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark } from "lucide-react"
import { NavBar } from "@/app/components/navbar"
import { RequireAuth } from "@/app/components/require-auth"
import { WatchButton } from "@/app/components/watch-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import {
  loadWatchlist,
  removeFromWatchlist,
  WatchlistItem,
  WATCHLIST_CHANGED_EVENT,
} from "@/app/util/watchlist"

export default function WatchlistPage() {
  return (
    <RequireAuth>
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <WatchlistContent />
      </div>
    </RequireAuth>
  )
}

function WatchlistContent() {
  const { user } = useAuth()
  const userId = user?.userId ?? null
  const [items, setItems] = useState<WatchlistItem[]>([])

  const refresh = useCallback(() => {
    setItems(loadWatchlist(userId))
  }, [userId])

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener(WATCHLIST_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(WATCHLIST_CHANGED_EVENT, onChange)
  }, [refresh])

  const handleRemove = (schemeId: string) => {
    if (!userId) return
    removeFromWatchlist(userId, schemeId)
    setItems((prev) => prev.filter((item) => item.schemeId !== schemeId))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Watchlist</h1>
          <p className="mt-1 text-muted-foreground">
            Funds you saved from Research for later review.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/search">Browse Research</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              No watched funds yet
            </CardTitle>
            <CardDescription>
              Search for a fund and click Watch to save it here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/search">Go to Research</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.schemeId}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/fund/${item.schemeId}`}
                    className="text-lg font-semibold text-primary hover:underline"
                  >
                    {item.schemeName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {[item.amcName, item.category].filter(Boolean).join(" · ") || item.schemeId}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/fund/${item.schemeId}`}>View</Link>
                  </Button>
                  <WatchButton
                    schemeId={item.schemeId}
                    schemeName={item.schemeName}
                    amcName={item.amcName}
                    category={item.category}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.schemeId)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
