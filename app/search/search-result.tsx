'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface FundResult {
  schemeId: string
  schemeName: string
}

export function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')
  const [results, setResults] = useState<FundResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query) {
      setIsLoading(true)
      setError(null)
      fetch(`http://localhost:8888/fund/search?query=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch results')
          return res.json()
        })
        .then((data) => setResults(data))
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false))
    }
  }, [query])

  if (!query) return null

  if (isLoading) return <p className="text-center">Loading...</p>

  if (error) return <p className="text-center text-red-500">Error: {error}</p>

  if (results.length === 0) return <p className="text-center">No results found.</p>

  return (
    <div className="space-y-4">
      {results.map((fund) => (
        <Card key="{fund.schemeId}" id={fund.schemeId} className="hover:shadow-md transition-shadow">
          <Link href={`/fund/${fund.schemeId}`}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{fund.schemeName}</h2>
              </div>
              <Button variant="ghost" size="icon">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">View details</span>
              </Button>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}

