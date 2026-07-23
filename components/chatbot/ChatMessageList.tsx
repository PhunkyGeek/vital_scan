import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/lib/data/chat'
import { ChatMessageBubble } from './ChatMessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface ChatMessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scroll-smooth">
      {messages.map((message) => (
        <ChatMessageBubble
          key={message.id}
          message={message}
        />
      ))}

      {isLoading && (
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium text-white bg-muted-foreground/40">
            AI
          </div>
          <div className="flex items-center gap-2">
            <TypingIndicator />
          </div>
        </div>
      )}

      <div ref={scrollEndRef} />
    </div>
  )
}
