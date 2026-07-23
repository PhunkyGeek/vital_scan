"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { SignOutButton } from "@/components/shared/SignOutButton"
import { MobileBottomNav } from "@/components/shared/MobileBottomNav"
import { Stethoscope, Home, Scan, MessageSquare, BookOpen, History, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Scan", href: "/scan", icon: Scan },
  { name: "Chatbot", href: "/chatbot", icon: MessageSquare },
  { name: "Library", href: "/library", icon: BookOpen },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">Vital Scan</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </div>
      </header>
      <MobileBottomNav />
    </>
  )
}