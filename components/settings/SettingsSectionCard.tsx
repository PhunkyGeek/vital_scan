import React, { ReactNode } from 'react'

interface SettingsSectionCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function SettingsSectionCard({
  title,
  description,
  children,
  className = '',
}: SettingsSectionCardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
