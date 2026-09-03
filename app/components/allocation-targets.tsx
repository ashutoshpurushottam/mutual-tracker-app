"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Portfolio } from "@/app/util/InvestmentUtil"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import {
  ALLOCATION_CATEGORIES,
  AllocationTargets,
  computeAllocationDrift,
  DEFAULT_ALLOCATION_TARGETS,
  driftStatus,
  DRIFT_TOLERANCE_PP,
  loadAllocationTargets,
  saveAllocationTargets,
  sumTargets,
  targetsAreValid,
} from "@/app/util/allocation-targets"

function formatPp(value: number): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)} pp`
}

export function AllocationTargetsPanel({ portfolios }: { portfolios: Portfolio[] }) {
  const { user } = useAuth()
  const userId = user?.userId ?? null

  const [draft, setDraft] = useState<AllocationTargets>(() =>
    loadAllocationTargets(userId)
  )
  const [saved, setSaved] = useState<AllocationTargets>(() =>
    loadAllocationTargets(userId)
  )

  useEffect(() => {
    const loaded = loadAllocationTargets(userId)
    setDraft(loaded)
    setSaved(loaded)
  }, [userId])

  const driftRows = useMemo(
    () => computeAllocationDrift(portfolios, saved),
    [portfolios, saved]
  )

  const chartData = useMemo(
    () =>
      driftRows.map((row) => ({
        category: row.category,
        Actual: Number(row.actualPercent.toFixed(1)),
        Target: Number(row.targetPercent.toFixed(1)),
      })),
    [driftRows]
  )

  const totalDraft = sumTargets(draft)
  const draftValid = targetsAreValid(draft)

  const handleChange = (category: keyof AllocationTargets, value: string) => {
    const next = value === "" ? 0 : Number(value)
    setDraft((prev) => ({
      ...prev,
      [category]: Number.isFinite(next) ? next : 0,
    }))
  }

  const handleSave = () => {
    if (!userId) {
      toast({
        title: "Not signed in",
        description: "Sign in to save allocation targets.",
        variant: "destructive",
      })
      return
    }
    if (!draftValid) {
      toast({
        title: "Targets must total 100%",
        description: `Current total is ${totalDraft.toFixed(1)}%. Adjust the category weights.`,
        variant: "destructive",
      })
      return
    }
    saveAllocationTargets(userId, draft)
    setSaved({ ...draft })
    toast({
      title: "Allocation targets saved",
      description: "Drift vs your portfolio will update using these goals.",
    })
  }

  const handleReset = () => {
    setDraft({ ...DEFAULT_ALLOCATION_TARGETS })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Allocation targets</CardTitle>
          <CardDescription>
            Set category goals that sum to 100%. Drift within ±{DRIFT_TOLERANCE_PP} pp is
            treated as on target.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {ALLOCATION_CATEGORIES.map((category) => (
              <div key={category} className="space-y-2">
                <Label htmlFor={`target-${category}`}>{category} (%)</Label>
                <Input
                  id={`target-${category}`}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={draft[category]}
                  onChange={(e) => handleChange(category, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className={`text-sm font-medium ${
                draftValid ? "text-muted-foreground" : "text-red-600"
              }`}
            >
              Total: {totalDraft.toFixed(1)}%
              {!draftValid && " (must equal 100%)"}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset defaults
              </Button>
              <Button type="button" onClick={handleSave} disabled={!draftValid}>
                Save targets
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actual vs target</CardTitle>
          <CardDescription>
            How your current portfolio mix compares to saved goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis unit="%" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="Actual" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Category</th>
                  <th className="py-2 pr-3 font-medium">Actual</th>
                  <th className="py-2 pr-3 font-medium">Target</th>
                  <th className="py-2 font-medium">Drift</th>
                </tr>
              </thead>
              <tbody>
                {driftRows.map((row) => {
                  const status = driftStatus(row.drift)
                  const driftClass =
                    status === "on-target"
                      ? "text-green-600"
                      : status === "over"
                        ? "text-amber-600"
                        : "text-red-600"
                  return (
                    <tr key={row.category} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.category}</td>
                      <td className="py-2 pr-3">{row.actualPercent.toFixed(1)}%</td>
                      <td className="py-2 pr-3">{row.targetPercent.toFixed(1)}%</td>
                      <td className={`py-2 font-medium ${driftClass}`}>
                        {formatPp(row.drift)}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {status === "on-target"
                            ? "on target"
                            : status === "over"
                              ? "overweight"
                              : "underweight"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
