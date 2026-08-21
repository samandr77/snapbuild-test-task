import type { ReactNode } from 'react'

/**
 * Иконки лендинга — инлайновый SVG вместо шрифта или спрайта:
 * масштабируются вместе с vw-сеткой и наследуют currentColor.
 */

type IconProps = { className?: string }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function SystemIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="3" y="3" width="11" height="11" rx="3" {...stroke} />
      <rect x="18" y="3" width="11" height="11" rx="5.5" {...stroke} />
      <rect x="3" y="18" width="11" height="11" rx="5.5" {...stroke} />
      <rect x="18" y="18" width="11" height="11" rx="3" {...stroke} />
    </svg>
  )
}

export function ConfigIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 9h24M4 16h24M4 23h24" {...stroke} />
      <circle cx="11" cy="9" r="3" fill="currentColor" />
      <circle cx="21" cy="16" r="3" fill="currentColor" />
      <circle cx="14" cy="23" r="3" fill="currentColor" />
    </svg>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 3l11 4v9c0 7-4.6 11.4-11 13-6.4-1.6-11-6-11-13V7z" {...stroke} />
      <path d="M11 16.2l3.4 3.3L21 12.8" {...stroke} />
    </svg>
  )
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M9 24a6 6 0 010-12 8 8 0 0115.4 2.2A5.4 5.4 0 0123 24z" {...stroke} />
      <path d="M16 14v7m0 0l-2.6-2.6M16 21l2.6-2.6" {...stroke} />
    </svg>
  )
}

export function StackIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 3l12 6-12 6L4 9z" {...stroke} />
      <path d="M4 16l12 6 12-6M4 23l12 6 12-6" {...stroke} />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="url(#checkGradient)" />
      <path d="M5 8.3l2 2 4-4.3" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="checkGradient" x1="1" y1="1" x2="15" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6d3c" />
          <stop offset="0.46" stopColor="#ff6ba7" />
          <stop offset="1" stopColor="#bb6dff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="rgba(0,0,0,0.08)" />
      <path d="M5.2 8h5.6" fill="none" stroke="#5A5B62" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function SuccessIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M6 16.5l6.5 6.5L26 9.5" fill="none" stroke="url(#successGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="successGradient" x1="6" y1="9" x2="26" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6d3c" />
          <stop offset="0.46" stopColor="#ff6ba7" />
          <stop offset="1" stopColor="#bb6dff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} width="14" height="14" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.6v4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
    </svg>
  )
}

/* --------------------------------------------------------------------------
   Иконки мокапа приложения в первом экране.
   Компактные 16×16, штрих 1.4 — читаются в мелком масштабе.
   -------------------------------------------------------------------------- */

const ui = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const box = (children: ReactNode, className?: string) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
    {children}
  </svg>
)

export const SearchIcon = ({ className }: IconProps) =>
  box(
    <>
      <circle cx="7.2" cy="7.2" r="4.2" {...ui} />
      <path d="M10.4 10.4 13.5 13.5" {...ui} />
    </>,
    className,
  )

export const CreateIcon = ({ className }: IconProps) =>
  box(
    <>
      <path d="M2.5 13.5 4 9.6l6-6a1.6 1.6 0 0 1 2.3 2.3l-6 6z" {...ui} />
      <path d="M12.6 2.2 13 1l.4 1.2 1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4z" fill="currentColor" stroke="none" />
    </>,
    className,
  )

export const GridIcon = ({ className }: IconProps) =>
  box(
    <>
      {[3, 8, 13].map((y) =>
        [3, 8, 13].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="currentColor" />),
      )}
    </>,
    className,
  )

export const PhotoIcon = ({ className }: IconProps) =>
  box(
    <>
      <rect x="2.2" y="3.6" width="9" height="8.8" rx="2" {...ui} />
      <path d="M13.8 5.4v6a2 2 0 0 1-2 2H5.6" {...ui} />
      <circle cx="5.3" cy="6.5" r="1" {...ui} />
      <path d="M2.4 10.8 5 8.6l3.4 2.6" {...ui} />
    </>,
    className,
  )

export const PlayIcon = ({ className }: IconProps) =>
  box(
    <>
      <rect x="2.2" y="3.2" width="11.6" height="9.6" rx="2.2" {...ui} />
      <path d="M7 6.6 9.9 8 7 9.4z" fill="currentColor" stroke="none" />
    </>,
    className,
  )

export const DeckIcon = ({ className }: IconProps) =>
  box(
    <>
      <rect x="2.2" y="3" width="11.6" height="8" rx="1.8" {...ui} />
      <path d="M8 11v2.2M5.8 13.4h4.4" {...ui} />
    </>,
    className,
  )

