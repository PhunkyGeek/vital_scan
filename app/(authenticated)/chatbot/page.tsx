"use client"

import dynamic from 'next/dynamic'

// Dynamically import the client component with SSR disabled
const ClientPage = dynamic(() => import('./ClientPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

export default function ChatbotPage() {
  return <ClientPage />
}