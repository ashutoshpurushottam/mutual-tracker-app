'use client'

import { useEffect, useState, useCallback } from 'react'
import { addInvestments, fetchPortfolios, InvestmentRow, Portfolio } from '../util/InvestmentUtil'
import { AuthService } from '../util/ApiUtils'
import { DashboardInvestmentDetails } from './dashboard-detail'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UploadCAMSReport from './upload-cams-report'
import AddInvestmentForm from './add-investment'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function DashboardContent() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const refreshPortfolios = useCallback(async () => {
    const userId = AuthService.getUserProfile()?.userId
    if (!userId) {
      setPortfolios([])
      return
    }
    setRefreshing(true)
    try {
      const data = await fetchPortfolios(userId)
      setPortfolios(data)
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    refreshPortfolios()
  }, [refreshPortfolios])

  async function handleCAMSUpload(_data: unknown): Promise<void> {
    setShowUploadModal(false)
    await refreshPortfolios()
    toast({
      title: 'CAMS report processed',
      description: 'Your portfolio has been updated with holdings from the report.',
    })
  }

  async function handleAddInvestment(investments: InvestmentRow[]): Promise<void> {
    const userId = AuthService.getUserId()
    if (!userId) {
      toast({
        title: 'Not signed in',
        description: 'Please sign in to add investments.',
        variant: 'destructive',
      })
      return
    }
    try {
      await addInvestments(userId, investments)
      await refreshPortfolios()
      toast({
        title: 'Investments added',
        description: `Added ${investments.length} investment(s) to your portfolio.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Failed to add investments',
        description: 'Could not save investments. Is the mock API running on :8888?',
        variant: 'destructive',
      })
    }
  }

  if (portfolios.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mutual Fund Portfolio Dashboard</h1>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload CAMS Report
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Investments Found</CardTitle>
            <CardDescription>
              Start by adding your first investment below or upload a CAMS report.
              {refreshing ? ' Refreshing…' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddInvestmentForm onAddInvestment={handleAddInvestment} />
          </CardContent>
        </Card>
        {showUploadModal && (
          <UploadCAMSReport onUpload={handleCAMSUpload} onClose={() => setShowUploadModal(false)} />
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mutual Fund Portfolio Dashboard</h1>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload CAMS Report
        </Button>
      </div>
      <DashboardInvestmentDetails data={portfolios} />
      {showUploadModal && (
        <UploadCAMSReport onUpload={handleCAMSUpload} onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  )
}
