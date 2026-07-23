import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Phone } from 'lucide-react'

export function UrgentCareAlert() {
  return (
    <Alert className="border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <p className="font-semibold">
          This screening indicates a potentially serious condition that may require urgent medical attention.
        </p>
        <p>
          Please contact a healthcare professional or emergency services immediately if you experience:
        </p>
        <ul className="ml-4 space-y-1 text-sm">
          <li>• Severe pain or discomfort</li>
          <li>• Difficulty breathing</li>
          <li>• High fever</li>
          <li>• Rapidly worsening symptoms</li>
          <li>• Any red flag symptoms mentioned above</li>
        </ul>
        <div className="flex items-center gap-2 pt-2">
          <Phone className="h-4 w-4" />
          <span className="text-sm font-medium">
            Emergency: Call 911 (US) or your local emergency number
          </span>
        </div>
      </AlertDescription>
    </Alert>
  )
}