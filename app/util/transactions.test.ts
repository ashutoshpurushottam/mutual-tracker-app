import { describe, it, expect } from "vitest"
import {
  filterTransactions,
  isInflow,
  PortfolioTransaction,
  summarizeTransactions,
  transactionTypeLabel,
} from "@/app/util/transactions"

function txn(
  partial: Partial<PortfolioTransaction> & Pick<PortfolioTransaction, "type" | "amount">
): PortfolioTransaction {
  return {
    id: partial.id || "t1",
    userId: "user-demo-001",
    holdingId: "h1",
    schemeCode: "HDFC001",
    schemeName: "HDFC Flexi Cap Fund - Direct Growth",
    amcName: "HDFC Mutual Fund",
    folioNumber: "F1",
    units: 10,
    nav: 100,
    date: "2025-01-01",
    ...partial,
  }
}

describe("transactions helpers", () => {
  const sample: PortfolioTransaction[] = [
    txn({ id: "1", type: "SIP", amount: 5000 }),
    txn({ id: "2", type: "PURCHASE", amount: 20000 }),
    txn({ id: "3", type: "REDEMPTION", amount: 3000 }),
    txn({
      id: "4",
      type: "SIP",
      amount: 5000,
      schemeName: "SBI Small Cap Fund - Direct Growth",
      amcName: "SBI Mutual Fund",
      schemeCode: "SBI002",
    }),
  ]

  it("summarizes inflows, outflows, and counts", () => {
    const summary = summarizeTransactions(sample)
    expect(summary.totalInflows).toBe(30000)
    expect(summary.totalOutflows).toBe(3000)
    expect(summary.netCashFlow).toBe(27000)
    expect(summary.sipCount).toBe(2)
    expect(summary.purchaseCount).toBe(1)
  })

  it("filters by type and free-text query", () => {
    expect(filterTransactions(sample, { type: "SIP" })).toHaveLength(2)
    expect(filterTransactions(sample, { query: "sbi" })).toHaveLength(1)
    expect(filterTransactions(sample, { schemeCode: "HDFC001" })).toHaveLength(3)
  })

  it("labels types and detects inflows", () => {
    expect(transactionTypeLabel("SIP")).toBe("SIP")
    expect(transactionTypeLabel("REDEMPTION")).toBe("Redemption")
    expect(isInflow("PURCHASE")).toBe(true)
    expect(isInflow("REDEMPTION")).toBe(false)
  })
})
