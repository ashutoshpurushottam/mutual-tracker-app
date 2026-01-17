"use client"

import { DashboardContent } from "./dashboard-content"
import { RequireAuth } from "../components/require-auth"
import { NavBar } from "../components/navbar"

export default function DashboardPage() {
  return (
    <RequireAuth>
      <NavBar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <DashboardContent />
      </div>
    </RequireAuth>
  )
}
