import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AuthProvider } from "@/hooks/use-auth"
import { AuthService, LoginResponse } from "@/app/util/ApiUtils"
import { NavBar } from "@/app/components/navbar"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
  }),
}))

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

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
  accessToken: "atk_nav",
  refreshToken: "rtk_nav",
  tokenType: "BEARER",
  userProfile: {
    userId: "user-demo-001",
    email: "demo@mutualtrack.com",
    fullName: "Demo Investor",
    registrationDate: "2024-01-15T10:00:00Z",
    lastLogin: "2026-09-03T10:00:00Z",
  },
}

function renderNav() {
  return render(
    <AuthProvider>
      <NavBar />
    </AuthProvider>
  )
}

describe("NavBar", () => {
  beforeEach(() => {
    localStorage.clear()
    AuthService.logout()
    push.mockClear()
  })

  it("shows brand and primary nav links", async () => {
    renderNav()
    expect(await screen.findByText("MutualTrack")).toBeTruthy()
    expect(screen.getByText("Dashboard")).toBeTruthy()
    expect(screen.getByText("Research")).toBeTruthy()
  })

  it("shows Sign In for guests and routes to /login", async () => {
    renderNav()
    const signIn = await screen.findByRole("button", { name: "Sign In" })
    fireEvent.click(signIn)
    expect(push).toHaveBeenCalledWith("/login")
  })

  it("shows user name and Sign Out when authenticated", async () => {
    AuthService.storeLoginResponse(sampleLogin)
    renderNav()

    expect(await screen.findByText("Demo Investor")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Sign In" })).toBeNull()
  })

  it("signs out and navigates home", async () => {
    AuthService.storeLoginResponse(sampleLogin)
    renderNav()

    fireEvent.click(await screen.findByRole("button", { name: "Sign Out" }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/")
      expect(AuthService.isAuthenticated()).toBe(false)
    })
  })
})
