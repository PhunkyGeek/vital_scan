'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SettingsSectionCard } from '@/components/settings/SettingsSectionCard'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { AccountActionsCard } from '@/components/settings/AccountActionsCard'
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateUserPreferences,
  setPreference,
  type UserProfile,
} from '@/lib/data/profile'

type Theme = 'light' | 'dark' | 'system'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient() as SupabaseClient
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>('system')
  const [chatResponseLength, setChatResponseLength] = useState<'concise' | 'balanced' | 'detailed'>('balanced')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [multilingualMode, setMultilingualMode] = useState(false)
  const [largerText, setLargerText] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [preferencesSaving, setPreferencesSaving] = useState(false)
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

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
      setUserEmail(user.email || null)
    }
    getUser()
  }, [supabase.auth, router])

  // Load profile and preferences
  useEffect(() => {
    if (!userId) return

    async function loadProfile() {
      if (!userId) return

      setIsLoading(true)
      setLoadError(null)
      try {
        let userProfile = await getUserProfile(supabase, userId)
        if (!userProfile) {
          if (!userEmail) {
            throw new Error('Unable to recover profile data')
          }
          userProfile = await createUserProfile(supabase, userId, userEmail)
        }

        setProfile(userProfile)

        const preferences = userProfile.preferences || {}
        const savedTheme = (preferences.theme as Theme) || 'system'
        setTheme(savedTheme)

        const chatPrefs = (preferences.chat as Record<string, unknown>) || {}
        setChatResponseLength((chatPrefs.responseLength as 'concise' | 'balanced' | 'detailed') || 'balanced')
        setVoiceEnabled((chatPrefs.voiceEnabled as boolean) ?? false)

        const languagePrefs = (preferences.language as Record<string, unknown>) || {}
        setPreferredLanguage((languagePrefs.preferredLanguage as string) || 'en')
        setMultilingualMode((languagePrefs.multilingualMode as boolean) ?? false)

        const accessibilityPrefs = (preferences.accessibility as Record<string, unknown>) || {}
        setLargerText((accessibilityPrefs.largerText as boolean) ?? false)
        setReducedMotion((accessibilityPrefs.reducedMotion as boolean) ?? false)
      } catch (err) {
        console.error('Failed to load profile:', err)
        setLoadError('Failed to load your profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [supabase, userId, userEmail])

  const savePreferences = useCallback(
    async (updatedPreferences: Record<string, unknown>) => {
      if (!userId || !profile) return

      setPreferencesSaving(true)
      setPreferencesMessage(null)
      try {
        const mergedPreferences = {
          ...(profile.preferences || {}),
          ...updatedPreferences,
        }
        await updateUserPreferences(supabase, userId, mergedPreferences)
        setProfile({ ...profile, preferences: mergedPreferences })
        setPreferencesMessage('Preferences saved')
      } catch (error) {
        console.error('Failed to save preferences:', error)
        setPreferencesMessage('Unable to save preferences')
      } finally {
        setPreferencesSaving(false)
        setTimeout(() => setPreferencesMessage(null), 3000)
      }
    },
    [profile, supabase, userId]
  )

  const handleChatResponseLengthChange = useCallback(
    async (value: 'concise' | 'balanced' | 'detailed') => {
      setChatResponseLength(value)
      await savePreferences({
        chat: {
          ...(profile?.preferences?.chat as Record<string, unknown> | undefined),
          responseLength: value,
          voiceEnabled,
        },
      })
    },
    [profile?.preferences, savePreferences, voiceEnabled]
  )

  const handleVoiceEnabledToggle = useCallback(
    async (enabled: boolean) => {
      setVoiceEnabled(enabled)
      await savePreferences({
        chat: {
          ...(profile?.preferences?.chat as Record<string, unknown> | undefined),
          responseLength: chatResponseLength,
          voiceEnabled: enabled,
        },
      })
    },
    [profile?.preferences, savePreferences, chatResponseLength]
  )

  const handlePreferredLanguageChange = useCallback(
    async (language: string) => {
      setPreferredLanguage(language)
      await savePreferences({
        language: {
          ...(profile?.preferences?.language as Record<string, unknown> | undefined),
          preferredLanguage: language,
          multilingualMode,
        },
      })
    },
    [profile?.preferences, savePreferences, multilingualMode]
  )

  const handleMultilingualToggle = useCallback(
    async (enabled: boolean) => {
      setMultilingualMode(enabled)
      await savePreferences({
        language: {
          ...(profile?.preferences?.language as Record<string, unknown> | undefined),
          preferredLanguage,
          multilingualMode: enabled,
        },
      })
    },
    [profile?.preferences, savePreferences, preferredLanguage]
  )

  const handleLargerTextToggle = useCallback(
    async (enabled: boolean) => {
      setLargerText(enabled)
      await savePreferences({
        accessibility: {
          ...(profile?.preferences?.accessibility as Record<string, unknown> | undefined),
          largerText: enabled,
          reducedMotion,
        },
      })
    },
    [profile?.preferences, savePreferences, reducedMotion]
  )

  const handleReducedMotionToggle = useCallback(
    async (enabled: boolean) => {
      setReducedMotion(enabled)
      await savePreferences({
        accessibility: {
          ...(profile?.preferences?.accessibility as Record<string, unknown> | undefined),
          largerText,
          reducedMotion: enabled,
        },
      })
    },
    [profile?.preferences, savePreferences, largerText]
  )

  const handleProfileSubmit = useCallback(
    async (data: {
      full_name: string | null
      avatar_url: string | null
      date_of_birth: string | null
      gender: string | null
      medical_history: string[] | null
      allergies: string[] | null
      emergency_contact: string | null
      emergency_phone: string | null
    }) => {
      if (!userId) return
      setIsProfileLoading(true)
      try {
        const updated = await updateUserProfile(supabase, userId, {
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          medical_history: data.medical_history,
          allergies: data.allergies,
          emergency_contact: data.emergency_contact,
          emergency_phone: data.emergency_phone,
        })
        if (updated) {
          setProfile(updated)
        }
      } catch (error) {
        console.error('Failed to update profile:', error)
        setLoadError('Failed to save your profile')
      } finally {
        setIsProfileLoading(false)
      }
    },
    [supabase, userId]
  )

  const handleThemeChange = useCallback(
    async (newTheme: Theme) => {
      if (!userId) return
      setTheme(newTheme)

      // Update in database
      if (profile?.preferences) {
        const updated = setPreference(profile.preferences, 'theme', newTheme)
        try {
          await updateUserPreferences(supabase, userId, updated)
        } catch (error) {
          console.error('Failed to save theme preference:', error)
          // Revert theme on error
          setTheme(profile.preferences.theme as Theme || 'system')
        }
      }

      // Update DOM
      const html = document.documentElement
      if (newTheme === 'system') {
        html.classList.toggle(
          'dark',
          window.matchMedia('(prefers-color-scheme: dark)').matches
        )
      } else {
        html.classList.toggle('dark', newTheme === 'dark')
      }
    },
    [supabase, userId, profile?.preferences]
  )

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [supabase.auth, router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="h-96 rounded-xl bg-muted animate-pulse border border-border" />
        </div>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive font-semibold">{loadError}</p>
            <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your account and preferences.
          </p>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr]">
          <div className="space-y-6">
            <SettingsSectionCard
              title="Profile"
              description="Update your personal information"
            >
              <ProfileForm
                profile={profile}
                isLoading={isProfileLoading}
                onSubmit={handleProfileSubmit}
              />
            </SettingsSectionCard>

            <SettingsSectionCard
              title="Appearance"
              description="Customize how Vital Scan looks"
            >
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose a color theme for the app interface.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as Theme[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleThemeChange(option)}
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                        theme === option
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </SettingsSectionCard>
          </div>

          <div className="space-y-6">
            <SettingsSectionCard
              title="Chat Settings"
              description="Control voice and response behavior for the chatbot"
            >
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Preferred response length
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {['concise', 'balanced', 'detailed'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleChatResponseLengthChange(option as 'concise' | 'balanced' | 'detailed')}
                        className={`rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                          chatResponseLength === option
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-foreground hover:border-primary/50'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                  <div>
                    <p className="font-medium text-foreground">Enable voice chat</p>
                    <p className="text-sm text-muted-foreground">
                      Use voice-assisted responses in the chatbot.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVoiceEnabledToggle(!voiceEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      voiceEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        voiceEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {preferencesMessage ? (
                  <div className="rounded-lg border border-border bg-primary/10 p-3 text-sm text-primary">
                    {preferencesMessage}
                  </div>
                ) : null}
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard
              title="Language Settings"
              description="Select your preferred language and multilingual behavior"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preferred language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => handlePreferredLanguageChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                  <div>
                    <p className="font-medium text-foreground">Multilingual mode</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically translate chatbot responses when necessary.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMultilingualToggle(!multilingualMode)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      multilingualMode ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        multilingualMode ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard
              title="Accessibility Settings"
              description="Adjust readability and motion preferences"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                  <div>
                    <p className="font-medium text-foreground">Larger text</p>
                    <p className="text-sm text-muted-foreground">
                      Improve readability across the interface.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLargerTextToggle(!largerText)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      largerText ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        largerText ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                  <div>
                    <p className="font-medium text-foreground">Reduced motion</p>
                    <p className="text-sm text-muted-foreground">
                      Minimize transitions and animations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReducedMotionToggle(!reducedMotion)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      reducedMotion ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        reducedMotion ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard
              title="Account"
              description="Manage your account"
            >
              <AccountActionsCard onLogout={handleLogout} />
            </SettingsSectionCard>
          </div>
        </div>
      </div>
    </main>
  )
}
