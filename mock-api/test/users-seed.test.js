const { describe, it } = require("node:test")
const assert = require("node:assert/strict")
const {
  createSeedUsers,
  holdingFromScheme,
  CAMS_UPLOAD_SCHEME_IDS,
  DEMO_USER_ID,
  EMPTY_USER_ID,
  ACTIVE_USER_ID,
} = require("../data/users")

describe("seed users", () => {
  it("creates demo, empty, and active users with expected ids", () => {
    const users = createSeedUsers()
    const ids = users.map((u) => u.userId)
    assert.deepEqual(ids.sort(), [ACTIVE_USER_ID, DEMO_USER_ID, EMPTY_USER_ID].sort())
    assert.equal(users.find((u) => u.userId === DEMO_USER_ID).email, "demo@mutualtrack.com")
    assert.equal(users.find((u) => u.userId === EMPTY_USER_ID).portfolios.length, 0)
    assert.ok(users.find((u) => u.userId === ACTIVE_USER_ID).portfolios.length >= 1)
  })

  it("gives the demo user a rich multi-holding portfolio", () => {
    const demo = createSeedUsers().find((u) => u.userId === DEMO_USER_ID)
    assert.ok(demo.portfolios.length >= 8)
    assert.ok(demo.portfolios.every((p) => p.userId === DEMO_USER_ID))
    assert.ok(demo.portfolios.every((p) => p.schemeCode && p.currentValue > 0))
  })

  it("builds a holding from a known scheme with overrides", () => {
    const holding = holdingFromScheme(DEMO_USER_ID, "PPFAS001", {
      investedValue: 12345,
      folioNumber: "CUSTOM-1",
    })
    assert.equal(holding.schemeCode, "PPFAS001")
    assert.equal(holding.investedValue, 12345)
    assert.equal(holding.folioNumber, "CUSTOM-1")
    assert.equal(holding.category, "Equity")
    assert.ok(holding.units > 0)
    assert.ok(holding.currentValue > 0)
  })

  it("rejects unknown scheme ids when building holdings", () => {
    assert.throws(() => holdingFromScheme(DEMO_USER_ID, "DOES-NOT-EXIST"), /Unknown scheme/)
  })

  it("exposes CAMS upload scheme ids that exist in the catalog", () => {
    const { getScheme } = require("../data/schemes")
    assert.ok(CAMS_UPLOAD_SCHEME_IDS.length >= 2)
    for (const id of CAMS_UPLOAD_SCHEME_IDS) {
      assert.ok(getScheme(id), `missing scheme ${id}`)
    }
  })
})
