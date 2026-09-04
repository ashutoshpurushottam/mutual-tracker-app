'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  addInvestments,
  deleteInvestment,
  fetchPortfolios,
  InvestmentRow,
  Portfolio,
} from '../util/InvestmentUtil'
import { AuthService } from '../util/ApiUtils'
import { DashboardInvestmentDetails } from './dashboard-detail'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UploadCAMSReport from './upload-cams-report'
import AddInvestmentForm from './add-investment'
import { Button } from '@/components/ui/button'
import { Plus, Upload, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function DashboardContent() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      setShowAddModal(false)
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

  async function handleDeleteHolding(holding: Portfolio): Promise<void> {
    const userId = AuthService.getUserId()
    if (!userId) return

    const confirmed = window.confirm(
      `Remove “${holding.schemeName}” from your portfolio? This cannot be undone in this session.`
    )
    if (!confirmed) return

    setDeletingId(holding.id)
    try {
      await deleteInvestment(userId, holding.id)
      await refreshPortfolios()
      toast({
        title: 'Holding removed',
        description: holding.schemeName,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Could not delete holding',
        description: 'Check that the mock API is running on :8888.',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setShowAddModal(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add investment
      </Button>
      <Button onClick={() => setShowUploadModal(true)}>
        <Upload className="mr-2 h-4 w-4" /> Upload CAMS Report
      </Button>
    </div>
  )

  const modals = (
    <>
      {showUploadModal && (
        <UploadCAMSReport onUpload={handleCAMSUpload} onClose={() => setShowUploadModal(false)} />
      )}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative my-8 w-full max-w-3xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={() => setShowAddModal(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <AddInvestmentForm onAddInvestment={handleAddInvestment} />
          </div>
        </div>
      )}
    </>
  )

  if (portfolios.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Mutual Fund Portfolio Dashboard</h1>
          {headerActions}
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
        {modals}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Mutual Fund Portfolio Dashboard</h1>
        {headerActions}
      </div>
      <DashboardInvestmentDetails
        data={portfolios}
        userId={AuthService.getUserId()}
        onDeleteHolding={handleDeleteHolding}
        deletingId={deletingId}
      />
      {modals}
    </div>
  )
}
