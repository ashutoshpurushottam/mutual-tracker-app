"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { PortfolioTable } from "../components/portfolio-table"
import { Portfolio } from "../util/InvestmentUtil"
import { AllocationTargetsPanel } from "../components/allocation-targets"
import { TransactionHistoryPanel } from "../components/transaction-history"

type DashboardInvestmentDetailsProps = {
  data: Portfolio[]
  userId?: string | null
  onDeleteHolding?: (holding: Portfolio) => void | Promise<void>
  deletingId?: string | null
}

export function DashboardInvestmentDetails({
  data,
  userId = null,
  onDeleteHolding,
  deletingId = null,
}: DashboardInvestmentDetailsProps) {
  const totalInvestments = data.reduce((sum, row) => sum + row.investedValue, 0)
  const totalCurrentValue = data.reduce((sum, row) => sum + row.currentValue, 0)
  const totalGainLoss = totalCurrentValue - totalInvestments
  const gainLossPercentage = totalInvestments
    ? (totalGainLoss / totalInvestments) * 100
    : 0

  const categoryData = data.reduce((acc, portfolio) => {
    acc[portfolio.category] = (acc[portfolio.category] || 0) + portfolio.currentValue
    return acc
  }, {} as Record<string, number>)

  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))

  const amcData = data.reduce((acc, row) => {
    acc[row.amcName] = (acc[row.amcName] || 0) + row.currentValue
    return acc
  }, {} as Record<string, number>)

  const barChartData = Object.entries(amcData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalInvestments.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalCurrentValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
              ₹{totalGainLoss.toFixed(2)} ({gainLossPercentage.toFixed(2)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AMC-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(value as number)
                    }
                  />
                  <Bar dataKey="value" fill="#8884d8">
                    {barChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <AllocationTargetsPanel portfolios={data} />

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioTable
            data={data}
            onDeleteHolding={onDeleteHolding}
            deletingId={deletingId}
          />
        </CardContent>
      </Card>

      {userId ? <TransactionHistoryPanel userId={userId} /> : null}
    </div>
  )
}
