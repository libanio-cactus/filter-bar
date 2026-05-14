import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface SelectFieldProps {
  label: string
  options: string[]
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
}

export function SelectField({
  label,
  options,
  placeholder = 'Selecione',
  value = '',
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function openDropdown() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasValue = !!value

  return (
    <div className="flex flex-col gap-1" style={{ position: 'relative' }}>
      <span className="text-xs font-semibold tracking-wide" style={{ color: '#8C9099' }}>
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        onClick={openDropdown}
        className="flex items-center gap-2 rounded-lg text-sm font-medium cursor-pointer select-none"
        style={{
          backgroundColor: '#1E2028',
          border: `1px solid ${open ? 'rgba(168,214,42,0.45)' : '#2A2C38'}`,
          transition: 'border-color 0.15s',
          padding: '6px 8px 6px 10px',
          minWidth: '140px',
          color: hasValue ? '#F2F2F2' : '#8C9099',
          textAlign: 'left',
        }}
      >
        <span className="flex-1 truncate">{value || placeholder}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="flex-shrink-0"
          style={{
            color: open ? '#A8D62A' : '#8C9099',
            transition: 'transform 0.2s, color 0.15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{
            ...dropdownStyle,
            backgroundColor: '#1E2028',
            border: '1px solid #2A2C38',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {options.map((o) => {
            const isSelected = o === value
            return (
              <button
                key={o}
                type="button"
                onClick={() => { onChange?.(o); setOpen(false) }}
                className="w-full text-left text-sm font-medium px-3 py-2 cursor-pointer transition-colors duration-100"
                style={{
                  backgroundColor: isSelected ? 'rgba(168,214,42,0.1)' : 'transparent',
                  color: isSelected ? '#A8D62A' : '#F2F2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {o}
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A8D62A" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}
