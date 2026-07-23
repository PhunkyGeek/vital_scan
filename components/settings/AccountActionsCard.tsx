'use client'

import { LogOut, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface AccountActionsCardProps {
  onLogout: () => Promise<void>
}

export function AccountActionsCard({ onLogout }: AccountActionsCardProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await onLogout()
    } catch (error) {
      console.error('Logout failed:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium transition-all hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Logging out...
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            Logout
          </>
        )}
      </button>
      <p className="text-xs text-muted-foreground text-center">
        You can log back in anytime with your email and password.
      </p>
    </div>
  )
}
