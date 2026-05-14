import type { DateTimeRange } from './types'
import { DateInput, TimeInput } from './inputs'

interface HistoricalFieldsProps {
  value: DateTimeRange
  onChange: (range: DateTimeRange) => void
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-wide" style={{ color: '#8C9099' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function HistoricalFields({ value, onChange }: HistoricalFieldsProps) {
  const yesterday = yesterdayStr()

  return (
    <div className="flex items-end gap-3">
      <FieldGroup label="De">
        <DateInput
          value={value.startDate}
          max={value.endDate || yesterday}
          onChange={(v) => onChange({ ...value, startDate: v })}
        />
        <TimeInput
          value={value.startTime}
          onChange={(v) => onChange({ ...value, startTime: v })}
        />
      </FieldGroup>

      <span className="pb-2.5 text-lg" style={{ color: '#2A2C38' }}>↔</span>

      <FieldGroup label="Até">
        <DateInput
          value={value.endDate}
          min={value.startDate}
          max={yesterday}
          onChange={(v) => onChange({ ...value, endDate: v })}
        />
        <TimeInput
          value={value.endTime}
          onChange={(v) => onChange({ ...value, endTime: v })}
        />
      </FieldGroup>
    </div>
  )
}
