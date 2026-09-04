import { describe, it, expect } from "vitest"
import {
  addCompareFund,
  buildCompareMetricRows,
  canAddCompareFund,
  compareReady,
  formatMetricValue,
  MAX_COMPARE_FUNDS,
  parseCompareIds,
  removeCompareFund,
  serializeCompareIds,
  CompareFund,
} from "@/app/util/fund-compare"

function fund(partial: Partial<CompareFund> & Pick<CompareFund, "schemeId" | "schemeName">): CompareFund {
  return {
    amcName: "Test AMC",
    category: "Equity",
    nav: 100,
    aum: 1_000_000_000,
    expenseRatio: 0.5,
    riskLevel: "High",
    returns: { oneYear: 10, threeYear: 12, fiveYear: 14 },
    historicalData: [],
    ...partial,
  }
}

describe("fund-compare helpers", () => {
  it("parses and serializes compare ids with a max of three", () => {
    expect(parseCompareIds("hdfc001, SBI001, hdfc001, PPFAS001, EXTRA")).toEqual([
      "HDFC001",
      "SBI001",
      "PPFAS001",
    ])
    expect(serializeCompareIds(["a", "b", "c", "d"])).toBe("a,b,c")
  })

  it("adds and removes funds with capacity checks", () => {
    expect(canAddCompareFund(["A"], "B")).toBe(true)
    expect(canAddCompareFund(["A", "B", "C"], "D")).toBe(false)
    expect(canAddCompareFund(["A"], "A")).toBe(false)
    expect(addCompareFund(["A"], "B")).toEqual(["A", "B"])
    expect(addCompareFund(["A", "B", "C"], "D")).toEqual(["A", "B", "C"])
    expect(removeCompareFund(["A", "B"], "A")).toEqual(["B"])
    expect(MAX_COMPARE_FUNDS).toBe(3)
  })

  it("requires at least two funds to be compare-ready", () => {
    expect(compareReady(["A"])).toBe(false)
    expect(compareReady(["A", "B"])).toBe(true)
  })

  it("builds metric rows and marks best values", () => {
    const rows = buildCompareMetricRows([
      fund({
        schemeId: "A",
        schemeName: "Alpha",
        expenseRatio: 0.9,
        returns: { oneYear: 8, threeYear: 10, fiveYear: 11 },
        aum: 100,
      }),
      fund({
        schemeId: "B",
        schemeName: "Beta",
        expenseRatio: 0.3,
        returns: { oneYear: 15, threeYear: 16, fiveYear: 18 },
        aum: 500,
      }),
    ])

    const expense = rows.find((r) => r.key === "expenseRatio")
    const oneYear = rows.find((r) => r.key === "oneYear")
    const aum = rows.find((r) => r.key === "aum")

    expect(expense?.bestIndexes).toEqual([1])
    expect(oneYear?.bestIndexes).toEqual([1])
    expect(aum?.bestIndexes).toEqual([1])
    expect(formatMetricValue("percent", 12.345)).toBe("12.35%")
    expect(formatMetricValue("text", "Equity")).toBe("Equity")
  })
})
