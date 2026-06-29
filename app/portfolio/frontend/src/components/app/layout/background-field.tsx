export function BackgroundField() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="grid-overlay absolute inset-0 opacity-75" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent_34%),linear-gradient(180deg,transparent_0%,var(--background)_72%)]" />
    </div>
  )
}
