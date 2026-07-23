import { AlertCircle } from 'lucide-react'

export function AssistantScopeBanner() {
  return (
    <div className="border-t border-border bg-amber-50 dark:bg-amber-950/20 px-4 sm:px-6 py-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 dark:text-amber-100">
          <span className="font-medium">AI-Assisted Education:</span> This assistant provides health
          education only, not medical diagnosis or treatment. For urgent symptoms or medical
          decisions, contact a healthcare professional immediately.
        </p>
      </div>
    </div>
  )
}
