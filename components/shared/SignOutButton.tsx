"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    setIsSigningOut(false)

    if (error) {
      window.alert(error.message)
      return
    }

    router.push('/login')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      {isSigningOut ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
