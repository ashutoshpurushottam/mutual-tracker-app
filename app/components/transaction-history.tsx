"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { History } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  averageMonthlySip,
  buildMonthlyCashflow,
  buildSchemeCashflow,
  formatMonthLabel,
} from "@/app/util/cashflow"
import {
  fetchTransactions,
  filterTransactions,
  isInflow,
  PortfolioTransaction,
  summarizeTransactions,
  TransactionType,
  transactionTypeLabel,
} from "@/app/util/transactions"

const TYPE_FILTERS: Array<TransactionType | "ALL"> = [
  "ALL",
  "SIP",
  "PURCHASE",
  "REDEMPTION",
  "SWITCH_IN",
  "SWITCH_OUT",
]

type TransactionHistoryPanelProps = {
  userId: string
}

export function TransactionHistoryPanel({ userId }: TransactionHistoryPanelProps) {
  const [txns, setTxns] = useState<PortfolioTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL")
  const [query, setQuery] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTransactions(userId)
      setTxns(data)
    } catch {
      setError("Could not load transaction history. Is the mock API running on :8888?")
      setTxns([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () => filterTransactions(txns, { type: typeFilter, query }),
    [txns, typeFilter, query]
  )
  const summary = useMemo(() => summarizeTransactions(filtered), [filtered])
  const monthly = useMemo(() => buildMonthlyCashflow(filtered).slice(-6), [filtered])
  const topSchemes = useMemo(() => buildSchemeCashflow(filtered).slice(0, 5), [filtered])
  const avgSip = useMemo(() => averageMonthlySip(filtered), [filtered])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction & SIP history
            </CardTitle>
            <CardDescription>
              Synthetic ledger derived from your holdings for demo cash-flow review.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryStat label="Inflows" value={summary.totalInflows} positive />
          <SummaryStat label="Outflows" value={summary.totalOutflows} />
          <SummaryStat label="Net cash flow" value={summary.netCashFlow} signed />
          <SummaryStat label="Avg monthly SIP" value={avgSip} positive />
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">SIP / purchases</p>
            <p className="text-lg font-semibold">
              {summary.sipCount} / {summary.purchaseCount}
            </p>
          </div>
        </div>

        {!loading && !error && monthly.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">In</TableHead>
                    <TableHead className="text-right">Out</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthly.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{formatMonthLabel(row.month)}</TableCell>
                      <TableCell className="text-right">{formatInr(row.inflows)}</TableCell>
                      <TableCell className="text-right">{formatInr(row.outflows)}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          row.net >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatInr(row.net)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Top schemes (net)</TableHead>
                    <TableHead className="text-right">Txns</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSchemes.map((row) => (
                    <TableRow key={row.schemeCode || row.schemeName}>
                      <TableCell className="max-w-[220px] truncate">{row.schemeName}</TableCell>
                      <TableCell className="text-right">{row.txnCount}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatInr(row.net)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by scheme, AMC, folio…"
            className="sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-1">
            {TYPE_FILTERS.map((type) => (
              <Button
                key={type}
                type="button"
                size="sm"
                variant={typeFilter === type ? "default" : "outline"}
                onClick={() => setTypeFilter(type)}
              >
                {type === "ALL" ? "All" : transactionTypeLabel(type)}
              </Button>
            ))}
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading transactions…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions match the current filters.
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scheme</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">NAV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 40).map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="whitespace-nowrap">{txn.date}</TableCell>
                    <TableCell>
                      <span
                        className={
                          isInflow(txn.type) ? "text-green-600" : "text-amber-700"
                        }
                      >
                        {transactionTypeLabel(txn.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate font-medium">{txn.schemeName}</p>
                        <p className="text-xs text-muted-foreground">{txn.folioNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatInr(txn.amount)}
                    </TableCell>
                    <TableCell className="text-right">{txn.units.toFixed(3)}</TableCell>
                    <TableCell className="text-right">{txn.nav.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length > 40 && (
              <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                Showing 40 of {filtered.length} transactions.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryStat({
  label,
  value,
  positive,
  signed,
}: {
  label: string
  value: number
  positive?: boolean
  signed?: boolean
}) {
  const tone =
    signed && value < 0
      ? "text-red-600"
      : positive || (signed && value >= 0)
        ? "text-green-600"
        : undefined
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${tone || ""}`}>{formatInr(value)}</p>
    </div>
  )
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}
