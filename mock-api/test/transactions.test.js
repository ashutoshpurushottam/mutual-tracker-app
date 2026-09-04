const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const { createStore } = require("../store")
const {
  transactionsForHolding,
  buildTransactionsForPortfolios,
} = require("../data/transactions")

describe("synthetic transactions", () => {
  it("builds purchase and SIP rows for a holding", () => {
    const holding = {
      id: "hold-1",
      userId: "user-demo-001",
      schemeName: "HDFC Flexi Cap Fund - Direct Growth",
      amcName: "HDFC Mutual Fund",
      folioNumber: "F1",
      schemeCode: "HDFC001",
      investedValue: 100000,
      units: 100,
      currentValue: 120000,
    }
    const txns = transactionsForHolding(holding)
    assert.ok(txns.some((t) => t.type === "PURCHASE"))
    assert.ok(txns.some((t) => t.type === "SIP"))
    assert.ok(txns.every((t) => t.amount > 0 && t.units > 0 && t.nav > 0))
  })

  it("store returns transactions for the demo user", () => {
    const store = createStore()
    const txns = store.getTransactions("user-demo-001")
    assert.ok(txns.length > 10)
    const dates = txns.map((t) => t.date)
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    assert.deepEqual(dates, sorted)
  })

  it("aggregates across multiple holdings", () => {
    const store = createStore()
    const portfolios = store.getPortfolios("user-demo-001")
    const rebuilt = buildTransactionsForPortfolios(portfolios)
    assert.equal(rebuilt.length, store.getTransactions("user-demo-001").length)
  })
})
