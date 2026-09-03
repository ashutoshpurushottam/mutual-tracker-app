const { describe, it, before } = require("node:test")
const assert = require("node:assert/strict")
const express = require("express")
const request = require("supertest")
const { createStore } = require("../store")
const { createAuthRouter } = require("../routes/auth")
const { createInvestmentsRouter } = require("../routes/investments")
const { createFundsRouter } = require("../routes/funds")

function buildApps() {
  const store = createStore()

  const authApp = express()
  authApp.use(express.json())
  authApp.use("/api/v1/auth", createAuthRouter(store))

  const invApp = express()
  invApp.use(express.json())
  invApp.use(createInvestmentsRouter(store))
  invApp.use(createFundsRouter())

  return { store, authApp, invApp }
}

describe("auth HTTP API", () => {
  let authApp

  before(() => {
    ;({ authApp } = buildApps())
  })

  it("POST /signin returns tokens for demo user", async () => {
    const res = await request(authApp)
      .post("/api/v1/auth/signin")
      .send({ email: "demo@mutualtrack.com", password: "password123" })
      .expect(200)

    assert.equal(res.body.tokenType, "BEARER")
    assert.ok(res.body.accessToken)
    assert.equal(res.body.userProfile.userId, "user-demo-001")
  })

  it("POST /signin returns 401 for bad password", async () => {
    await request(authApp)
      .post("/api/v1/auth/signin")
      .send({ email: "demo@mutualtrack.com", password: "nope" })
      .expect(401)
  })

  it("POST /signup creates a user", async () => {
    const email = `user${Date.now()}@example.com`
    const res = await request(authApp)
      .post("/api/v1/auth/signup")
      .send({ email, password: "password123", username: "tester" })
      .expect(201)

    assert.equal(res.body.email, email)
    assert.ok(res.body.userId)
  })
})

describe("investments and funds HTTP API", () => {
  let invApp
  let userId

  before(async () => {
    const apps = buildApps()
    invApp = apps.invApp
    userId = "user-demo-001"
  })

  it("GET /users/:id/portfolios returns holdings", async () => {
    const res = await request(invApp).get(`/users/${userId}/portfolios`).expect(200)
    assert.ok(Array.isArray(res.body))
    assert.ok(res.body.length > 0)
  })

  it("GET /fund/search finds schemes", async () => {
    const res = await request(invApp).get("/fund/search").query({ query: "nifty" }).expect(200)
    assert.ok(res.body.length >= 1)
    assert.ok(res.body[0].schemeId)
  })

  it("GET /fund/:id returns performance periods", async () => {
    const res = await request(invApp).get("/fund/PPFAS001").expect(200)
    assert.equal(res.body.schemeId, "PPFAS001")
    assert.ok(Array.isArray(res.body["1M"]))
    assert.ok(Array.isArray(res.body.SI))
  })

  it("GET /fund/:id/details returns scheme metrics", async () => {
    const res = await request(invApp).get("/fund/PPFAS001/details").expect(200)
    assert.ok(res.body.schemeName)
    assert.ok(res.body.nav > 0)
  })

  it("POST /users/:id/investments adds a holding", async () => {
    const emptyId = "user-empty-001"
    const before = await request(invApp).get(`/users/${emptyId}/portfolios`)
    const res = await request(invApp)
      .post(`/users/${emptyId}/investments`)
      .send({
        investments: [
          {
            fundHouse: "SBI",
            folioNumber: "SBI-T1",
            schemeName: "SBI Bluechip Fund - Direct Growth",
            investment: 25000,
            investmentDate: "2024-06-01",
            isSIP: false,
          },
        ],
      })
      .expect(201)

    assert.equal(res.body.length, 1)
    const after = await request(invApp).get(`/users/${emptyId}/portfolios`)
    assert.equal(after.body.length, before.body.length + 1)
  })
})
