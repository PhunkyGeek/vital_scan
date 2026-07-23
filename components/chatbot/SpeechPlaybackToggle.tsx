import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'

interface SpeechPlaybackToggleProps {
  isSupported: boolean
  isSpeaking: boolean
  onSpeak: (text: string) => void
  onStop: () => void
  text: string
  disabled?: boolean
}

export function SpeechPlaybackToggle({
  isSupported,
  isSpeaking,
  onSpeak,
  onStop,
  text,
  disabled,
}: SpeechPlaybackToggleProps) {
  if (!isSupported || !text?.trim()) {
    return null
  }

  const handleClick = () => {
    if (isSpeaking) {
      onStop()
    } else {
      onSpeak(text)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="h-4 w-4" />
          <span className="ml-1 text-xs">Mute</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" />
          <span className="ml-1 text-xs">Listen</span>
        </>
      )}
    </Button>
  )
}
