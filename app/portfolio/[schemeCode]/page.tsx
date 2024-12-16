import { PortfolioDetails } from "@/app/components/portfolio-details";


export default function PortfolioPage({ params }: { params: { schemeCode: string } }) {
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Portfolio Details</h1>
      
      <PortfolioDetails schemeCode={params.schemeCode} />
    </div>
  )
}
