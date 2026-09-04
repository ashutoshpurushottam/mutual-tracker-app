import { describe, it, expect } from "vitest"
import { PortfolioTransaction } from "@/app/util/transactions"
import {
  averageMonthlySip,
  buildMonthlyCashflow,
  buildSchemeCashflow,
  cashflowTrend,
  formatMonthLabel,
  largestOutflow,
} from "@/app/util/cashflow"

function txn(
  partial: Partial<PortfolioTransaction> &
    Pick<PortfolioTransaction, "type" | "amount" | "date" | "schemeName">
): PortfolioTransaction {
  return {
    id: partial.id || `${partial.date}-${partial.type}-${partial.amount}`,
    userId: "u1",
    holdingId: "h1",
    schemeCode: partial.schemeCode ?? "HDFC001",
    amcName: "AMC",
    folioNumber: "F1",
    units: 1,
    nav: 10,
    ...partial,
  }
}

describe("cashflow helpers", () => {
  const sample: PortfolioTransaction[] = [
    txn({ type: "PURCHASE", amount: 20000, date: "2025-01-05", schemeName: "Alpha" }),
    txn({ type: "SIP", amount: 5000, date: "2025-01-10", schemeName: "Alpha" }),
    txn({ type: "SIP", amount: 5000, date: "2025-02-10", schemeName: "Alpha" }),
    txn({
      type: "REDEMPTION",
      amount: 3000,
      date: "2025-02-20",
      schemeName: "Beta",
      schemeCode: "SBI001",
    }),
    txn({
      type: "SIP",
      amount: 4000,
      date: "2025-03-10",
      schemeName: "Beta",
      schemeCode: "SBI001",
    }),
  ]

  it("aggregates monthly inflows and outflows", () => {
    const months = buildMonthlyCashflow(sample)
    expect(months).toHaveLength(3)
    expect(months[0]).toMatchObject({
      month: "2025-01",
      inflows: 25000,
      outflows: 0,
      sipAmount: 5000,
      purchaseAmount: 20000,
      net: 25000,
    })
    expect(months[1].outflows).toBe(3000)
    expect(months[1].net).toBe(2000)
  })

  it("ranks schemes by net cash flow", () => {
    const schemes = buildSchemeCashflow(sample)
    expect(schemes[0].schemeName).toBe("Alpha")
    expect(schemes.find((s) => s.schemeCode === "SBI001")?.txnCount).toBe(2)
  })

  it("computes average SIP and largest outflow", () => {
    expect(averageMonthlySip(sample)).toBeCloseTo(4666.67, 1)
    expect(largestOutflow(sample)?.amount).toBe(3000)
  })

  it("builds month-over-month trend labels", () => {
    const trend = cashflowTrend(buildMonthlyCashflow(sample))
    expect(trend[0].label).toBe("flat")
    expect(trend[1].label).toBe("down")
    expect(formatMonthLabel("2025-09")).toBe("Sep 2025")
  })
})
