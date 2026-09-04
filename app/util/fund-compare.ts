import { PortfolioDetailsData } from "@/app/util/InvestmentUtil"

export const MAX_COMPARE_FUNDS = 3
export const MIN_COMPARE_FUNDS = 2

export type CompareCandidate = {
  schemeId: string
  schemeName: string
}

export type CompareFund = PortfolioDetailsData & {
  schemeId: string
}

export type CompareMetricKey =
  | "nav"
  | "aum"
  | "expenseRatio"
  | "riskLevel"
  | "oneYear"
  | "threeYear"
  | "fiveYear"
  | "category"
  | "amcName"

export type CompareMetricRow = {
  key: CompareMetricKey
  label: string
  format: "currency" | "percent" | "number" | "text" | "aum"
  values: (string | number)[]
  bestIndexes?: number[]
}

export function parseCompareIds(raw: string | null | undefined): string[] {
  if (!raw) return []
  const seen = new Set<string>()
  const ids: string[] = []
  for (const part of raw.split(",")) {
    const id = part.trim().toUpperCase()
    if (!id || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
    if (ids.length >= MAX_COMPARE_FUNDS) break
  }
  return ids
}

export function serializeCompareIds(ids: string[]): string {
  return ids.map((id) => id.trim()).filter(Boolean).slice(0, MAX_COMPARE_FUNDS).join(",")
}

export function canAddCompareFund(current: string[], schemeId: string): boolean {
  if (!schemeId) return false
  if (current.includes(schemeId)) return false
  return current.length < MAX_COMPARE_FUNDS
}

export function addCompareFund(current: string[], schemeId: string): string[] {
  if (!canAddCompareFund(current, schemeId)) return current
  return [...current, schemeId]
}

export function removeCompareFund(current: string[], schemeId: string): string[] {
  return current.filter((id) => id !== schemeId)
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAum(aum: number): string {
  const cr = aum / 10000000
  if (cr >= 1000) return `₹${(cr / 1000).toFixed(2)}K Cr`
  return `₹${cr.toFixed(0)} Cr`
}

function bestNumericIndexes(values: number[], preferHigher: boolean): number[] {
  if (!values.length) return []
  const target = preferHigher ? Math.max(...values) : Math.min(...values)
  return values
    .map((v, i) => (v === target ? i : -1))
    .filter((i) => i >= 0)
}

export function buildCompareMetricRows(funds: CompareFund[]): CompareMetricRow[] {
  if (!funds.length) return []

  const navs = funds.map((f) => f.nav)
  const aums = funds.map((f) => f.aum)
  const expenses = funds.map((f) => f.expenseRatio)
  const oneYear = funds.map((f) => f.returns.oneYear)
  const threeYear = funds.map((f) => f.returns.threeYear)
  const fiveYear = funds.map((f) => f.returns.fiveYear)

  return [
    {
      key: "amcName",
      label: "AMC",
      format: "text",
      values: funds.map((f) => f.amcName),
    },
    {
      key: "category",
      label: "Category",
      format: "text",
      values: funds.map((f) => f.category),
    },
    {
      key: "nav",
      label: "NAV",
      format: "currency",
      values: navs,
    },
    {
      key: "aum",
      label: "AUM",
      format: "aum",
      values: aums,
      bestIndexes: bestNumericIndexes(aums, true),
    },
    {
      key: "expenseRatio",
      label: "Expense ratio",
      format: "percent",
      values: expenses,
      bestIndexes: bestNumericIndexes(expenses, false),
    },
    {
      key: "riskLevel",
      label: "Risk",
      format: "text",
      values: funds.map((f) => f.riskLevel),
    },
    {
      key: "oneYear",
      label: "1Y return",
      format: "percent",
      values: oneYear,
      bestIndexes: bestNumericIndexes(oneYear, true),
    },
    {
      key: "threeYear",
      label: "3Y return",
      format: "percent",
      values: threeYear,
      bestIndexes: bestNumericIndexes(threeYear, true),
    },
    {
      key: "fiveYear",
      label: "5Y return",
      format: "percent",
      values: fiveYear,
      bestIndexes: bestNumericIndexes(fiveYear, true),
    },
  ]
}

export function formatMetricValue(
  format: CompareMetricRow["format"],
  value: string | number
): string {
  if (format === "text") return String(value)
  if (typeof value !== "number" || Number.isNaN(value)) return "—"
  if (format === "currency") return formatInr(value)
  if (format === "aum") return formatAum(value)
  if (format === "percent") return `${value.toFixed(2)}%`
  return value.toFixed(2)
}

export function compareReady(ids: string[]): boolean {
  return ids.length >= MIN_COMPARE_FUNDS && ids.length <= MAX_COMPARE_FUNDS
}
