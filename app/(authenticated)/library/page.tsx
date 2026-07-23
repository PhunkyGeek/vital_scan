'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LibrarySearchBar } from '@/components/library/LibrarySearchBar'
import { CategoryFilter } from '@/components/library/CategoryFilter'
import { ConditionCard } from '@/components/library/ConditionCard'
import { ConditionDetailDialog } from '@/components/library/ConditionDetailDialog'
import { LibraryEmptyState } from '@/components/library/LibraryEmptyState'
import { getConditionCategories, getGlobalConditionLibrary, type Condition } from '@/lib/data/conditions'

export default function LibraryPage() {
  const supabase = createClient() as SupabaseClient
  const [conditions, setConditions] = useState<Condition[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(
    null
  )
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getConditionCategories(supabase)
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    loadCategories()
  }, [supabase])

  // Fetch conditions based on search and category
  const loadConditions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const results = await getGlobalConditionLibrary(supabase, {
        search: search || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      })
      setConditions(results)
    } catch (err) {
      console.error('Failed to load conditions:', err)
      setError('Failed to load conditions')
      setConditions([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase, search, selectedCategory])

  useEffect(() => {
    loadConditions()
  }, [loadConditions])

  const handleSelectCondition = (condition: Condition) => {
    setSelectedCondition(condition)
    setIsOpen(true)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Condition Library
          </h1>
          <p className="text-lg text-muted-foreground">
            Learn about common health conditions, their symptoms, and when to seek care.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <LibrarySearchBar value={search} onChange={setSearch} />
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Conditions Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-muted animate-pulse border border-border"
              />
            ))}
          </div>
        ) : conditions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conditions.map((condition) => (
              <div
                key={condition.id}
                onClick={() => handleSelectCondition(condition)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelectCondition(condition)
                  }
                }}
              >
                <ConditionCard condition={condition} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="grid grid-cols-1">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
              <p className="text-destructive font-semibold">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1">
            <LibraryEmptyState searchTerm={search} category={selectedCategory} />
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <ConditionDetailDialog
        condition={selectedCondition}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setTimeout(() => setSelectedCondition(null), 300)
        }}
      />
    </main>
  )
}