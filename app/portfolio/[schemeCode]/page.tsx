"use client"

import { PortfolioDetails } from "@/app/components/portfolio-details"
import { RequireAuth } from "@/app/components/require-auth"
import { NavBar } from "@/app/components/navbar"

export default function PortfolioPage({
  params,
}: {
  params: { schemeCode: string }
}) {
  return (
    <RequireAuth>
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">Portfolio Details</h1>
        <PortfolioDetails schemeCode={params.schemeCode} />
      </div>
    </RequireAuth>
  )
}
