"use client"

import { useEffect, useState } from 'react'
import { DisclaimerBanner } from '@/components/shared/DisclaimerBanner'
import { ReportMeta } from '@/components/result/ReportMeta'
import { ScanImagePreview } from '@/components/result/ScanImagePreview'
import { ResultSummaryCard } from '@/components/result/ResultSummaryCard'
import { PossibleSignsCard } from '@/components/result/PossibleSignsCard'
import { RedFlagsCard } from '@/components/result/RedFlagsCard'
import { SelfCareCard } from '@/components/result/SelfCareCard'
import { RecommendedActionCard } from '@/components/result/RecommendedActionCard'
import { UrgentCareAlert } from '@/components/result/UrgentCareAlert'
import { FollowUpActions } from '@/components/result/FollowUpActions'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'
import { useTextToSpeech } from '@/lib/hooks/speech'
import { createClient } from '@/lib/supabase/client'
import type { ScreeningWithResult } from '@/lib/data/screenings'
import type { UserProfile } from '@/lib/data/profile'

interface ResultPageProps {
  screening: ScreeningWithResult
}

export function ResultPage({ screening }: ResultPageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const languagePrefs = profile?.preferences?.language as Record<string, unknown> | undefined
  const chatPrefs = profile?.preferences?.chat as Record<string, unknown> | undefined
  const preferredLanguage = (languagePrefs?.preferredLanguage as string) ?? 'en-US'
  const effectiveLanguage =
    preferredLanguage === 'auto'
      ? (typeof window !== 'undefined' ? navigator.language : 'en-US')
      : preferredLanguage || 'en-US'

  const textToSpeech = useTextToSpeech({
    language: effectiveLanguage,
  })

  const aiResult = screening.ai_analysis_result
  const isUrgent = screening.risk_level === 'urgent' ||
                   aiResult?.seek_urgent_care ||
                   (screening.condition?.emergency_indicators?.length ?? 0) > 0

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
      }
    }
    void loadProfile()
  }, [])

  const voiceEnabled = (chatPrefs?.voiceEnabled as boolean) ?? false

  const generateResultText = () => {
    const parts: string[] = []

    const conditionName = aiResult?.condition_name || screening.condition?.name || 'Screening result'
    if (conditionName) {
      parts.push(`Screening result: ${conditionName}`)
    }

    if (screening.risk_level) {
      parts.push(`Risk level: ${screening.risk_level}`)
    }

    if (typeof screening.result?.confidence_score === 'number') {
      parts.push(`Confidence: ${Math.round(screening.result.confidence_score * 100)} percent`)
    }

    if (aiResult?.summary) {
      parts.push(aiResult.summary)
    }

    if (aiResult?.recommended_action) {
      parts.push(`Recommended action: ${aiResult.recommended_action}`)
    }

    if (aiResult?.self_care?.length) {
      parts.push(`Self-care suggestions: ${aiResult.self_care.join(', ')}`)
    }

    if (aiResult?.red_flags?.length) {
      parts.push(`Red flags to watch for: ${aiResult.red_flags.join(', ')}`)
    }

    return parts.filter(Boolean).join('. ')
  }

  const handleReadResultAloud = () => {
    const resultText = generateResultText()
    if (!resultText) return

    if (textToSpeech.isSpeaking) {
      textToSpeech.stop()
      return
    }

    textToSpeech.speak(resultText, {
      lang: effectiveLanguage,
      rate: 0.95,
      pitch: 1,
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <AppHeader /> */}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <ReportMeta screening={screening} />
            {voiceEnabled && textToSpeech.isSupported && (
              <Button
                onClick={handleReadResultAloud}
                variant="outline"
                className="flex items-center gap-2"
                aria-label={textToSpeech.isSpeaking ? 'Stop reading result aloud' : 'Read result aloud'}
              >
                {textToSpeech.isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {textToSpeech.isSpeaking ? 'Stop' : 'Read Aloud'}
              </Button>
            )}
          </div>

          <DisclaimerBanner />

          {isUrgent && <UrgentCareAlert />}

          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <ResultSummaryCard screening={screening} />
              <PossibleSignsCard screening={screening} />
              <RedFlagsCard screening={screening} />
              <SelfCareCard screening={screening} />
              <RecommendedActionCard screening={screening} />
            </div>

            <div className="space-y-6">
              <ScanImagePreview screening={screening} />
              <FollowUpActions screeningId={screening.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}