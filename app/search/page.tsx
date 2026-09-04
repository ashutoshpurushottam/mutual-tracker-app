"use client"

import { SearchInput } from "./search-input"
import { SearchResults } from "./search-result"
import { NavBar } from "@/app/components/navbar"
import { Suspense } from "react"

export default function Search() {
  return (
    <>
      <NavBar />
      <main className="container mx-auto p-4 pt-24">
        <h1 className="mb-8 text-center text-3xl font-bold">Mutual Fund Search</h1>
        <SearchInput />
        <Suspense fallback={<p className="text-center">Loading…</p>}>
          <SearchResults />
        </Suspense>
      </main>
    </>
  )
}
