import { describe, it, expect } from "vitest"
import {
  API_BASE_URL,
  ACCESS_TOKEN,
  INVESTMENTS_API_BASE_URL,
  OAUTH2_REDIRECT_URI,
  ROUTES,
} from "@/app/constants"

describe("app constants", () => {
  it("points auth API at local mock port 8081", () => {
    expect(API_BASE_URL).toBe("http://localhost:8081/api/v1/auth")
    expect(API_BASE_URL.endsWith("/auth")).toBe(true)
  })

  it("declares investments base and oauth redirect", () => {
    expect(INVESTMENTS_API_BASE_URL).toContain("localhost:8081")
    expect(OAUTH2_REDIRECT_URI).toBe("http://localhost:3000/oauth2/redirect")
    expect(ACCESS_TOKEN).toBe("accessToken")
  })

  it("exposes the core app routes", () => {
    expect(ROUTES.HOME).toBe("/")
    expect(ROUTES.LOGIN).toBe("/login")
    expect(ROUTES.REGISTER).toBe("/register")
    expect(ROUTES.PORTFOLIO).toBe("/portfolio")
  })

  it("keeps portfolio mutation route helpers under /portfolio", () => {
    expect(ROUTES.PORTFOLIO_ADD.startsWith("/portfolio")).toBe(true)
    expect(ROUTES.PORTFOLIO_EDIT.startsWith("/portfolio")).toBe(true)
    expect(ROUTES.PORTFOLIO_DELETE.startsWith("/portfolio")).toBe(true)
  })
})
