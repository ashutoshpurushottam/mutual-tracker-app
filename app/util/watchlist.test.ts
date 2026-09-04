import { describe, it, expect, beforeEach } from "vitest"
import {
  addToWatchlist,
  isOnWatchlist,
  loadWatchlist,
  removeFromWatchlist,
  toggleWatchlist,
} from "@/app/util/watchlist"

describe("watchlist helpers", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("starts empty for a user", () => {
    expect(loadWatchlist("user-demo-001")).toEqual([])
    expect(isOnWatchlist("user-demo-001", "PPFAS001")).toBe(false)
  })

  it("adds and removes funds", () => {
    addToWatchlist("user-demo-001", {
      schemeId: "PPFAS001",
      schemeName: "Parag Parikh Flexi Cap Fund - Direct Growth",
      category: "Equity",
    })
    expect(isOnWatchlist("user-demo-001", "PPFAS001")).toBe(true)
    expect(loadWatchlist("user-demo-001")).toHaveLength(1)

    removeFromWatchlist("user-demo-001", "PPFAS001")
    expect(isOnWatchlist("user-demo-001", "PPFAS001")).toBe(false)
  })

  it("does not duplicate the same scheme", () => {
    addToWatchlist("user-demo-001", {
      schemeId: "HDFC001",
      schemeName: "HDFC Flexi Cap",
    })
    addToWatchlist("user-demo-001", {
      schemeId: "HDFC001",
      schemeName: "HDFC Flexi Cap",
    })
    expect(loadWatchlist("user-demo-001")).toHaveLength(1)
  })

  it("toggles watch state", () => {
    const added = toggleWatchlist("user-demo-001", {
      schemeId: "SBI001",
      schemeName: "SBI Bluechip",
    })
    expect(added.added).toBe(true)
    const removed = toggleWatchlist("user-demo-001", {
      schemeId: "SBI001",
      schemeName: "SBI Bluechip",
    })
    expect(removed.added).toBe(false)
    expect(loadWatchlist("user-demo-001")).toHaveLength(0)
  })

  it("keeps watchlists isolated per user", () => {
    addToWatchlist("user-a", { schemeId: "A1", schemeName: "Fund A" })
    expect(loadWatchlist("user-b")).toEqual([])
  })
})
