"use client"
import Image from "next/image"
import { ArrowRight, Navigation } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export function HeroSection() {
    const nav = useRouter();
    const handleDashboardClick = () => {
        nav.push('/dashboard');
      };
      const handleRegisterClick = () => {
        nav.push('/register');
      };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Hero background"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
      </div>
      <div className="container relative flex min-h-screen items-center">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Track & Grow Your{" "}
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Investments
              </span>
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Monitor your mutual fund investments, research fund performance, and make informed decisions with our comprehensive tracking tools.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="gap-2" onClick={handleRegisterClick}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleDashboardClick}>
                View Dashboard
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative aspect-square rounded-full bg-gradient-to-tr from-green-400/20 to-green-600/20 backdrop-blur">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-green-400/10 to-green-600/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}