export const BannerIcon = ({ className }: IconProps) =>
  box(
    <>
      <rect x="1.8" y="4.4" width="12.4" height="7.2" rx="1.8" {...ui} />
      <path d="M4.4 7.2h3.2M4.4 9.4h5.6" {...ui} />
    </>,
    className,
  )

export const StarIcon = ({ className }: IconProps) =>
  box(<path d="m8 2.4 1.7 3.5 3.8.5-2.8 2.7.7 3.8L8 11.1l-3.4 1.8.7-3.8L2.5 6.4l3.8-.5z" {...ui} />, className)

export const CloudUpIcon = ({ className }: IconProps) =>
  box(
    <>
      <path d="M4.6 12.2a3 3 0 0 1 .3-6 4 4 0 0 1 7.6 1.1 2.6 2.6 0 0 1-.6 4.9" {...ui} />
      <path d="M8 13.6V8.4m0 0L6.6 9.8M8 8.4l1.4 1.4" {...ui} />
    </>,
    className,
  )

export const SystemMarkIcon = ({ className }: IconProps) =>
  box(
    <>
      <path d="M3 3l10 10M13 3 3 13" {...ui} />
      <circle cx="8" cy="8" r="2.1" {...ui} />
    </>,
    className,
  )

export const PresetIcon = ({ className }: IconProps) =>
  box(
    <>
      <rect x="2.2" y="3.4" width="11.6" height="9.2" rx="2" {...ui} />
      <path d="M2.6 10.6 6 7.8l4.2 3.4" {...ui} />
      <circle cx="10.4" cy="6.2" r="1.1" {...ui} />
    </>,
    className,
  )

export const ToolsIcon = ({ className }: IconProps) =>
  box(
    <>
      <rect x="2.4" y="2.4" width="4.6" height="4.6" rx="1.3" {...ui} />
      <rect x="9" y="2.4" width="4.6" height="4.6" rx="2.3" {...ui} />
      <rect x="2.4" y="9" width="4.6" height="4.6" rx="2.3" {...ui} />
      <rect x="9" y="9" width="4.6" height="4.6" rx="1.3" {...ui} />
    </>,
    className,
  )

export const ClipIcon = ({ className }: IconProps) =>
  box(
    <path d="M12.6 7.4 7.8 12.2a3 3 0 0 1-4.3-4.3l5.2-5.2a2 2 0 0 1 2.9 2.9l-5.2 5.2a1 1 0 0 1-1.4-1.4l4.6-4.6" {...ui} />,
    className,
  )

export const SparkleIcon = ({ className }: IconProps) =>
  box(
    <>
      <path d="M9.4 2.6 10.4 5.4 13.2 6.4 10.4 7.4 9.4 10.2 8.4 7.4 5.6 6.4 8.4 5.4z" fill="currentColor" stroke="none" />
      <path d="M4.6 9.6 5.2 11.2 6.8 11.8 5.2 12.4 4.6 14 4 12.4 2.4 11.8 4 11.2z" fill="currentColor" stroke="none" />
    </>,
    className,
  )

export const CodeIcon = ({ className }: IconProps) =>
  box(
    <>
      <rect x="1.8" y="3.2" width="12.4" height="9.6" rx="2" {...ui} />
      <path d="M6.4 6.8 4.8 8l1.6 1.2M9.6 6.8 11.2 8l-1.6 1.2" {...ui} />
    </>,
    className,
  )

export const ImagePlusIcon = ({ className }: IconProps) =>
  box(
    <>
      <path d="M13.6 8.6v3a2 2 0 0 1-2 2H4.4a2 2 0 0 1-2-2V4.4a2 2 0 0 1 2-2h3.2" {...ui} />
      <path d="M2.6 11.4 5.6 8.8l3.4 2.8" {...ui} />
      <path d="M11.6 1.8v3.6M9.8 3.6h3.6" {...ui} />
    </>,
    className,
  )

export const ClapIcon = ({ className }: IconProps) =>
  box(
    <>
      <rect x="1.8" y="5" width="12.4" height="8.2" rx="1.8" {...ui} />
      <path d="M1.8 8h12.4" {...ui} />
      <path d="M4.6 5 3.4 2.8M8 5 6.8 2.8M11.4 5 10.2 2.8" {...ui} />
    </>,
    className,
  )

export const ChevronIcon = ({ className }: IconProps) =>
  box(<path d="m4.6 6.4 3.4 3.4 3.4-3.4" {...ui} />, className)

export const CollapseIcon = ({ className }: IconProps) =>
  box(<path d="m8.6 4.6-3.4 3.4 3.4 3.4M12.2 4.6 8.8 8l3.4 3.4" {...ui} />, className)
