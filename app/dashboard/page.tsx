import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import MutualFundPortfolio from "./MutualFundPortfolio"


export const metadata: Metadata = {
  title: "Mutual Fund Portfolio Dashboard",
  description: "View and manage your mutual fund investments",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <Link href="/" passHref>
        <Button variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>
      <MutualFundPortfolio />
    </div>
  )
}
