import { describe, it, expect, beforeEach } from "vitest"
import { Portfolio } from "@/app/util/InvestmentUtil"
import {
  computeAllocationDrift,
  computeCategoryWeights,
  DEFAULT_ALLOCATION_TARGETS,
  driftStatus,
  loadAllocationTargets,
  saveAllocationTargets,
  sumTargets,
  targetsAreValid,
} from "@/app/util/allocation-targets"

function holding(partial: Partial<Portfolio> & Pick<Portfolio, "category" | "currentValue">): Portfolio {
  return {
    id: partial.id || "h1",
    userId: "user-demo-001",
    schemeName: "Test",
    amcName: "AMC",
    folioNumber: "F1",
    units: 10,
    investedValue: partial.currentValue,
    schemeCode: "T1",
    tradingsymbol: "T",
    lastUpdateDate: "2026-09-03",
    ...partial,
  }
}

describe("allocation targets helpers", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("validates that targets sum to 100", () => {
    expect(targetsAreValid(DEFAULT_ALLOCATION_TARGETS)).toBe(true)
    expect(sumTargets(DEFAULT_ALLOCATION_TARGETS)).toBe(100)
    expect(targetsAreValid({ ...DEFAULT_ALLOCATION_TARGETS, Equity: 70 })).toBe(false)
  })

  it("computes category weights from current values", () => {
    const weights = computeCategoryWeights([
      holding({ category: "Equity", currentValue: 60000 }),
      holding({ id: "h2", category: "Debt", currentValue: 40000 }),
    ])
    expect(weights).toEqual([
      { category: "Equity", value: 60000, percent: 60 },
      { category: "Debt", value: 40000, percent: 40 },
    ])
  })

  it("computes drift against targets", () => {
    const rows = computeAllocationDrift(
      [
        holding({ category: "Equity", currentValue: 80000 }),
        holding({ id: "h2", category: "Debt", currentValue: 20000 }),
      ],
      { Equity: 60, Debt: 20, Hybrid: 10, Index: 10 }
    )

    const equity = rows.find((r) => r.category === "Equity")
    const hybrid = rows.find((r) => r.category === "Hybrid")
    expect(equity?.actualPercent).toBe(80)
    expect(equity?.drift).toBe(20)
    expect(hybrid?.actualPercent).toBe(0)
    expect(hybrid?.drift).toBe(-10)
    expect(driftStatus(equity!.drift)).toBe("over")
    expect(driftStatus(hybrid!.drift)).toBe("under")
    expect(driftStatus(1.5)).toBe("on-target")
  })

  it("persists targets per user in localStorage", () => {
    saveAllocationTargets("user-demo-001", {
      Equity: 50,
      Debt: 30,
      Hybrid: 10,
      Index: 10,
    })
    expect(loadAllocationTargets("user-demo-001").Equity).toBe(50)
    expect(loadAllocationTargets("other-user").Equity).toBe(
      DEFAULT_ALLOCATION_TARGETS.Equity
    )
  })
})
