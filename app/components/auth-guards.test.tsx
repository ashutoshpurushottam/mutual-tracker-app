import { describe, it, expect, vi } from "vitest"
import React, { type ReactNode } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { AuthProvider } from "@/hooks/use-auth"
import { RequireAuth } from "@/app/components/require-auth"
import { GuestOnly } from "@/app/components/guest-only"
import { AuthService, LoginResponse } from "@/app/util/ApiUtils"

const replace = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    push: vi.fn(),
  }),
}))

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

function renderWithAuth(ui: ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe("RequireAuth", () => {
  it("redirects guests to /login", async () => {
    replace.mockClear()
    AuthService.logout()

    renderWithAuth(
      <RequireAuth>
        <div>Secret dashboard</div>
      </RequireAuth>
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login")
    })
    expect(screen.queryByText("Secret dashboard")).toBeNull()
  })

  it("renders children when authenticated", async () => {
    replace.mockClear()
    AuthService.storeLoginResponse(sampleLogin)

    renderWithAuth(
      <RequireAuth>
        <div>Secret dashboard</div>
      </RequireAuth>
    )

    expect(await screen.findByText("Secret dashboard")).toBeTruthy()
    expect(replace).not.toHaveBeenCalledWith("/login")
  })
})

describe("GuestOnly", () => {
  it("redirects authenticated users to /dashboard", async () => {
    replace.mockClear()
    AuthService.storeLoginResponse(sampleLogin)

    renderWithAuth(
      <GuestOnly>
        <div>Login form</div>
      </GuestOnly>
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard")
    })
  })

  it("shows children for guests", async () => {
    replace.mockClear()
    AuthService.logout()

    renderWithAuth(
      <GuestOnly>
        <div>Login form</div>
      </GuestOnly>
    )

    expect(await screen.findByText("Login form")).toBeTruthy()
  })
})
