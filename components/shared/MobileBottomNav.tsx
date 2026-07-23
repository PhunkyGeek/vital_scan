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

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden border-t bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-4xl grid-cols-3 gap-1 px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
