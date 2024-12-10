"use client"
import Link from "next/link"
import { Search } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function NavBar() {

  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleAuth = () => {
    setIsLoggedIn(!isLoggedIn)
  }
  const handleRegisterClick = () => {
    router.push('/register');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };
  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">MutualTrack</span>
          </Link>
          <div className="hidden gap-6 md:flex">
            {/* <Link href="/mutual-funds" className="text-sm font-medium transition-colors hover:text-primary">
              Mutual Funds
            </Link> */}
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link href="/search" className="text-sm font-medium transition-colors hover:text-primary">
              Research
            </Link>

          </div>
        </div>
        <div className="flex items-center gap-4">
          {
            isLoggedIn ? (
              <Button variant="outline" className="hidden md:flex" onClick={handleAuth}>
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" className="hidden md:flex" onClick={handleLoginClick}>
                Sign In
              </Button>
            )
          }
         
        </div>
      </div>
    </nav>
  )
}