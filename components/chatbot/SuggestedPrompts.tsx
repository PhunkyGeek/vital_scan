import { Button } from '@/components/ui/button'

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void
  isScreeningLinked: boolean
}

export function SuggestedPrompts({
  onSelectPrompt,
  isScreeningLinked,
}: SuggestedPromptsProps) {
  const prompts = isScreeningLinked
    ? [
        'What does my result mean?',
        'What symptoms should I watch closely?',
        'When should I see a doctor?',
        'How should I think about this risk level?',
      ]
    : [
        'What are common health screening basics?',
        'When should I seek medical care?',
        'How can I understand my health better?',
        'What does risk level mean?',
      ]

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
        Try asking
      </p>
      <div className="grid gap-2">
        {prompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            className="h-auto justify-start text-left text-sm"
            onClick={() => onSelectPrompt(prompt)}
          >
            <span className="text-muted-foreground">{prompt}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
