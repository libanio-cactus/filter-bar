import type { FilterMode } from './types'

interface ModeToggleProps {
  value: FilterMode
  onChange: (mode: FilterMode) => void
}

const ICONS = {
  realtime: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <path d="M6.3 6.3a8 8 0 0 0 0 11.4" strokeLinecap="round" />
      <path d="M17.7 6.3a8 8 0 0 1 0 11.4" strokeLinecap="round" />
      <path d="M9.2 9.2a4 4 0 0 0 0 5.6" strokeLinecap="round" />
      <path d="M14.8 9.2a4 4 0 0 1 0 5.6" strokeLinecap="round" />
    </svg>
  ),
  historical: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <polyline points="12 8 12 12 14 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.05 11a9 9 0 1 0 .5-4" strokeLinecap="round" />
      <polyline points="3 3 3 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-wide" style={{ color: '#8C9099' }}>
        Modo
      </span>

      <div
        className="flex items-center"
        style={{
          backgroundColor: '#1E2028',
          border: '1px solid #2A2C38',
          borderRadius: '9999px',
          padding: '3px',
          gap: '2px',
        }}
      >
        {(['realtime', 'historical'] as FilterMode[]).map((mode) => {
          const isActive = value === mode
          const label = mode === 'realtime' ? 'Real time' : 'Histórico'

          return (
            <button
              key={mode}
              onClick={() => onChange(mode)}
              className="relative flex items-center gap-2 text-sm font-semibold transition-all duration-200 cursor-pointer select-none"
              style={{
                borderRadius: '9999px',
                padding: '6px 14px',
                backgroundColor: isActive ? 'rgba(168,214,42,0.12)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(168,214,42,0.4)' : 'transparent'}`,
                color: isActive ? '#A8D62A' : '#8C9099',
                minWidth: '108px',
                justifyContent: 'center',
              }}
            >
              {mode === 'realtime' && isActive && (
                <span
                  className="animate-pulse-live inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#E53935' }}
                />
              )}
              {!(mode === 'realtime' && isActive) && (
                <span className="flex-shrink-0">{ICONS[mode]}</span>
              )}
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
