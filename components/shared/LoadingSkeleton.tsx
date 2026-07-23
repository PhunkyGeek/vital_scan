import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
  lines?: number
}

export function LoadingSkeleton({
  className,
  variant = 'default',
  lines = 1,
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded-md'

  if (variant === 'card') {
    return (
      <div className={cn('space-y-3 p-4 border rounded-xl', className)}>
        <div className={cn(baseClasses, 'h-4 w-3/4')} />
        <div className={cn(baseClasses, 'h-4 w-1/2')} />
        <div className={cn(baseClasses, 'h-32 w-full')} />
      </div>
    )
  }

  if (variant === 'avatar') {
    return (
      <div className={cn(baseClasses, 'h-10 w-10 rounded-full', className)} />
    )
  }

  if (variant === 'button') {
    return (
      <div className={cn(baseClasses, 'h-10 w-24 rounded-md', className)} />
    )
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }

  return <div className={cn(baseClasses, 'h-4 w-full', className)} />
}