"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

// Mock data - replace with actual data fetching logic
const mockPerformanceData = {
  "1M": [
    { date: "2023-05-01", value: 100 }, 
    { date: "2023-05-15", value: 102 },
    { date: "2023-05-31", value: 103 },
  ],
  "3M": [
    { date: "2023-03-01", value: 100 },
    { date: "2023-04-01", value: 102 },
    { date: "2023-05-01", value: 104 },
    { date: "2023-05-31", value: 106 },
  ],
  "1Y": [
    { date: "2022-06-01", value: 100 },
    { date: "2022-09-01", value: 105 },
    { date: "2022-12-01", value: 110 },
    { date: "2023-03-01", value: 115 },
    { date: "2023-05-31", value: 120 },
  ],
  "3Y": [
    { date: "2020-06-01", value: 100 },
    { date: "2021-06-01", value: 120 },
    { date: "2022-06-01", value: 140 },
    { date: "2023-05-31", value: 160 },
  ],
  "5Y": [
    { date: "2018-06-01", value: 100 },
    { date: "2019-06-01", value: 110 },
    { date: "2020-06-01", value: 120 },
    { date: "2021-06-01", value: 140 },
    { date: "2022-06-01", value: 160 },
    { date: "2023-05-31", value: 180 },
  ],
  "SI": [
    { date: "2010-01-01", value: 100 },
    { date: "2012-01-01", value: 120 },
    { date: "2014-01-01", value: 150 },
    { date: "2016-01-01", value: 180 },
    { date: "2018-01-01", value: 220 },
    { date: "2020-01-01", value: 260 },
    { date: "2022-01-01", value: 300 },
    { date: "2023-05-31", value: 320 },
  ],
}

interface FundPerformanceProps {
  fundName: string
}

export default function FundPerformance({ fundName }: FundPerformanceProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1M")
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulating an API call
    const fetchData = async () => {
      setLoading(true)
      try {
        // Replace this with actual API call when implemented
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        if (mockPerformanceData) {
          setPerformanceData(mockPerformanceData)
          setError(null)
        } else {
          throw new Error("No data available")
        }
      } catch (err) {
        setError("Failed to fetch fund data. Please try again later.")
        setPerformanceData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fundName]) // Re-fetch when fundName changes

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  if (!performanceData) {
    return <div className="text-center py-10">No data available for this fund.</div>
  }

  const currentPerformanceData = performanceData[selectedPeriod]
  const startValue = currentPerformanceData[0].value
  const endValue = currentPerformanceData[currentPerformanceData.length - 1].value
  const totalReturn = ((endValue - startValue) / startValue) * 100

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{fundName}</CardTitle>
          <CardDescription>Performance over time</CardDescription>
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
                  Total Return: <span className={totalReturn >= 0 ? "text-green-600" : "text-red-600"}>{totalReturn.toFixed(2)}%</span>
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
                      <Line type="monotone" dataKey="value" stroke="var(--color-value)" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

