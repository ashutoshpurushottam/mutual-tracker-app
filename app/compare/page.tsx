"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GitCompareArrows, Plus, Search, X } from "lucide-react"
import { NavBar } from "@/app/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchFundDetails } from "@/app/util/InvestmentUtil"
import {
  addCompareFund,
  buildCompareMetricRows,
  canAddCompareFund,
  compareReady,
  CompareCandidate,
  CompareFund,
  formatMetricValue,
  MAX_COMPARE_FUNDS,
  parseCompareIds,
  removeCompareFund,
  serializeCompareIds,
} from "@/app/util/fund-compare"
import { Suspense } from "react"
import { CompareReturnsChart } from "@/app/components/compare-returns-chart"

export default function ComparePage() {
  return (
    <>
      <NavBar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <Suspense fallback={<p className="text-muted-foreground">Loading compare…</p>}>
          <CompareContent />
        </Suspense>
      </main>
    </>
  )
}

function CompareContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idsFromUrl = useMemo(
    () => parseCompareIds(searchParams.get("ids")),
    [searchParams]
  )

  const [selectedIds, setSelectedIds] = useState<string[]>(idsFromUrl)
  const [funds, setFunds] = useState<CompareFund[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<CompareCandidate[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    setSelectedIds(idsFromUrl)
  }, [idsFromUrl])

  const syncUrl = useCallback(
    (ids: string[]) => {
      const qs = serializeCompareIds(ids)
      router.replace(qs ? `/compare?ids=${encodeURIComponent(qs)}` : "/compare")
    },
    [router]
  )

  useEffect(() => {
    if (!selectedIds.length) {
      setFunds([])
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all(
      selectedIds.map(async (schemeId) => {
        const details = await fetchFundDetails(schemeId)
        return { ...details, schemeId } satisfies CompareFund
      })
    )
      .then((loaded) => {
        if (!cancelled) setFunds(loaded)
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load one or more funds. Is the mock API running on :8888?")
          setFunds([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedIds])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    const handle = window.setTimeout(() => {
      setSearching(true)
      fetch(
        `http://localhost:8888/fund/search?query=${encodeURIComponent(query.trim())}`
      )
        .then((res) => {
          if (!res.ok) throw new Error("search failed")
          return res.json()
        })
        .then((data: CompareCandidate[]) => setSuggestions(data.slice(0, 8)))
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false))
    }, 250)
    return () => window.clearTimeout(handle)
  }, [query])

  const rows = useMemo(() => buildCompareMetricRows(funds), [funds])

  const handleAdd = (candidate: CompareCandidate) => {
    const next = addCompareFund(selectedIds, candidate.schemeId)
    if (next === selectedIds) return
    setSelectedIds(next)
    syncUrl(next)
    setQuery("")
    setSuggestions([])
  }

  const handleRemove = (schemeId: string) => {
    const next = removeCompareFund(selectedIds, schemeId)
    setSelectedIds(next)
    syncUrl(next)
  }

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (suggestions[0]) handleAdd(suggestions[0])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <GitCompareArrows className="h-8 w-8" />
          Compare funds
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pick {MIN_LABEL} schemes to compare NAV, AUM, expense ratio, and returns side by side.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selected schemes</CardTitle>
          <CardDescription>
            Up to {MAX_COMPARE_FUNDS} funds. Search the catalog and add them to the comparison.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {selectedIds.length === 0 && (
              <p className="text-sm text-muted-foreground">No funds selected yet.</p>
            )}
            {funds.map((fund) => (
              <div
                key={fund.schemeId}
                className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm"
              >
                <Link href={`/portfolio/${fund.schemeId}`} className="hover:underline">
                  {fund.schemeName}
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemove(fund.schemeId)}
                  aria-label={`Remove ${fund.schemeName}`}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {selectedIds
              .filter((id) => !funds.some((f) => f.schemeId === id))
              .map((id) => (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {id}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemove(id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative space-y-2">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by scheme name, AMC, or id…"
                disabled={selectedIds.length >= MAX_COMPARE_FUNDS}
              />
              <Button type="submit" disabled={!suggestions.length}>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            {searching && <p className="text-xs text-muted-foreground">Searching…</p>}
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full rounded-md border bg-background shadow-md">
                {suggestions.map((item) => {
                  const disabled = !canAddCompareFund(selectedIds, item.schemeId)
                  return (
                    <li key={item.schemeId}>
                      <button
                        type="button"
                        disabled={disabled}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
                        onClick={() => handleAdd(item)}
                      >
                        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{item.schemeName}</span>
                        <span className="text-xs text-muted-foreground">{item.schemeId}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-muted-foreground">Loading fund metrics…</p>}

      {!loading && !error && selectedIds.length > 0 && !compareReady(selectedIds) && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Add at least one more fund to start comparing.
          </CardContent>
        </Card>
      )}

      {!loading && !error && compareReady(selectedIds) && funds.length >= 2 && (
        <>
          <CompareReturnsChart funds={funds} />
          <Card>
            <CardHeader>
              <CardTitle>Side-by-side metrics</CardTitle>
              <CardDescription>
                Highlighted cells mark the stronger value for that row (higher returns / AUM, lower
                expense).
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Metric</TableHead>
                    {funds.map((fund) => (
                      <TableHead key={fund.schemeId}>
                        <Link
                          href={`/portfolio/${fund.schemeId}`}
                          className="font-medium hover:underline"
                        >
                          {fund.schemeName}
                        </Link>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      {row.values.map((value, index) => {
                        const isBest = row.bestIndexes?.includes(index)
                        return (
                          <TableCell
                            key={`${row.key}-${index}`}
                            className={
                              isBest ? "bg-green-50 font-semibold dark:bg-green-950/30" : undefined
                            }
                          >
                            {formatMetricValue(row.format, value)}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

const MIN_LABEL = "2–3"
