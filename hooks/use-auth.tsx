"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  AuthService,
  logout as apiLogout,
  UserProfile,
} from "@/app/util/ApiUtils"

export const AUTH_CHANGED_EVENT = "mutualtrack:auth-changed"

type AuthContextValue = {
  ready: boolean
  user: UserProfile | null
  isAuthenticated: boolean
  refresh: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return
    if (AuthService.isAuthenticated()) {
      setUser(AuthService.getUserProfile())
    } else {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refresh()
    setReady(true)

    const onAuthChanged = () => refresh()
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === "access_token" ||
        event.key === "refresh_token" ||
        event.key === "user_profile"
      ) {
        refresh()
      }
    }

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged)
      window.removeEventListener("storage", onStorage)
    }
  }, [refresh])

  const signOut = useCallback(async () => {
    try {
      await apiLogout()
    } catch (error) {
      // Always clear local session even if the API call fails
      console.error("Logout API failed, clearing local session", error)
      AuthService.logout()
      notifyAuthChanged()
    }
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      ready,
      user,
      isAuthenticated: !!user && AuthService.isAuthenticated(),
      refresh,
      signOut,
    }),
    [ready, user, refresh, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
