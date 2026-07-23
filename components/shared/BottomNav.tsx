"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Scan, MessageSquare, BookOpen, History, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Scan", href: "/scan", icon: Scan },
  { name: "Chatbot", href: "/chatbot", icon: MessageSquare },
  { name: "Library", href: "/library", icon: BookOpen },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-4xl px-4 py-2">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-center leading-tight">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}