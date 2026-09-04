import { Portfolio } from "@/app/util/InvestmentUtil"

export type HoldingGain = {
  id: string
  schemeName: string
  schemeCode: string | null
  investedValue: number
  currentValue: number
  absoluteGain: number
  percentGain: number
  weightPct: number
}

export type PortfolioSnapshot = {
  invested: number
  current: number
  absoluteGain: number
  percentGain: number
  holdingCount: number
  categoryCounts: Record<string, number>
  topHoldings: HoldingGain[]
  laggards: HoldingGain[]
}

export function holdingGain(holding: Portfolio, portfolioCurrent: number): HoldingGain {
  const absoluteGain = holding.currentValue - holding.investedValue
  const percentGain = holding.investedValue
    ? (absoluteGain / holding.investedValue) * 100
    : 0
  const weightPct = portfolioCurrent
    ? (holding.currentValue / portfolioCurrent) * 100
    : 0

  return {
    id: holding.id,
    schemeName: holding.schemeName,
    schemeCode: holding.schemeCode,
    investedValue: holding.investedValue,
    currentValue: holding.currentValue,
    absoluteGain: Number(absoluteGain.toFixed(2)),
    percentGain: Number(percentGain.toFixed(2)),
    weightPct: Number(weightPct.toFixed(2)),
  }
}

export function buildPortfolioSnapshot(holdings: Portfolio[]): PortfolioSnapshot {
  const invested = holdings.reduce((sum, h) => sum + h.investedValue, 0)
  const current = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const absoluteGain = current - invested
  const percentGain = invested ? (absoluteGain / invested) * 100 : 0

  const gains = holdings
    .map((h) => holdingGain(h, current))
    .sort((a, b) => b.percentGain - a.percentGain)

  const categoryCounts = holdings.reduce<Record<string, number>>((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + 1
    return acc
  }, {})

  return {
    invested: Number(invested.toFixed(2)),
    current: Number(current.toFixed(2)),
    absoluteGain: Number(absoluteGain.toFixed(2)),
    percentGain: Number(percentGain.toFixed(2)),
    holdingCount: holdings.length,
    categoryCounts,
    topHoldings: gains.slice(0, 3),
    laggards: [...gains].reverse().slice(0, 3),
  }
}

export function findDuplicateSchemes(holdings: Portfolio[]): string[] {
  const counts = new Map<string, number>()
  for (const h of holdings) {
    const key = h.schemeCode || h.schemeName
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key]) => key)
}

export function concentrationRisk(holdings: Portfolio[], thresholdPct = 25): HoldingGain[] {
  const current = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  return holdings
    .map((h) => holdingGain(h, current))
    .filter((h) => h.weightPct >= thresholdPct)
    .sort((a, b) => b.weightPct - a.weightPct)
}

export function rebalanceHints(
  holdings: Portfolio[],
  targetWeights: Record<string, number>
): Array<{ category: string; actualPct: number; targetPct: number; deltaPct: number }> {
  const current = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const actual: Record<string, number> = {}
  for (const h of holdings) {
    actual[h.category] = (actual[h.category] || 0) + h.currentValue
  }

  const categories = new Set([...Object.keys(targetWeights), ...Object.keys(actual)])
  return Array.from(categories)
    .map((category) => {
      const actualPct = current ? ((actual[category] || 0) / current) * 100 : 0
      const targetPct = targetWeights[category] || 0
      return {
        category,
        actualPct: Number(actualPct.toFixed(2)),
        targetPct,
        deltaPct: Number((actualPct - targetPct).toFixed(2)),
      }
    })
    .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
}
