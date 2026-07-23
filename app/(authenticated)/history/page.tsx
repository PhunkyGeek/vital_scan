'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { HistoryItemCard } from '@/components/history/HistoryItemCard'
import { HistoryFilters } from '@/components/history/HistoryFilters'
import { HistoryEmptyState } from '@/components/history/HistoryEmptyState'
import {
  getUserScreeningHistory,
  type HistoryItem,
} from '@/lib/data/history'

const RISK_LEVELS = ['low', 'moderate', 'high', 'critical']

export default function HistoryPage() {
  const router = useRouter()
  const supabase = createClient() as SupabaseClient
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)
    }
    getUser()
  }, [supabase.auth, router])

  // Fetch history
  useEffect(() => {
    if (!userId) return

    async function loadHistory() {
      if (!userId) return

      setIsLoading(true)
      setError(null)
      try {
        const items = await getUserScreeningHistory(supabase, userId, {
          riskLevel: selectedRiskLevel !== 'all' ? selectedRiskLevel : undefined,
        })
        setHistory(items)
      } catch (err) {
        console.error('Failed to load history:', err)
        setError('Failed to load screening history')
        setHistory([])
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [supabase, userId, selectedRiskLevel])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Screening History
          </h1>
          <p className="text-lg text-muted-foreground">
            View and manage your previous health screenings.
          </p>
        </div>

        {/* Filters */}
        {history.length > 0 && (
          <div className="mb-8">
            <HistoryFilters
              riskLevels={RISK_LEVELS}
              selectedRiskLevel={selectedRiskLevel}
              onRiskLevelChange={setSelectedRiskLevel}
            />
          </div>
        )}

        {/* History List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-muted animate-pulse border border-border"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive font-semibold">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Please try again or contact support.</p>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <HistoryItemCard
                key={`${item.id}-${item.condition_name}-${item.created_at}`}
                item={item}
              />
            ))}
          </div>
        ) : (
          <HistoryEmptyState />
        )}
      </div>
    </main>
  )
}