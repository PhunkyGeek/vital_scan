import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  variant?: 'default' | 'elevated' | 'bordered'
}

export function SectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
  variant = 'default',
}: SectionCardProps) {
  const cardClassName = cn(
    'transition-all duration-200',
    {
      'shadow-sm': variant === 'default',
      'shadow-md border-2': variant === 'elevated',
      'border-2 border-primary/20': variant === 'bordered',
    },
    className
  )

  return (
    <Card className={cardClassName}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}