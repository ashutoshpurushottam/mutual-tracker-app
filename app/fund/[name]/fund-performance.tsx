"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { fetchFundPerformance, FundPerformanceData } from "@/app/util/InvestmentUtil"
import { WatchButton } from "@/app/components/watch-button"
import { NavBar } from "@/app/components/navbar"

interface FundPerformanceProps {
  fundName: string
}

export default function FundPerformance({ fundName }: FundPerformanceProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1M")
  const [performanceData, setPerformanceData] = useState<FundPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await fetchFundPerformance(fundName)
        setPerformanceData(data)
        setError(null)
      } catch {
        setError("Failed to fetch fund data. Please try again later.")
        setPerformanceData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fundName])

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  if (!performanceData) {
    return <div className="text-center py-10">No data available for this fund.</div>
  }

  const periodKey = selectedPeriod as keyof Pick<
    FundPerformanceData,
    "1M" | "3M" | "1Y" | "3Y" | "5Y" | "SI"
  >
  const currentPerformanceData = performanceData[periodKey] || []
  const startValue = currentPerformanceData[0]?.value ?? 100
  const endValue = currentPerformanceData[currentPerformanceData.length - 1]?.value ?? 100
  const totalReturn = ((endValue - startValue) / startValue) * 100

  return (
    <>
      <NavBar />
      <div className="container mx-auto py-10 pt-24">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{performanceData.schemeName || fundName}</CardTitle>
            <CardDescription>
              {performanceData.amcName} · {performanceData.category} · Performance over time
            </CardDescription>
          </div>
          <WatchButton
            schemeId={performanceData.schemeId || fundName}
            schemeName={performanceData.schemeName || fundName}
            amcName={performanceData.amcName}
            category={performanceData.category}
          />
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="3M">3M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
              <TabsTrigger value="3Y">3Y</TabsTrigger>
              <TabsTrigger value="5Y">5Y</TabsTrigger>
              <TabsTrigger value="SI">Since Inception</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedPeriod}>
              <div className="mt-4">
                <p className="text-lg font-semibold mb-2">
                  Total Return:{" "}
                  <span className={totalReturn >= 0 ? "text-green-600" : "text-red-600"}>
                    {totalReturn.toFixed(2)}%
                  </span>
                </p>
                <ChartContainer
                  config={{
                    value: {
                      label: "Value",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-value)"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </>
  )
}
