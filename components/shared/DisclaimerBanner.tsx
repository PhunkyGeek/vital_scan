import { AlertTriangle } from "lucide-react"

export function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
            Medical Disclaimer
          </p>
          <p className="text-amber-700 dark:text-amber-300">
            Vital Scan provides AI-assisted screening and informative content for quick self-care solutions only.
            This is not a substitute for a professional, endeavour to seek further medical advice, diagnosis, or treatment.
            Always consult with qualified healthcare providers for medical concerns.
          </p>
        </div>
      </div>
    </div>
  )
}