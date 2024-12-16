'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PortfolioData {
  schemeName: string
  amcName: string
  category: string
  nav: number
  aum: number
  expenseRatio: number
  riskLevel: string
  returns: {
    oneYear: number
    threeYear: number
    fiveYear: number
  }
  historicalData: { date: string; nav: number }[]
}

// Mock function to fetch portfolio data
const fetchPortfolioData = async (schemeCode: string): Promise<PortfolioData> => {
  // In a real application, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
  return {
    schemeName: "Example Mutual Fund Scheme",
    amcName: "Example AMC",
    category: "Equity",
    nav: 25.6789,
    aum: 1000000000,
    expenseRatio: 1.5,
    riskLevel: "Moderate",
    returns: {
      oneYear: 12.5,
      threeYear: 10.2,
      fiveYear: 9.8
    },
    historicalData: [
      { date: '2023-01-01', nav: 20.5 },
      { date: '2023-02-01', nav: 21.2 },
      { date: '2023-03-01', nav: 22.8 },
      { date: '2023-04-01', nav: 23.5 },
      { date: '2023-05-01', nav: 24.1 },
      { date: '2023-06-01', nav: 25.6789 },
    ]
  }
}

export function PortfolioDetails({ schemeCode }: { schemeCode: string }) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData(schemeCode)
      .then(setPortfolioData)
      .finally(() => setIsLoading(false))
  }, [schemeCode])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!portfolioData) {
    return <div>Error loading portfolio data</div>
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{portfolioData.schemeName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">AMC</p>
              <p className="text-lg font-semibold">{portfolioData.amcName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="text-lg font-semibold">{portfolioData.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NAV</p>
              <p className="text-lg font-semibold">₹{portfolioData.nav.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AUM</p>
              <p className="text-lg font-semibold">₹{(portfolioData.aum / 10000000).toFixed(2)} Cr</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expense Ratio</p>
              <p className="text-lg font-semibold">{portfolioData.expenseRatio}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Level</p>
              <p className="text-lg font-semibold">{portfolioData.riskLevel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">1 Year</p>
              <p className="text-lg font-semibold">{portfolioData.returns.oneYear}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">3 Year</p>
              <p className="text-lg font-semibold">{portfolioData.returns.threeYear}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">5 Year</p>
              <p className="text-lg font-semibold">{portfolioData.returns.fiveYear}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historical NAV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioData.historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="nav" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

