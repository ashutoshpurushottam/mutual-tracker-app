import { describe, it, expect, vi, beforeEach } from "vitest"
import { AuthService, LoginResponse } from "@/app/util/ApiUtils"

const sampleLogin: LoginResponse = {
  accessToken: "atk_test",
  refreshToken: "rtk_test",
  tokenType: "BEARER",
  userProfile: {
    userId: "user-demo-001",
    email: "demo@mutualtrack.com",
    fullName: "Demo Investor",
    registrationDate: "2024-01-15T10:00:00Z",
    lastLogin: "2026-09-03T10:00:00Z",
  },
}

describe("AuthService", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("starts unauthenticated", () => {
    expect(AuthService.isAuthenticated()).toBe(false)
    expect(AuthService.getAccessToken()).toBeNull()
    expect(AuthService.getUserProfile()).toBeNull()
    expect(AuthService.getUserId()).toBeNull()
  })

  it("stores and retrieves a login response", () => {
    AuthService.storeLoginResponse(sampleLogin)

    expect(AuthService.isAuthenticated()).toBe(true)
    expect(AuthService.getAccessToken()).toBe("atk_test")
    expect(AuthService.getRefreshToken()).toBe("rtk_test")
    expect(AuthService.getUserId()).toBe("user-demo-001")
    expect(AuthService.getUserProfile()?.email).toBe("demo@mutualtrack.com")
    expect(AuthService.getUserProfile()?.fullName).toBe("Demo Investor")
  })

  it("dispatches an auth-changed event on store", () => {
    const spy = vi.fn()
    window.addEventListener("mutualtrack:auth-changed", spy)

    AuthService.storeLoginResponse(sampleLogin)

    expect(spy).toHaveBeenCalledTimes(1)
    window.removeEventListener("mutualtrack:auth-changed", spy)
  })

  it("clears session on logout and notifies listeners", () => {
    AuthService.storeLoginResponse(sampleLogin)
    const spy = vi.fn()
    window.addEventListener("mutualtrack:auth-changed", spy)

    AuthService.logout()

    expect(AuthService.isAuthenticated()).toBe(false)
    expect(AuthService.getAccessToken()).toBeNull()
    expect(AuthService.getUserProfile()).toBeNull()
    expect(spy).toHaveBeenCalled()
    window.removeEventListener("mutualtrack:auth-changed", spy)
  })
})
