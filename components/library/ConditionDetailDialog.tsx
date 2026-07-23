import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AlertCircle, Heart, Shield, Zap } from 'lucide-react'
import type { Condition } from '@/lib/data/conditions'
import { RiskBadge, type RiskLevel } from '@/components/common/RiskBadge'

interface ConditionDetailDialogProps {
  condition: Condition | null
  isOpen: boolean
  onClose: () => void
}

export function ConditionDetailDialog({
  condition,
  isOpen,
  onClose,
}: ConditionDetailDialogProps) {
  if (!condition) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">{condition.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {condition.overview}
              </DialogDescription>
            </div>
            <RiskBadge risk={condition.risk_level as RiskLevel} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Common Signs */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-base mb-3">
              <Heart className="w-5 h-5 text-primary" />
              Common Signs
            </h3>
            {condition.common_signs && condition.common_signs.length > 0 ? (
              <ul className="space-y-2">
                {condition.common_signs.map((sign, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-foreground flex gap-2 items-start"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No common signs documented.
              </p>
            )}
          </section>

          {/* Red Flags */}
          {condition.red_flags && condition.red_flags.length > 0 && (
            <section className="rounded-lg bg-destructive/5 p-4 border border-destructive/20">
              <h3 className="flex items-center gap-2 font-semibold text-base mb-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Red Flags - Seek Care Immediately
              </h3>
              <ul className="space-y-2">
                {condition.red_flags.map((flag, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-foreground flex gap-2 items-start"
                  >
                    <span className="text-destructive font-bold">‼</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Likely Triggers */}
          {condition.likely_triggers && condition.likely_triggers.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-base mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                Likely Triggers
              </h3>
              <ul className="space-y-2">
                {condition.likely_triggers.map((trigger, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-foreground flex gap-2 items-start"
                  >
                    <span className="text-amber-500 mt-1">•</span>
                    <span>{trigger}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Self-Care */}
          {condition.self_care && condition.self_care.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-semibold text-base mb-3">
                <Shield className="w-5 h-5 text-green-500" />
                Self-Care Tips
              </h3>
              <ul className="space-y-2">
                {condition.self_care.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-foreground flex gap-2 items-start"
                  >
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* When to Seek Help */}
          <section className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-900">
            <h3 className="font-semibold text-base mb-2 text-blue-900 dark:text-blue-300">
              When to Seek Professional Help
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {condition.when_to_seek_help}
            </p>
          </section>

          {/* Prevention */}
          {condition.prevention && (
            <section>
              <h3 className="font-semibold text-base mb-3">Prevention</h3>
              <p className="text-sm text-foreground">{condition.prevention}</p>
            </section>
          )}

          {/* Category & Treatment Urgency */}
          <section className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <p className="font-semibold text-foreground capitalize">
                {condition.category}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">
                Treatment Urgency
              </p>
              <p className="font-semibold text-foreground capitalize">
                {condition.treatment_urgency}
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="rounded-lg bg-muted p-4 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This information is educational only
              and not a substitute for professional medical advice. Always
              consult with a healthcare provider for diagnosis and treatment.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
