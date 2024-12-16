'use client'


import { useEffect, useState } from 'react'
import { fetchPortfolios } from '../util/InvestmentUtil'
import { AuthService, UserProfile } from '../util/ApiUtils'
import { Portfolio } from '../util/InvestmentUtil'
import { DashboardInvestmentDetails } from './dashboard-detail'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UploadCAMSReport from './upload-cams-report'
import AddInvestmentForm from './add-investment'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'




export function DashboardContent() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    const fetchAndSetPortfolios = async () => {
      const username = AuthService.getUserProfile()?.userId
      if (username) {
        const portfolios = await fetchPortfolios(username)
        setPortfolios(portfolios)
      }
    }
    fetchAndSetPortfolios()
  }, [])

  function handleCAMSUpload(data: any): void {
    throw new Error('Function not implemented.')
  }
  
  function handleAddInvestment(investments: InvestmentRow[]): void {
    throw new Error('Function not implemented.')
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
            <CardDescription>Start by adding your first investment below or upload a CAMS report.</CardDescription>
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
  } else {
   

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








}
