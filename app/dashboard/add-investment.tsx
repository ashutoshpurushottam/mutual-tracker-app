"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from 'lucide-react'

interface InvestmentRow {
  fundHouse: string
  folioNumber: string
  schemeName: string
  investment: string
  investmentDate: string
  isSIP: boolean
  sipFrequency?: 'Monthly' | 'Quarterly' | 'Yearly'
  sipStartDate?: string
  sipEndDate?: string
}

interface AddInvestmentFormProps {
  onAddInvestment: (investments: InvestmentRow[]) => void
}

export default function AddInvestmentForm({ onAddInvestment }: AddInvestmentFormProps) {
  const [investments, setInvestments] = useState<InvestmentRow[]>([
    { 
      fundHouse: "", 
      folioNumber: "", 
      schemeName: "", 
      investment: "", 
      investmentDate: "", 
      isSIP: false 
    }
  ])

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const updatedInvestments = investments.map((investment, i) => {
      if (i === index) {
        if (type === 'checkbox') {
          return { ...investment, [name]: (e.target as HTMLInputElement).checked }
        }
        return { ...investment, [name]: value }
      }
      return investment
    })
    setInvestments(updatedInvestments)
  }

  const handleAddRow = () => {
    setInvestments([...investments, { fundHouse: "", folioNumber: "", schemeName: "", investment: "", investmentDate: "", isSIP: false }])
  }

  const handleRemoveRow = (index: number) => {
    setInvestments(investments.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (investments.some(inv => !inv.fundHouse || !inv.folioNumber || !inv.schemeName || !inv.investment || !inv.investmentDate)) {
      alert("Please fill in all required fields for each investment")
      return
    }
    if (investments.some(inv => inv.isSIP && (!inv.sipFrequency || !inv.sipStartDate))) {
      alert("Please fill in all required SIP fields for SIP investments")
      return
    }
    onAddInvestment(investments.map(inv => ({ ...inv, investment: parseFloat(inv.investment) })))
    // Reset form after submission
    setInvestments([{ fundHouse: "", folioNumber: "", schemeName: "", investment: "", investmentDate: "", isSIP: false }])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Investments</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {investments.map((investment, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-md relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`fundHouse-${index}`}>Fund House</Label>
                  <Input
                    id={`fundHouse-${index}`}
                    name="fundHouse"
                    value={investment.fundHouse}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Enter fund house name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`folioNumber-${index}`}>Folio Number</Label>
                  <Input
                    id={`folioNumber-${index}`}
                    name="folioNumber"
                    value={investment.folioNumber}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Enter folio number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`schemeName-${index}`}>Scheme Name</Label>
                  <Input
                    id={`schemeName-${index}`}
                    name="schemeName"
                    value={investment.schemeName}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Enter scheme name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`investment-${index}`}>Investment Amount</Label>
                  <Input
                    id={`investment-${index}`}
                    name="investment"
                    type="number"
                    value={investment.investment}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Enter investment amount"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`investmentDate-${index}`}>Investment Date</Label>
                  <Input
                    id={`investmentDate-${index}`}
                    name="investmentDate"
                    type="date"
                    value={investment.investmentDate}
                    onChange={(e) => handleChange(index, e)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`isSIP-${index}`}
                      name="isSIP"
                      checked={investment.isSIP}
                      onChange={(e) => handleChange(index, e)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`isSIP-${index}`}>Is this a SIP?</Label>
                  </div>
                </div>
                {investment.isSIP && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`sipFrequency-${index}`}>SIP Frequency</Label>
                      <select
                        id={`sipFrequency-${index}`}
                        name="sipFrequency"
                        value={investment.sipFrequency}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required={investment.isSIP}
                      >
                        <option value="">Select frequency</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`sipStartDate-${index}`}>SIP Start Date</Label>
                      <Input
                        id={`sipStartDate-${index}`}
                        name="sipStartDate"
                        type="date"
                        value={investment.sipStartDate}
                        onChange={(e) => handleChange(index, e)}
                        required={investment.isSIP}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`sipEndDate-${index}`}>SIP End Date (Optional)</Label>
                      <Input
                        id={`sipEndDate-${index}`}
                        name="sipEndDate"
                        type="date"
                        value={investment.sipEndDate}
                        onChange={(e) => handleChange(index, e)}
                      />
                    </div>
                  </>
                )}
              </div>
              {investments.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveRow(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove investment</span>
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddRow} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Another Investment
          </Button>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Add Investments</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

