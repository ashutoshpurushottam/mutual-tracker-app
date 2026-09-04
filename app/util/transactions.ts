import axios from "axios"

const INV_BASE = "http://localhost:8888"

export type TransactionType = "PURCHASE" | "SIP" | "REDEMPTION" | "SWITCH_IN" | "SWITCH_OUT"

export type PortfolioTransaction = {
  id: string
  userId: string
  holdingId: string
  schemeCode: string | null
  schemeName: string
  amcName: string
  folioNumber: string
  type: TransactionType
  amount: number
  units: number
  nav: number
  date: string
  notes?: string
}

export type TransactionSummary = {
  totalInflows: number
  totalOutflows: number
  sipCount: number
  purchaseCount: number
  netCashFlow: number
}

export function summarizeTransactions(txns: PortfolioTransaction[]): TransactionSummary {
  let totalInflows = 0
  let totalOutflows = 0
  let sipCount = 0
  let purchaseCount = 0

  for (const txn of txns) {
    if (txn.type === "PURCHASE" || txn.type === "SIP" || txn.type === "SWITCH_IN") {
      totalInflows += txn.amount
    }
    if (txn.type === "REDEMPTION" || txn.type === "SWITCH_OUT") {
      totalOutflows += txn.amount
    }
    if (txn.type === "SIP") sipCount += 1
    if (txn.type === "PURCHASE") purchaseCount += 1
  }

  return {
    totalInflows: Number(totalInflows.toFixed(2)),
    totalOutflows: Number(totalOutflows.toFixed(2)),
    sipCount,
    purchaseCount,
    netCashFlow: Number((totalInflows - totalOutflows).toFixed(2)),
  }
}

export function filterTransactions(
  txns: PortfolioTransaction[],
  opts: { type?: TransactionType | "ALL"; schemeCode?: string | null; query?: string } = {}
): PortfolioTransaction[] {
  const type = opts.type || "ALL"
  const q = (opts.query || "").trim().toLowerCase()
  return txns.filter((txn) => {
    if (type !== "ALL" && txn.type !== type) return false
    if (opts.schemeCode && txn.schemeCode !== opts.schemeCode) return false
    if (!q) return true
    return (
      txn.schemeName.toLowerCase().includes(q) ||
      txn.amcName.toLowerCase().includes(q) ||
      txn.folioNumber.toLowerCase().includes(q) ||
      txn.type.toLowerCase().includes(q)
    )
  })
}

export function transactionTypeLabel(type: TransactionType): string {
  switch (type) {
    case "PURCHASE":
      return "Purchase"
    case "SIP":
      return "SIP"
    case "REDEMPTION":
      return "Redemption"
    case "SWITCH_IN":
      return "Switch in"
    case "SWITCH_OUT":
      return "Switch out"
    default:
      return type
  }
}

export function isInflow(type: TransactionType): boolean {
  return type === "PURCHASE" || type === "SIP" || type === "SWITCH_IN"
}

export async function fetchTransactions(userId: string): Promise<PortfolioTransaction[]> {
  const response = await axios.get<PortfolioTransaction[]>(
    `${INV_BASE}/users/${userId}/transactions`
  )
  return response.data
}
