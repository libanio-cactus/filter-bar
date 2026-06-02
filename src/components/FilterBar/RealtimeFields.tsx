import { useEffect, useState } from 'react'
import type { RealtimePreset, TimeRange } from './types'
import { TimeInput } from './inputs'

interface RealtimeFieldsProps {
  preset: RealtimePreset
  customRange: TimeRange
  onPresetChange: (preset: RealtimePreset) => void
  onCustomRangeChange: (range: TimeRange) => void
  onValidationChange: (valid: boolean) => void
}

const PRESETS: { value: RealtimePreset; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '8h', label: '8h' },
  { value: '12h', label: '12h' },
  { value: 'hoje', label: 'Hoje' },
]

function hhmm(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function calcRangeForPreset(preset: RealtimePreset): TimeRange {
  const now = new Date()
  const end = hhmm(now)
  if (preset === 'hoje') return { start: '00:00', end }
  const minutes =
    preset === '1h' ? 60 :
    preset === '4h' ? 240 :
    preset === '8h' ? 480 :
    720 // 12h
  const s = new Date(now.getTime() - minutes * 60 * 1000)
  return { start: hhmm(s), end }
}

type ValidationError = { message: string; field: 'start' | 'end' }

function getDateContext(range: TimeRange) {
  const now = new Date()
  const currentMins = toMinutes(hhmm(now))
  const startMins = toMinutes(range.start)
  const endMins = toMinutes(range.end)
  const endInFuture = endMins > currentMins
  // "Ambos ontem" só se for intervalo de mesmo dia (start ≤ end).
  // Se start > end com fim no futuro, é cross-midnight com fim ainda não chegado —
  // início fica ontem normalmente e fim continua "hoje" (validação avisa).
  const endIsYesterday = endInFuture && startMins <= endMins
  const startIsYesterday = endIsYesterday ? true : startMins > endMins
  return { endIsYesterday, startIsYesterday, endInFuture }
}

function validateCustomRange(range: TimeRange): ValidationError | null {
  const now = new Date()
  const startMins = toMinutes(range.start)
  const endMins = toMinutes(range.end)
  const { endIsYesterday, endInFuture } = getDateContext(range)

  // Cross-midnight com fim ainda no futuro (ex: 23:13 → 01:55 quando agora são 01:30)
  if (endInFuture && !endIsYesterday) {
    return { message: `O horário final não pode ser maior que o horário atual (${hhmm(now)}). Real time exibe dados até agora.`, field: 'end' }
  }
  // Mesmo dia (ambos ontem) mas início posterior ao fim → intervalo invertido
  if (endIsYesterday && startMins > endMins) {
    return { message: 'Intervalo inválido: o horário inicial não pode ser posterior ao final.', field: 'start' }
  }
  if (startMins === endMins) {
    return { message: 'O horário inicial e final não podem ser iguais.', field: 'start' }
  }
  return null
}

export function RealtimeFields({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
  onValidationChange,
}: RealtimeFieldsProps) {
  const isCustom = preset === 'custom'
  const error = isCustom ? validateCustomRange(customRange) : null
  const [tipDismissed, setTipDismissed] = useState(false)

  const { startIsYesterday, endIsYesterday } = getDateContext(customRange)
  const startSuffix = startIsYesterday ? 'ontem' : 'hoje'
  const endSuffix = endIsYesterday ? 'ontem' : 'hoje'


  useEffect(() => {
    onValidationChange(error === null)
  }, [error])

  function handlePresetClick(p: typeof PRESETS[number]) {
    onPresetChange(p.value)
    onCustomRangeChange(calcRangeForPreset(p.value))
  }

  function handleTimeChange(field: 'start' | 'end', value: string) {
    setTipDismissed(false)
    onPresetChange('custom')
    onCustomRangeChange({ ...customRange, [field]: value })
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-wide" style={{ color: '#8C9099' }}>
        Intervalo das últimas
      </span>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {PRESETS.map((p) => {
            const isActive = preset === p.value
            return (
              <button
                key={p.value}
                onClick={() => handlePresetClick(p)}
                className="text-sm font-semibold transition-all duration-150 cursor-pointer select-none"
                style={{
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  backgroundColor: isActive ? 'rgba(168,214,42,0.12)' : '#1E2028',
                  border: `1px solid ${isActive ? 'rgba(168,214,42,0.4)' : '#2A2C38'}`,
                  color: isActive ? '#A8D62A' : '#8C9099',
                }}
              >
                {p.label}
              </button>
            )
          })}

          <span style={{ color: '#2A2C38', fontSize: '18px', lineHeight: 1 }}>|</span>

          <div className="flex items-center gap-2">
            <div style={{ position: 'relative' }}>
              <TimeInput
                value={customRange.start}
                active={isCustom}
                error={isCustom && !!error}
                onChange={(v) => handleTimeChange('start', v)}
                suffix={startSuffix}
              />
              {isCustom && error?.field === 'start' && !tipDismissed && (
                <ErrorTip message={error.message} onClose={() => setTipDismissed(true)} />
              )}
            </div>
            <span style={{ color: '#555A66' }}>↔</span>
            <div style={{ position: 'relative' }}>
              <TimeInput
                value={customRange.end}
                active={isCustom}
                error={isCustom && !!error}
                onChange={(v) => handleTimeChange('end', v)}
                suffix={endSuffix}
              />
              {isCustom && error?.field === 'end' && !tipDismissed && (
                <ErrorTip message={error.message} onClose={() => setTipDismissed(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorTip({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        zIndex: 50,
        backgroundColor: '#1E2028',
        border: '1px solid rgba(229,57,53,0.4)',
        borderRadius: '8px',
        padding: '7px 10px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '1px' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span style={{ fontSize: '11px', color: '#E57373', lineHeight: '1.4' }}>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{ marginLeft: '6px', flexShrink: 0, color: '#555A66', lineHeight: 0, cursor: 'pointer', alignSelf: 'center' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#8C9099')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#555A66')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
