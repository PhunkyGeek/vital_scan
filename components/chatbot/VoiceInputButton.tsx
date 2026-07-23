import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'

interface VoiceInputButtonProps {
  onStart: () => void
  onStop: () => void
  isListening: boolean
  isSupported: boolean
  disabled?: boolean
}

export function VoiceInputButton({
  onStart,
  onStop,
  isListening,
  isSupported,
  disabled,
}: VoiceInputButtonProps) {
  if (!isSupported) {
    return null
  }

  const handleClick = () => {
    if (isListening) {
      onStop()
    } else {
      onStart()
    }
  }

  return (
    <Button
      variant={isListening ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      title={isListening ? 'Stop recording' : 'Start recording'}
      className={isListening ? 'animate-pulse' : ''}
    >
      {isListening ? (
        <>
          <Square className="h-4 w-4" />
          <span className="ml-1 text-xs">Stop</span>
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          <span className="ml-1 text-xs">Voice</span>
        </>
      )}
    </Button>
  )
}
