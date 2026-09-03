import { describe, it, expect } from "vitest"
import { Portfolio, PortfolioUtil } from "@/app/util/InvestmentUtil"

const holding: Portfolio = {
  id: "h1",
  userId: "user-demo-001",
  schemeName: "Test Fund",
  amcName: "Test AMC",
  folioNumber: "F1",
  units: 100,
  investedValue: 100000,
  schemeCode: "TEST001",
  tradingsymbol: "TEST",
  currentValue: 125000,
  lastUpdateDate: "2026-09-03",
  category: "Equity",
}

describe("PortfolioUtil", () => {
  it("calculates absolute gain/loss", () => {
    expect(PortfolioUtil.calculateGainLoss(holding)).toBe(25000)
  })

  it("calculates gain/loss percentage", () => {
    expect(PortfolioUtil.calculateGainLossPercentage(holding)).toBe(25)
    expect(PortfolioUtil.calculateReturns(holding)).toBe(25)
  })

  it("handles a loss correctly", () => {
    const loser = { ...holding, currentValue: 80000 }
    expect(PortfolioUtil.calculateGainLoss(loser)).toBe(-20000)
    expect(PortfolioUtil.calculateGainLossPercentage(loser)).toBe(-20)
  })
})
