import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import { render, screen, waitFor, act } from "@testing-library/react"
import { AuthProvider, useAuth, notifyAuthChanged } from "@/hooks/use-auth"
import { AuthService, LoginResponse } from "@/app/util/ApiUtils"

vi.mock("@/app/util/ApiUtils", async () => {
  const actual = await vi.importActual<typeof import("@/app/util/ApiUtils")>(
    "@/app/util/ApiUtils"
  )
  return {
    ...actual,
    logout: vi.fn(async () => {
      actual.AuthService.logout()
      return { message: "Logged out" }
    }),
  }
})

const sampleLogin: LoginResponse = {
  accessToken: "atk_hook",
  refreshToken: "rtk_hook",
  tokenType: "BEARER",
  userProfile: {
    userId: "user-demo-001",
    email: "demo@mutualtrack.com",
    fullName: "Demo Investor",
    registrationDate: "2024-01-15T10:00:00Z",
    lastLogin: "2026-09-03T10:00:00Z",
  },
}

function Probe() {
  const { ready, isAuthenticated, user } = useAuth()
  if (!ready) return <div>loading</div>
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? "yes" : "no"}</span>
      <span data-testid="name">{user?.fullName ?? "none"}</span>
    </div>
  )
}

describe("useAuth / AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    AuthService.logout()
  })

  it("throws when useAuth is used outside AuthProvider", () => {
    expect(() => render(<Probe />)).toThrow(
      /useAuth must be used within AuthProvider/
    )
  })

  it("starts as a guest when there is no session", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    expect((await screen.findByTestId("auth")).textContent).toBe("no")
    expect(screen.getByTestId("name").textContent).toBe("none")
  })

  it("hydrates an existing AuthService session", async () => {
    AuthService.storeLoginResponse(sampleLogin)

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    expect((await screen.findByTestId("auth")).textContent).toBe("yes")
    expect(screen.getByTestId("name").textContent).toBe("Demo Investor")
  })

  it("refreshes when notifyAuthChanged is fired", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect((await screen.findByTestId("auth")).textContent).toBe("no")

    act(() => {
      AuthService.storeLoginResponse(sampleLogin)
      notifyAuthChanged()
    })

    await waitFor(() => {
      expect(screen.getByTestId("auth").textContent).toBe("yes")
    })
  })
})
