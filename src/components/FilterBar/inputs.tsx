import { useRef, useState } from 'react'

// ─── shared wrapper ──────────────────────────────────────────────────────────

function InputWrapper({
  focused,
  active,
  error,
  children,
}: {
  focused: boolean
  active?: boolean
  error?: boolean
  children: React.ReactNode
}) {
  const border = error
    ? 'rgba(229,57,53,0.6)'
    : focused || active
    ? 'rgba(168,214,42,0.45)'
    : '#2A2C38'
  return (
    <div
      className="flex items-center gap-2 rounded-lg"
      style={{
        backgroundColor: '#1E2028',
        border: `1px solid ${border}`,
        transition: 'border-color 0.15s',
        padding: '6px 8px 6px 10px',
      }}
    >
      {children}
    </div>
  )
}

function IconButton({
  focused,
  active,
  onClick,
  children,
}: {
  focused: boolean
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer"
      style={{
        color: focused || active ? '#A8D62A' : '#8C9099',
        lineHeight: 0,
        transition: 'color 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ─── time input ──────────────────────────────────────────────────────────────

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

function isValidTime(v: string): boolean {
  const m = v.match(/^(\d{2}):(\d{2})$/)
  if (!m) return false
  return Number(m[1]) <= 23 && Number(m[2]) <= 59
}

interface TimeInputProps {
  value: string // HH:mm
  error?: boolean
  onChange: (v: string) => void
  active?: boolean
}

export function TimeInput({ value, onChange, active, error }: TimeInputProps) {
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [display, setDisplay] = useState(value)
  const [focused, setFocused] = useState(false)

  // Sync display when value changes externally (e.g. preset click)
  const prevValue = useRef(value)
  if (value !== prevValue.current) {
    prevValue.current = value
    setDisplay(value)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatTimeInput(e.target.value)
    setDisplay(formatted)
    if (isValidTime(formatted)) onChange(formatted)
  }

  function handleBlur() {
    setFocused(false)
    // revert to last valid value if incomplete
    if (!isValidTime(display)) setDisplay(value)
  }

  function openPicker() {
    hiddenRef.current?.showPicker?.()
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(e.target.value)
    onChange(e.target.value)
  }

  return (
    <InputWrapper focused={focused} active={active} error={error}>
      <IconButton focused={focused} active={active} onClick={openPicker}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </IconButton>

      <input
        type="text"
        inputMode="numeric"
        value={display}
        placeholder="HH:MM"
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        className="bg-transparent text-sm font-medium outline-none"
        style={{ color: '#F2F2F2', width: '3.5rem', cursor: 'text' }}
      />

      {/* hidden native picker — acionado pelo ícone */}
      <input
        ref={hiddenRef}
        type="time"
        value={value}
        onChange={handlePickerChange}
        tabIndex={-1}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
    </InputWrapper>
  )
}

// ─── date input ──────────────────────────────────────────────────────────────

function isoToDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function displayToIso(display: string): string {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

interface DateInputProps {
  value: string // YYYY-MM-DD
  onChange: (v: string) => void
  min?: string
  max?: string
}

export function DateInput({ value, onChange, min, max }: DateInputProps) {
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [display, setDisplay] = useState(isoToDisplay(value))
  const [focused, setFocused] = useState(false)

  const prevValue = useRef(value)
  if (value !== prevValue.current) {
    prevValue.current = value
    setDisplay(isoToDisplay(value))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatDateInput(e.target.value)
    setDisplay(formatted)
    const iso = displayToIso(formatted)
    if (iso) onChange(iso)
  }

  function handleBlur() {
    setFocused(false)
    if (!displayToIso(display)) setDisplay(isoToDisplay(value))
  }

  function openPicker() {
    hiddenRef.current?.showPicker?.()
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
    setDisplay(isoToDisplay(e.target.value))
  }

  return (
    <InputWrapper focused={focused}>
      <IconButton focused={focused} onClick={openPicker}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </IconButton>

      <input
        type="text"
        inputMode="numeric"
        value={display}
        placeholder="DD/MM/AAAA"
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        className="bg-transparent text-sm font-medium outline-none"
        style={{ color: '#F2F2F2', width: '6.5rem', cursor: 'text' }}
      />

      <input
        ref={hiddenRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={handlePickerChange}
        tabIndex={-1}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
    </InputWrapper>
  )
}
