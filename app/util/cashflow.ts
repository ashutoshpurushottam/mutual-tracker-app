import { PortfolioTransaction, isInflow } from "@/app/util/transactions"

export type MonthlyCashflow = {
  month: string
  inflows: number
  outflows: number
  net: number
  sipAmount: number
  purchaseAmount: number
}

export type SchemeCashflow = {
  schemeCode: string | null
  schemeName: string
  inflows: number
  outflows: number
  net: number
  txnCount: number
}

function monthKey(date: string): string {
  return date.slice(0, 7)
}

export function buildMonthlyCashflow(txns: PortfolioTransaction[]): MonthlyCashflow[] {
  const map = new Map<string, MonthlyCashflow>()

  for (const txn of txns) {
    const key = monthKey(txn.date)
    const row =
      map.get(key) ||
      ({
        month: key,
        inflows: 0,
        outflows: 0,
        net: 0,
        sipAmount: 0,
        purchaseAmount: 0,
      } satisfies MonthlyCashflow)

    if (isInflow(txn.type)) {
      row.inflows += txn.amount
      if (txn.type === "SIP") row.sipAmount += txn.amount
      if (txn.type === "PURCHASE") row.purchaseAmount += txn.amount
    } else {
      row.outflows += txn.amount
    }
    map.set(key, row)
  }

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      inflows: Number(row.inflows.toFixed(2)),
      outflows: Number(row.outflows.toFixed(2)),
      sipAmount: Number(row.sipAmount.toFixed(2)),
      purchaseAmount: Number(row.purchaseAmount.toFixed(2)),
      net: Number((row.inflows - row.outflows).toFixed(2)),
    }))
    .sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0))
}

export function buildSchemeCashflow(txns: PortfolioTransaction[]): SchemeCashflow[] {
  const map = new Map<string, SchemeCashflow>()

  for (const txn of txns) {
    const key = txn.schemeCode || txn.schemeName
    const row =
      map.get(key) ||
      ({
        schemeCode: txn.schemeCode,
        schemeName: txn.schemeName,
        inflows: 0,
        outflows: 0,
        net: 0,
        txnCount: 0,
      } satisfies SchemeCashflow)

    if (isInflow(txn.type)) row.inflows += txn.amount
    else row.outflows += txn.amount
    row.txnCount += 1
    map.set(key, row)
  }

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      inflows: Number(row.inflows.toFixed(2)),
      outflows: Number(row.outflows.toFixed(2)),
      net: Number((row.inflows - row.outflows).toFixed(2)),
    }))
    .sort((a, b) => b.net - a.net)
}

export function averageMonthlySip(txns: PortfolioTransaction[]): number {
  const monthly = buildMonthlyCashflow(txns).filter((m) => m.sipAmount > 0)
  if (!monthly.length) return 0
  const total = monthly.reduce((sum, m) => sum + m.sipAmount, 0)
  return Number((total / monthly.length).toFixed(2))
}

export function largestOutflow(txns: PortfolioTransaction[]): PortfolioTransaction | null {
  let best: PortfolioTransaction | null = null
  for (const txn of txns) {
    if (isInflow(txn.type)) continue
    if (!best || txn.amount > best.amount) best = txn
  }
  return best
}

export function cashflowTrend(
  monthly: MonthlyCashflow[]
): Array<{ month: string; label: "up" | "down" | "flat"; delta: number }> {
  const out: Array<{ month: string; label: "up" | "down" | "flat"; delta: number }> = []
  for (let i = 0; i < monthly.length; i++) {
    if (i === 0) {
      out.push({ month: monthly[i].month, label: "flat", delta: 0 })
      continue
    }
    const delta = Number((monthly[i].net - monthly[i - 1].net).toFixed(2))
    const label = delta > 0 ? "up" : delta < 0 ? "down" : "flat"
    out.push({ month: monthly[i].month, label, delta })
  }
  return out
}

export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split("-")
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  const idx = Number(mon) - 1
  if (!year || idx < 0 || idx > 11) return month
  return `${names[idx]} ${year}`
}
