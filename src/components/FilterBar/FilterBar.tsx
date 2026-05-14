import { useState, type ReactNode } from 'react'
import type { FilterBarValue, FilterMode, RealtimePreset, TimeRange, DateTimeRange } from './types'
import { ModeToggle } from './ModeToggle'
import { RealtimeFields } from './RealtimeFields'
import { HistoricalFields } from './HistoricalFields'
import { RealtimeBanner } from './RealtimeBanner'

interface FilterBarProps {
  extraFilters?: ReactNode
  onFilter?: (value: FilterBarValue) => void
  /** Contagem de filtros extras aplicados — controlada pela tela pai */
  extraFilterCount?: number
  /** Exibe o divider vertical entre pickers e filtros extras (default: true) */
  showExtraDivider?: boolean
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function hhmm(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function defaultCustomRange(): TimeRange {
  const now = new Date()
  return { start: hhmm(new Date(now.getTime() - 2 * 60 * 60 * 1000)), end: hhmm(now) }
}

function defaultHistoricalRange(): DateTimeRange {
  return { startDate: todayStr(), startTime: '00:00', endDate: todayStr(), endTime: '23:59' }
}

export function FilterBar({ extraFilters, onFilter, extraFilterCount = 0, showExtraDivider = true }: FilterBarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mode, setMode] = useState<FilterMode>('realtime')
  const [realtimePreset, setRealtimePreset] = useState<RealtimePreset>('30m')
  const [customRange, setCustomRange] = useState<TimeRange>(defaultCustomRange)
  const [historicalRange, setHistoricalRange] = useState<DateTimeRange>(defaultHistoricalRange)
  const [appliedCount, setAppliedCount] = useState(1)
  const [realtimeValid, setRealtimeValid] = useState(true)

  const canApply = mode !== 'realtime' || realtimeValid

  function calcCount(
    m: FilterMode,
    preset: RealtimePreset,
    extra: number,
  ) {
    let count = 1 + extra // intervalo de data/hora sempre ativo
    if (m === 'historical') count += 1
    if (m === 'realtime' && preset !== '30m') count += 1
    return count
  }

  function handleApply() {
    const value: FilterBarValue = {
      mode,
      ...(mode === 'realtime'
        ? { realtimePreset, realtimeCustomRange: customRange }
        : { historicalRange }),
    }
    setAppliedCount(calcCount(mode, realtimePreset, extraFilterCount))
    onFilter?.(value)
  }

  function handleClear() {
    setMode('realtime')
    setRealtimePreset('2h')
    setCustomRange(defaultCustomRange())
    setHistoricalRange(defaultHistoricalRange())
    setAppliedCount(0)
    onFilter?.({ mode: 'realtime', realtimePreset: '30m', realtimeCustomRange: defaultCustomRange() })
  }

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{ border: '1px solid #2A2C38' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: '#1E2028', borderBottom: collapsed ? 'none' : '1px solid #2A2C38' }}
      >
        {/* Left — título + badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: '#F2F2F2' }}>
            Filtros e Visualizações
          </span>
          {appliedCount > 0 && (
            <span
              className="flex items-center justify-center text-xs font-bold rounded-full"
              style={{
                backgroundColor: '#F5B92B',
                color: '#16171D',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
              }}
            >
              {appliedCount}
            </span>
          )}
        </div>

        {/* Right — ações + collapse */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="text-sm font-medium transition-colors duration-150 cursor-pointer select-none px-2 py-1 rounded"
            style={{ color: '#3B8AA0' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#5AADC4')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#3B8AA0')}
          >
            Limpar filtros
          </button>

          <button
            onClick={canApply ? handleApply : undefined}
            disabled={!canApply}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 select-none active:scale-95"
            style={{
              backgroundColor: canApply ? '#A8D62A' : '#2A2C38',
              color: canApply ? '#16171D' : '#555A66',
              cursor: canApply ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => { if (canApply) e.currentTarget.style.backgroundColor = '#96C124' }}
            onMouseLeave={(e) => { if (canApply) e.currentTarget.style.backgroundColor = '#A8D62A' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04a1 1 0 0 0-.79 1.61z" />
            </svg>
            Aplicar
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer select-none"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #2A2C38',
              color: '#8C9099',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2A2C38')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            aria-label={collapsed ? 'Expandir filtros' : 'Recolher filtros'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{
                transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Corpo colapsável */}
      {!collapsed && (
        <div className="flex flex-col gap-3 px-4 py-3" style={{ backgroundColor: '#1A1C24' }}>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-6">
            <ModeToggle value={mode} onChange={setMode} />
            <div className="self-stretch w-px my-0.5" style={{ backgroundColor: '#2A2C38' }} />

            {mode === 'realtime' ? (
              <RealtimeFields
                preset={realtimePreset}
                customRange={customRange}
                onPresetChange={setRealtimePreset}
                onCustomRangeChange={setCustomRange}
                onValidationChange={setRealtimeValid}
              />
            ) : (
              <HistoricalFields value={historicalRange} onChange={setHistoricalRange} />
            )}

            {extraFilters && (
              <>
                {showExtraDivider && (
                  <div className="self-stretch w-px my-0.5" style={{ backgroundColor: '#2A2C38' }} />
                )}
                <div className="flex flex-wrap items-end gap-x-3 gap-y-6">{extraFilters}</div>
              </>
            )}
          </div>

          {mode === 'realtime' && <RealtimeBanner />}
        </div>
      )}
    </div>
  )
}
