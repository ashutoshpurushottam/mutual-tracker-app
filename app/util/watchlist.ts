export type WatchlistItem = {
  schemeId: string
  schemeName: string
  amcName?: string
  category?: string
  addedAt: string
}

const STORAGE_PREFIX = "mutualtrack:watchlist:"
export const WATCHLIST_CHANGED_EVENT = "mutualtrack:watchlist-changed"

export function watchlistStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`
}

function notifyWatchlistChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(WATCHLIST_CHANGED_EVENT))
  }
}

export function loadWatchlist(userId: string | null | undefined): WatchlistItem[] {
  if (!userId || typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(watchlistStorageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as WatchlistItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveWatchlist(userId: string, items: WatchlistItem[]): void {
  localStorage.setItem(watchlistStorageKey(userId), JSON.stringify(items))
  notifyWatchlistChanged()
}

export function isOnWatchlist(userId: string | null | undefined, schemeId: string): boolean {
  return loadWatchlist(userId).some((item) => item.schemeId === schemeId)
}

export function addToWatchlist(
  userId: string,
  item: Omit<WatchlistItem, "addedAt"> & { addedAt?: string }
): WatchlistItem[] {
  const current = loadWatchlist(userId)
  if (current.some((entry) => entry.schemeId === item.schemeId)) {
    return current
  }
  const next = [
    {
      schemeId: item.schemeId,
      schemeName: item.schemeName,
      amcName: item.amcName,
      category: item.category,
      addedAt: item.addedAt || new Date().toISOString(),
    },
    ...current,
  ]
  saveWatchlist(userId, next)
  return next
}

export function removeFromWatchlist(userId: string, schemeId: string): WatchlistItem[] {
  const next = loadWatchlist(userId).filter((item) => item.schemeId !== schemeId)
  saveWatchlist(userId, next)
  return next
}

export function toggleWatchlist(
  userId: string,
  item: Omit<WatchlistItem, "addedAt">
): { items: WatchlistItem[]; added: boolean } {
  if (isOnWatchlist(userId, item.schemeId)) {
    return { items: removeFromWatchlist(userId, item.schemeId), added: false }
  }
  return { items: addToWatchlist(userId, item), added: true }
}
