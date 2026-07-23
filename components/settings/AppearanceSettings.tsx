'use client'

import { Moon, Sun, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

interface AppearanceSettingsProps {
  currentTheme: Theme
  onThemeChange: (theme: Theme) => void
}

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: React.ElementType }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function AppearanceSettings({
  currentTheme,
  onThemeChange,
}: AppearanceSettingsProps) {
  return (
    <div>
      <h4 className="text-sm font-medium text-foreground mb-3">Theme</h4>
      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onThemeChange(value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
              currentTheme === value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <Icon className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
