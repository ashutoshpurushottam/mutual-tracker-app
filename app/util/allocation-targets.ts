import { Portfolio } from "@/app/util/InvestmentUtil"

/** Categories used across the seeded catalog and add-investment flows. */
export const ALLOCATION_CATEGORIES = ["Equity", "Debt", "Hybrid", "Index"] as const

export type AllocationCategory = (typeof ALLOCATION_CATEGORIES)[number]

export type AllocationTargets = Record<AllocationCategory, number>

export type CategoryWeight = {
  category: string
  value: number
  percent: number
}

export type AllocationDriftRow = {
  category: string
  actualPercent: number
  targetPercent: number
  drift: number
  actualValue: number
}

export const DEFAULT_ALLOCATION_TARGETS: AllocationTargets = {
  Equity: 60,
  Debt: 20,
  Hybrid: 10,
  Index: 10,
}

const STORAGE_PREFIX = "mutualtrack:allocation-targets:"

export function storageKeyForUser(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`
}

export function loadAllocationTargets(userId: string | null | undefined): AllocationTargets {
  if (!userId || typeof window === "undefined") {
    return { ...DEFAULT_ALLOCATION_TARGETS }
  }
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId))
    if (!raw) return { ...DEFAULT_ALLOCATION_TARGETS }
    const parsed = JSON.parse(raw) as Partial<AllocationTargets>
    return {
      Equity: Number(parsed.Equity ?? DEFAULT_ALLOCATION_TARGETS.Equity),
      Debt: Number(parsed.Debt ?? DEFAULT_ALLOCATION_TARGETS.Debt),
      Hybrid: Number(parsed.Hybrid ?? DEFAULT_ALLOCATION_TARGETS.Hybrid),
      Index: Number(parsed.Index ?? DEFAULT_ALLOCATION_TARGETS.Index),
    }
  } catch {
    return { ...DEFAULT_ALLOCATION_TARGETS }
  }
}

export function saveAllocationTargets(userId: string, targets: AllocationTargets): void {
  if (typeof window === "undefined") return
  localStorage.setItem(storageKeyForUser(userId), JSON.stringify(targets))
}

export function sumTargets(targets: AllocationTargets): number {
  return ALLOCATION_CATEGORIES.reduce((sum, key) => sum + (Number(targets[key]) || 0), 0)
}

export function targetsAreValid(targets: AllocationTargets): boolean {
  if (ALLOCATION_CATEGORIES.some((key) => Number(targets[key]) < 0)) return false
  return Math.abs(sumTargets(targets) - 100) < 0.01
}

export function computeCategoryWeights(portfolios: Portfolio[]): CategoryWeight[] {
  const totals: Record<string, number> = {}
  let grandTotal = 0

  for (const p of portfolios) {
    const category = p.category || "Other"
    totals[category] = (totals[category] || 0) + p.currentValue
    grandTotal += p.currentValue
  }

  if (grandTotal <= 0) {
    return Object.keys(totals).map((category) => ({
      category,
      value: 0,
      percent: 0,
    }))
  }

  return Object.entries(totals)
    .map(([category, value]) => ({
      category,
      value,
      percent: (value / grandTotal) * 100,
    }))
    .sort((a, b) => b.value - a.value)
}

export function computeAllocationDrift(
  portfolios: Portfolio[],
  targets: AllocationTargets
): AllocationDriftRow[] {
  const weights = computeCategoryWeights(portfolios)
  const byCategory = Object.fromEntries(weights.map((w) => [w.category, w]))
  const categories = new Set<string>([
    ...ALLOCATION_CATEGORIES,
    ...weights.map((w) => w.category),
  ])

  return Array.from(categories)
    .map((category) => {
      const actual = byCategory[category]
      const targetPercent =
        category in targets
          ? Number(targets[category as AllocationCategory]) || 0
          : 0
      const actualPercent = actual?.percent ?? 0
      return {
        category,
        actualPercent,
        targetPercent,
        drift: actualPercent - targetPercent,
        actualValue: actual?.value ?? 0,
      }
    })
    .sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift))
}

/** Within this band (percentage points), allocation is considered on-target. */
export const DRIFT_TOLERANCE_PP = 2

export function driftStatus(drift: number): "on-target" | "over" | "under" {
  if (Math.abs(drift) <= DRIFT_TOLERANCE_PP) return "on-target"
  return drift > 0 ? "over" : "under"
}
