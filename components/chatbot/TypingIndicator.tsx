export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="inline-block h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="inline-block h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
