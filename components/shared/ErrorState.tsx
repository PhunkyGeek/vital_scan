import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'inline' | 'card'
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again or contact support if the problem persists.',
  onRetry,
  className,
  variant = 'default',
}: ErrorStateProps) {
  if (variant === 'inline') {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{message}</span>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-auto p-0 text-destructive hover:text-destructive/80"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-2">
            {message}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}