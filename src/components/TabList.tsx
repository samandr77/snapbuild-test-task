export type TabItem = { id: string; label: string }

/**
 * Ряд вкладок-пилюль. На узких экранах прокручивается по горизонтали,
 * не растягивая страницу. Используется в «Возможностях» и «Интеграциях».
 */
export function TabList({
  items,
  active,
  onSelect,
  label,
  idPrefix,
  role = 'tablist',
  className = '',
}: {
  items: TabItem[]
  active: string
  onSelect: (id: string) => void
  label: string
  idPrefix?: string
  role?: 'tablist' | 'group'
  className?: string
}) {
  const isTabs = role === 'tablist'
  return (
    <div className={`tablist ${className}`.trim()} role={role} aria-label={label}>
      {items.map((item) => {
        const selected = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            className="tab"
            role={isTabs ? 'tab' : undefined}
            id={isTabs && idPrefix ? `${idPrefix}-tab-${item.id}` : undefined}
            aria-selected={selected}
            aria-controls={isTabs && idPrefix ? `${idPrefix}-panel-${item.id}` : undefined}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
