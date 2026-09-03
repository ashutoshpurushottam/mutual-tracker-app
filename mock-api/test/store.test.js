const { describe, it, beforeEach } = require("node:test")
const assert = require("node:assert/strict")
const { createStore } = require("../store")
const { searchSchemes, getScheme, getFundDetailsPayload } = require("../data/schemes")

describe("createStore auth", () => {
  let store

  beforeEach(() => {
    store = createStore()
  })

  it("signs in a demo user and returns bearer tokens", () => {
    const result = store.signin("demo@mutualtrack.com", "password123")
    assert.equal(result.tokenType, "BEARER")
    assert.ok(result.accessToken.startsWith("atk_"))
    assert.ok(result.refreshToken.startsWith("rtk_"))
    assert.equal(result.userProfile.userId, "user-demo-001")
    assert.equal(result.userProfile.email, "demo@mutualtrack.com")
  })

  it("rejects invalid credentials", () => {
    assert.throws(
      () => store.signin("demo@mutualtrack.com", "wrong"),
      (err) => err.status === 401
    )
  })

  it("registers a new user", () => {
    const user = store.signup({
      email: "new@example.com",
      password: "password123",
      username: "newbie",
    })
    assert.ok(user.userId)
    assert.equal(user.email, "new@example.com")
    assert.deepEqual(store.getPortfolios(user.userId), [])
  })

  it("rejects duplicate signup email", () => {
    assert.throws(
      () =>
        store.signup({
          email: "demo@mutualtrack.com",
          password: "password123",
          username: "demo2",
        }),
      (err) => err.status === 409
    )
  })
})

describe("createStore portfolios", () => {
  let store

  beforeEach(() => {
    store = createStore()
  })

  it("returns seeded holdings for the demo user", () => {
    const portfolios = store.getPortfolios("user-demo-001")
    assert.ok(portfolios.length >= 8)
    assert.ok(portfolios.every((p) => p.userId === "user-demo-001"))
    assert.ok(portfolios[0].schemeName)
    assert.ok(typeof portfolios[0].currentValue === "number")
  })

  it("starts empty for the empty user", () => {
    assert.equal(store.getPortfolios("user-empty-001").length, 0)
  })

  it("adds investments and increases portfolio size", () => {
    const before = store.getPortfolios("user-empty-001").length
    const created = store.addInvestments("user-empty-001", [
      {
        fundHouse: "HDFC",
        folioNumber: "F-1",
        schemeName: "HDFC Flexi Cap Fund - Direct Growth",
        investment: 50000,
        investmentDate: "2024-01-01",
        isSIP: false,
      },
    ])
    assert.equal(created.length, 1)
    assert.equal(created[0].schemeCode, "HDFC001")
    assert.equal(store.getPortfolios("user-empty-001").length, before + 1)
  })

  it("simulates CAMS upload by appending holdings", () => {
    const before = store.getPortfolios("user-empty-001").length
    const result = store.simulateCamsUpload("user-empty-001")
    assert.ok(result.addedCount >= 2)
    assert.equal(
      store.getPortfolios("user-empty-001").length,
      before + result.addedCount
    )
  })

  it("deletes an investment by id", () => {
    const [holding] = store.getPortfolios("user-demo-001")
    const ok = store.deleteInvestment("user-demo-001", holding.id)
    assert.equal(ok, true)
    assert.equal(
      store.getPortfolios("user-demo-001").some((p) => p.id === holding.id),
      false
    )
  })
})

describe("schemes catalog", () => {
  it("includes a substantial number of schemes", () => {
    const { schemes } = require("../data/schemes")
    assert.ok(schemes.length >= 40)
  })

  it("searches by name fragment", () => {
    const results = searchSchemes("flexi")
    assert.ok(results.length >= 1)
    assert.ok(results.every((r) => r.schemeId && r.schemeName))
    assert.ok(results.some((r) => /flexi/i.test(r.schemeName)))
  })

  it("returns fund details for a known scheme", () => {
    const details = getFundDetailsPayload("PPFAS001")
    assert.ok(details)
    assert.ok(details.nav > 0)
    assert.ok(details.historicalData.length > 0)
    assert.ok(typeof details.returns.oneYear === "number")
  })

  it("returns null for unknown scheme", () => {
    assert.equal(getScheme("NOPE"), null)
    assert.equal(getFundDetailsPayload("NOPE"), null)
  })
})
