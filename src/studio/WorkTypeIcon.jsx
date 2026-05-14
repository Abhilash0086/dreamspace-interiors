export const WORK_TYPE_ICONS = {
  'Flooring': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="18" y="3" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="3" y="18" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="18" y="18" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
  'Wall Painting': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M19 8h6a2 2 0 012 2v4a2 2 0 01-2 2h-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M14 23l3 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 8h8M7 12h8M7 16h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  'False Ceiling': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7h26" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M3 12h26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 2"/>
      <path d="M10 12v8M16 12v5M22 12v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="10" cy="22" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="22" cy="22" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M14 19h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  'Modular Kitchen': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="26" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="3" y="17" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="17" y="17" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 22h-0.01M23 22h-0.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 13h26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="16" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  'Carpentry': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="20" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M23 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 10V7M11 10V7M15 10V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 19l4 8M27 19l-4 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M3 22h26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  'Electrical': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 3l-7 13h7l-7 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M22 10h4M24 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  'Plumbing': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4v14a6 6 0 006 6h8a4 4 0 004-4v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 4h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M24 12v-4h4v-2h-8v2h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 24h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  'Furniture': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 18V12a2 2 0 012-2h20a2 2 0 012 2v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <rect x="3" y="18" width="26" height="5" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 23v3M25 23v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M4 14h4M24 14h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  'Wallpaper': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="14" height="26" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 9c2-1 4 1 6 0M7 13c2-1 4 1 6 0M7 17c2-1 4 1 6 0M7 21c2-1 4 1 6 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M22 7l5 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M20 6.5c1-1 3-.5 4 .5M22 25c.5 1 2 1.5 3 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  'Tiles': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="12.5" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="22" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="12.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="12.5" y="12.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="22" y="12.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="22" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="12.5" y="22" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="22" y="22" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  'Other': (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="16" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="24" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
}

export default function WorkTypeIcon({ type, size = 24, color = 'currentColor' }) {
  const icon = WORK_TYPE_ICONS[type]
  if (!icon) return null
  return (
    <span
      style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0, color }}
      aria-label={type}
    >
      {icon}
    </span>
  )
}
