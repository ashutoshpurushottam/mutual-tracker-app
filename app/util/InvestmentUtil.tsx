import axios from "axios"

export interface Portfolio {
  id: string
  userId: string
  schemeName: string
  amcName: string
  folioNumber: string
  units: number
  investedValue: number
  schemeCode: string | null
  tradingsymbol: string
  currentValue: number
  lastUpdateDate: string
  category: string
}

export interface InvestmentRow {
  fundHouse: string
  folioNumber: string
  schemeName: string
  investment: number | string
  investmentDate: string
  isSIP: boolean
  sipFrequency?: "Monthly" | "Quarterly" | "Yearly"
  sipStartDate?: string
  sipEndDate?: string
}

export interface PortfolioDetailsData {
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

export interface FundPerformanceData {
  schemeId: string
  schemeName: string
  amcName: string
  category: string
  "1M": { date: string; value: number }[]
  "3M": { date: string; value: number }[]
  "1Y": { date: string; value: number }[]
  "3Y": { date: string; value: number }[]
  "5Y": { date: string; value: number }[]
  SI: { date: string; value: number }[]
}

const INV_BASE = "http://localhost:8888"

export class PortfolioUtil {
  static calculateReturns(portfolio: Portfolio): number {
    return ((portfolio.currentValue - portfolio.investedValue) / portfolio.investedValue) * 100
  }

  static calculateGainLoss(portfolio: Portfolio): number {
    return portfolio.currentValue - portfolio.investedValue
  }

  static calculateGainLossPercentage(portfolio: Portfolio): number {
    return ((portfolio.currentValue - portfolio.investedValue) / portfolio.investedValue) * 100
  }
}

export const fetchPortfolios = async (username: string): Promise<Portfolio[]> => {
  try {
    const response = await axios.get<Portfolio[]>(`${INV_BASE}/users/${username}/portfolios`)
    return response.data
  } catch (error) {
    console.error("Error fetching portfolios:", error)
    return []
  }
}

export const uploadFile = async (file: File, userid: string): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await axios.post<string>(`${INV_BASE}/users/${userid}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export const addInvestments = async (
  userId: string,
  investments: InvestmentRow[]
): Promise<Portfolio[]> => {
  const response = await axios.post<Portfolio[]>(
    `${INV_BASE}/users/${userId}/investments`,
    { investments },
    { headers: { "Content-Type": "application/json" } }
  )
  return response.data
}

export const updateInvestment = async (
  userId: string,
  investmentId: string,
  patch: Partial<Portfolio>
): Promise<Portfolio> => {
  const response = await axios.put<Portfolio>(
    `${INV_BASE}/users/${userId}/investments/${investmentId}`,
    patch
  )
  return response.data
}

export const deleteInvestment = async (userId: string, investmentId: string): Promise<void> => {
  await axios.delete(`${INV_BASE}/users/${userId}/investments/${investmentId}`)
}

export const fetchFundPerformance = async (schemeId: string): Promise<FundPerformanceData> => {
  const response = await axios.get<FundPerformanceData>(`${INV_BASE}/fund/${schemeId}`)
  return response.data
}

export const fetchFundDetails = async (schemeCode: string): Promise<PortfolioDetailsData> => {
  const response = await axios.get<PortfolioDetailsData>(
    `${INV_BASE}/fund/${schemeCode}/details`
  )
  return response.data
}
