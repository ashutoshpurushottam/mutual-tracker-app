import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import {
  addInvestments,
  deleteInvestment,
  fetchFundDetails,
  fetchFundPerformance,
  fetchPortfolios,
  updateInvestment,
  uploadFile,
} from "@/app/util/InvestmentUtil"

vi.mock("axios")

const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe("investment API helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get = vi.fn()
    mockedAxios.post = vi.fn()
    mockedAxios.put = vi.fn()
    mockedAxios.delete = vi.fn()
  })

  it("fetchPortfolios returns holdings from the investments API", async () => {
    const holdings = [{ id: "1", schemeName: "Test Fund" }]
    mockedAxios.get.mockResolvedValueOnce({ data: holdings })

    const result = await fetchPortfolios("user-demo-001")

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8888/users/user-demo-001/portfolios"
    )
    expect(result).toEqual(holdings)
  })

  it("fetchPortfolios returns an empty list when the request fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    mockedAxios.get.mockRejectedValueOnce(new Error("network down"))

    await expect(fetchPortfolios("user-demo-001")).resolves.toEqual([])
    spy.mockRestore()
  })

  it("fetchFundPerformance and fetchFundDetails hit fund endpoints", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({ data: { schemeId: "PPFAS001", "1M": [] } })
      .mockResolvedValueOnce({ data: { schemeName: "PPFAS", nav: 100 } })

    const perf = await fetchFundPerformance("PPFAS001")
    const details = await fetchFundDetails("PPFAS001")

    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8888/fund/PPFAS001"
    )
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8888/fund/PPFAS001/details"
    )
    expect(perf.schemeId).toBe("PPFAS001")
    expect(details.nav).toBe(100)
  })

  it("addInvestments posts the investments payload", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: [{ id: "new" }] })
    const rows = [
      {
        fundHouse: "HDFC",
        folioNumber: "F1",
        schemeName: "HDFC Flexi Cap Fund - Direct Growth",
        investment: 50000,
        investmentDate: "2024-01-01",
        isSIP: false,
      },
    ]

    const created = await addInvestments("user-empty-001", rows)

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8888/users/user-empty-001/investments",
      { investments: rows },
      { headers: { "Content-Type": "application/json" } }
    )
    expect(created).toEqual([{ id: "new" }])
  })

  it("updateInvestment, deleteInvestment, and uploadFile call the expected verbs", async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { id: "h1", units: 10 } })
    mockedAxios.delete.mockResolvedValueOnce({ data: { message: "Deleted" } })
    mockedAxios.post.mockResolvedValueOnce({ data: "ok" })

    await updateInvestment("user-demo-001", "h1", { units: 10 })
    await deleteInvestment("user-demo-001", "h1")
    const file = new File(["cams"], "cams.pdf", { type: "application/pdf" })
    await uploadFile(file, "user-demo-001")

    expect(mockedAxios.put).toHaveBeenCalledWith(
      "http://localhost:8888/users/user-demo-001/investments/h1",
      { units: 10 }
    )
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      "http://localhost:8888/users/user-demo-001/investments/h1"
    )
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8888/users/user-demo-001/upload",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    )
  })
})
