"use client"

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
import { CompareFund } from "@/app/util/fund-compare"

type CompareReturnsChartProps = {
  funds: CompareFund[]
}

export function CompareReturnsChart({ funds }: CompareReturnsChartProps) {
  if (funds.length < 2) return null

  const chartData = [
    {
      period: "1Y",
      ...Object.fromEntries(funds.map((f) => [f.schemeId, f.returns.oneYear])),
    },
    {
      period: "3Y",
      ...Object.fromEntries(funds.map((f) => [f.schemeId, f.returns.threeYear])),
    },
    {
      period: "5Y",
      ...Object.fromEntries(funds.map((f) => [f.schemeId, f.returns.fiveYear])),
    },
  ]

  const colors = ["#0f766e", "#1d4ed8", "#b45309"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Returns comparison</CardTitle>
        <CardDescription>Absolute period returns (%) for each selected scheme.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="period" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              {funds.map((fund, index) => (
                <Bar
                  key={fund.schemeId}
                  dataKey={fund.schemeId}
                  name={fund.schemeName}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
