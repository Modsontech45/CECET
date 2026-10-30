const BASE =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 text-[14px] font-bold tracking-tight transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]'

export const btnPrimary = `${BASE} bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-hover)] hover:shadow-md`
export const btnLime    = `${BASE} bg-[var(--lime)] text-white shadow-sm hover:bg-[var(--lime-hover)] hover:shadow-md`
export const btnOutline = `${BASE} border border-[var(--color-border)] bg-[var(--dash-card)] text-[var(--color-text)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--chart-track)]`
export const btnOnDark  = `${BASE} border border-white/20 text-white hover:bg-[var(--forest-500)] hover:border-white/30`
export const btnGhost   = `${BASE} text-[var(--color-text-muted)] hover:bg-[var(--chart-track)] hover:text-[var(--color-text)]`
export const btnDanger  = `${BASE} bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] hover:bg-[var(--tone-danger-fg)] hover:text-white`
