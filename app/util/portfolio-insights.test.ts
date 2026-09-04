import { describe, it, expect } from "vitest"
import { Portfolio } from "@/app/util/InvestmentUtil"
import {
  buildPortfolioSnapshot,
  concentrationRisk,
  findDuplicateSchemes,
  rebalanceHints,
} from "@/app/util/portfolio-insights"

function holding(partial: Partial<Portfolio> & Pick<Portfolio, "id" | "category" | "currentValue" | "investedValue">): Portfolio {
  return {
    userId: "u1",
    schemeName: partial.schemeName || `Scheme ${partial.id}`,
    amcName: "AMC",
    folioNumber: "F1",
    units: 10,
    schemeCode: partial.schemeCode ?? partial.id,
    tradingsymbol: "T",
    lastUpdateDate: "2026-09-03",
    ...partial,
  }
}

describe("portfolio insights", () => {
  const holdings: Portfolio[] = [
    holding({ id: "1", category: "Equity", investedValue: 100000, currentValue: 140000, schemeName: "Winner" }),
    holding({ id: "2", category: "Debt", investedValue: 80000, currentValue: 82000, schemeName: "Bond" }),
    holding({ id: "3", category: "Equity", investedValue: 50000, currentValue: 40000, schemeName: "Laggard" }),
    holding({
      id: "4",
      category: "Equity",
      investedValue: 20000,
      currentValue: 22000,
      schemeCode: "1",
      schemeName: "Dup",
    }),
  ]

  it("builds a snapshot with tops and laggards", () => {
    const snap = buildPortfolioSnapshot(holdings)
    expect(snap.holdingCount).toBe(4)
    expect(snap.invested).toBe(250000)
    expect(snap.topHoldings[0].schemeName).toBe("Winner")
    expect(snap.laggards[0].schemeName).toBe("Laggard")
    expect(snap.categoryCounts.Equity).toBe(3)
  })

  it("detects duplicate scheme codes and concentration", () => {
    expect(findDuplicateSchemes(holdings)).toContain("1")
    const concentrated = concentrationRisk(holdings, 40)
    expect(concentrated[0].schemeName).toBe("Winner")
  })

  it("computes rebalance hints against category targets", () => {
    const hints = rebalanceHints(holdings, { Equity: 60, Debt: 40 })
    expect(hints[0].category).toBeTruthy()
    expect(hints.find((h) => h.category === "Debt")?.targetPct).toBe(40)
  })
})
