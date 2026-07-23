'use client'

import { Volume2, VolumeX } from 'lucide-react'

interface VoiceSettingsProps {
  voiceEnabled: boolean
  onVoiceToggle: (enabled: boolean) => void
}

export function VoiceSettings({
  voiceEnabled,
  onVoiceToggle,
}: VoiceSettingsProps) {
  return (
    <div>
      <h4 className="text-sm font-medium text-foreground mb-3">Voice Features</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            {voiceEnabled ? (
              <Volume2 className="w-5 h-5 text-primary" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-foreground">Voice Playback</p>
              <p className="text-sm text-muted-foreground">
                Enable AI voice responses in the chatbot
              </p>
            </div>
          </div>
          <button
            onClick={() => onVoiceToggle(!voiceEnabled)}
            className={`relative w-12 h-6 rounded-full transition-all ${
              voiceEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                voiceEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          When enabled, the chatbot can read responses aloud using your device’s speaker.
        </p>
      </div>
    </div>
  )
}
