import { useState } from 'react'
import { Clock3, Gauge, TimerReset, XCircle } from 'lucide-react'

import { FamilyShell, MiniCard, type VisualProps } from './shared/evidence-metrics-kit'
import { VisualStateController } from './shared/visual-state-control'

const deliveryScenarios = {
  steady: ['Small batches make frequency meaningful.', 'Lead time mostly waiting.', 'Failures low but risk still tracked.', 'Recovery path meets service needs.'],
  risky: ['High frequency hides large release risk.', 'Lead time excludes approval delay.', 'Failure rate rises with batch scope.', 'Recovery time exceeds tolerance.'],
} as const

const deliveryMetrics = [
  ['Deploy frequency', '18/wk', 'batch size', Gauge],
  ['Lead time', '7h', 'waiting time', Clock3],
  ['Failure rate', '12%', 'release risk', XCircle],
  ['Recovery time', '38m', 'service restore', TimerReset],
] as const

export function DeliveryRecoveryMetricsSlideVisual({ className }: VisualProps) {
  const [scenario, setScenario] = useState<keyof typeof deliveryScenarios>('steady')

  return (
    <FamilyShell
      className={className}
      title="Delivery and recovery board"
      code="DORA_06"
      status={scenario === 'steady' ? 'context ok' : 'context risky'}
      ariaLabel="Four metric board connecting deployment frequency lead time failure rate and recovery time with interpretation"
      railContent={
        <div className="grid gap-3">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
              scenario interpretation
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-foreground">
              {scenario === 'steady' ? 'Small batches keep the metrics readable.' : 'Hidden release context makes the same metrics suspect.'}
            </p>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Deployment frequency, lead time, failure rate, and recovery time only make sense beside batch size, waiting,
              release risk, and the actual recovery path.
            </p>
          </div>
          <div className="grid gap-1.5 text-[11px] leading-4 text-muted-foreground">
            {deliveryScenarios[scenario].map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
        </div>
      }
      controls={
        <VisualStateController
          model={{
            label: 'Team scenario',
            value: scenario,
            onValueChange: setScenario,
            steps: [
              {
                value: 'steady',
                label: 'Small batch',
                description: 'Metrics stay meaningful because deploy frequency and recovery are interpreted with batch context.',
                status: 'context ok',
              },
              {
                value: 'risky',
                label: 'Risk hidden',
                description: 'The same metrics become suspect when batch scope, approvals, and recovery tolerance are hidden.',
                status: 'context risky',
              },
            ],
          }}
        />
      }
    >
      <div className="grid h-full content-center gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {deliveryMetrics.map(([label, value, context, Icon], index) => (
            <MiniCard
              key={label}
              label={label}
              value={`${value} / ${context}`}
              detail={deliveryScenarios[scenario][index]}
              Icon={Icon}
              tone={scenario === 'risky' && index > 1 ? 'danger' : index < 2 ? 'primary' : 'success'}
              active
              className="min-h-32"
            />
          ))}
        </div>
      </div>
    </FamilyShell>
  )
}
