import { FamilyShell, StatusPill, type CicdSlideVisualProps } from './shared/system-responsibility-kit'

const operatingRows = [
  ['Runners', 'provider operates fleet', 'team operates fleet'],
  ['Caches', 'managed cache boundary', 'capacity and eviction owned'],
  ['Secrets', 'integrate scoped secrets', 'operate secret path'],
  ['Private access', 'brokered connector', 'network routing owned'],
  ['Capacity', 'shared elasticity', 'queue and scaling owned'],
  ['Isolation', 'tenant controls', 'host isolation owned'],
  ['Recovery', 'provider platform SLA', 'restore automation yourself'],
  ['Upgrades', 'mostly provider driven', 'patch platform and runners'],
] as const

export function OperatingModelComparisonSlideVisual(props: CicdSlideVisualProps) {
  return (
    <FamilyShell
      className={props.className}
      label="Hosted versus self-hosted responsibility matrix"
      code="OPS_MODEL_12"
      status="responsibility split"
      railDensity="dense"
      railContent={
        <div className="grid gap-3">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase leading-3 tracking-normal text-muted-foreground">
              interpretation
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-foreground">Compare ownership, not vendor features.</p>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Hosted starts quickly because the provider carries much of the platform surface. Self-hosted adds control,
              but runners, caches, capacity, isolation, recovery, and upgrades become production responsibilities.
            </p>
          </div>
          <div className="grid gap-1.5" aria-label="Ownership legend">
            <StatusPill tone="primary">provider owns or operates</StatusPill>
            <StatusPill tone="warn">team owns or operates</StatusPill>
            <StatusPill tone="muted">define residual responsibility</StatusPill>
          </div>
        </div>
      }
    >
      <div className="w-full overflow-hidden rounded-md border border-border bg-card/80">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[38%]" />
            <col className="w-[38%]" />
          </colgroup>
          <caption className="sr-only">Hosted versus self-hosted CI/CD responsibility matrix</caption>
          <thead className="bg-muted/60">
            <tr>
              <th className="border-b border-r border-border px-2 py-2 text-[9px] font-semibold uppercase">responsibility</th>
              <th className="border-b border-r border-border px-2 py-2 text-[9px] font-semibold uppercase">hosted CI/CD</th>
              <th className="border-b border-border px-2 py-2 text-[9px] font-semibold uppercase">self-hosted CI/CD</th>
            </tr>
          </thead>
          <tbody>
            {operatingRows.map(([row, hosted, selfHosted]) => (
              <tr key={row}>
                <th className="border-b border-r border-border px-2 py-2 text-[11px] font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                    {row}
                  </span>
                </th>
                <td className="border-b border-r border-border px-2 py-2 text-[11px] leading-4 text-muted-foreground">
                  <StatusPill tone="primary">provider</StatusPill>
                  <span className="ml-2">{hosted}</span>
                </td>
                <td className="border-b border-border px-2 py-2 text-[11px] leading-4 text-muted-foreground">
                  <StatusPill tone="warn">team</StatusPill>
                  <span className="ml-2">{selfHosted}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FamilyShell>
  )
}
