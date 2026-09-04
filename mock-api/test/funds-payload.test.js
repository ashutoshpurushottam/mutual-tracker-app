const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const {
  schemes,
  getScheme,
  getFundPerformancePayload,
  getFundDetailsPayload,
  getComparePayload,
  searchSchemes,
} = require("../data/schemes")

describe("fund performance payloads", () => {
  it("returns all expected period keys for a known scheme", () => {
    const payload = getFundPerformancePayload("HDFC001")
    assert.ok(payload)
    for (const key of ["1M", "3M", "1Y", "3Y", "5Y", "SI"]) {
      assert.ok(Array.isArray(payload[key]), `missing period ${key}`)
      assert.ok(payload[key].length >= 2, `${key} should have multiple points`)
      assert.ok(payload[key][0].date)
      assert.ok(typeof payload[key][0].value === "number")
    }
    assert.equal(payload.schemeId, "HDFC001")
    assert.ok(payload.schemeName.includes("HDFC"))
  })

  it("normalizes performance series to a 100 baseline at the start", () => {
    const series = getFundPerformancePayload("SBI001")["1Y"]
    assert.equal(series[0].value, 100)
  })

  it("details payload includes metrics used by the portfolio page", () => {
    const details = getFundDetailsPayload("ICICI001")
    assert.ok(details.schemeName)
    assert.ok(details.amcName)
    assert.ok(details.nav > 0)
    assert.ok(details.aum > 0)
    assert.ok(details.expenseRatio > 0)
    assert.ok(details.riskLevel)
    assert.ok(typeof details.returns.oneYear === "number")
    assert.ok(details.historicalData.length > 0)
    assert.ok(details.historicalData[0].nav > 0)
  })

  it("search is case-insensitive and matches AMC names", () => {
    const byName = searchSchemes("PARAG")
    const byAmc = searchSchemes("mirae asset")
    assert.ok(byName.some((r) => r.schemeId.startsWith("PPFAS")))
    assert.ok(byAmc.length >= 1)
    assert.ok(byAmc.every((r) => r.schemeId && r.schemeName))
  })

  it("keeps scheme ids unique across the catalog", () => {
    const ids = schemes.map((s) => s.schemeId)
    assert.equal(new Set(ids).size, ids.length)
    assert.equal(getScheme(ids[0]).schemeId, ids[0])
    assert.ok(ids.length >= 70)
  })

  it("compare payload returns up to three fund details", () => {
    const payload = getComparePayload("HDFC001,SBI001,UNKNOWN,PPFAS001")
    assert.equal(payload.length, 3)
    assert.equal(payload[0].schemeId, "HDFC001")
    assert.ok(payload.every((f) => f.schemeName && f.nav > 0))
  })
})
