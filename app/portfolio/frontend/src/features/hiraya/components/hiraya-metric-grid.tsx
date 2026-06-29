import type { HirayaMetric } from '@/content/hiraya/types'

function HirayaMetricTile({ metric }: { metric: HirayaMetric }) {
  return (
    <div className="border border-border bg-background/70 p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground">
        {metric.label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-normal text-foreground">{metric.value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{metric.note}</p>
    </div>
  )
}

export function HirayaMetricGrid({ metrics }: { metrics: readonly HirayaMetric[] }) {
  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <HirayaMetricTile key={`${metric.label}-${metric.value}`} metric={metric} />
      ))}
    </div>
  )
}
