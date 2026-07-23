import { AlertCircle, Heart } from 'lucide-react'

export function PrivacyInfoCard() {
  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              AI-Assisted Screening Only
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Vital Scan provides AI-assisted screening and educational information{' '}
              <strong>only</strong>. It is not a diagnostic tool and should never be used in place
              of professional medical advice. If you suspect a serious condition, especially with
              red flags, seek immediate professional medical care.
            </p>
          </div>
        </div>
      </div>

      {/* Data Storage */}
      <div className="p-4 rounded-lg bg-muted border border-border">
        <div className="flex gap-3">
          <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              Your Data
            </h4>
            <p className="text-sm text-muted-foreground">
              Your screening images and results are stored securely. Only you can access your
              screening history. We never share your data with third parties without your consent.
            </p>
          </div>
        </div>
      </div>

      {/* Educational Purpose */}
      <div className="p-4 rounded-lg bg-muted border border-border">
        <h4 className="font-semibold text-foreground mb-2">
          Educational Purpose
        </h4>
        <p className="text-sm text-muted-foreground">
          This app is designed to help you learn about health conditions and make informed
          decisions about seeking professional care. All content is for educational purposes only.
        </p>
      </div>
    </div>
  )
}
