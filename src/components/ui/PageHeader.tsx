import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-8 w-[3px] shrink-0 rounded-full bg-[var(--lime)]" />
          <h1 className="text-[30px] font-black leading-tight tracking-tight text-[var(--color-text)]">{title}</h1>
        </div>
        {description && (
          <p className="mt-2 ml-[15px] max-w-2xl text-[14px] font-medium leading-6 text-[var(--color-text-muted)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
