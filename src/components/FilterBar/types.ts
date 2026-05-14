export type FilterMode = 'realtime' | 'historical'

export type RealtimePreset = '30m' | '1h' | '2h' | '4h' | 'hoje' | 'custom'

export interface TimeRange {
  start: string // HH:mm
  end: string   // HH:mm
}

export interface DateTimeRange {
  startDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endDate: string   // YYYY-MM-DD
  endTime: string   // HH:mm
}

export interface FilterBarValue {
  mode: FilterMode
  realtimePreset?: RealtimePreset
  realtimeCustomRange?: TimeRange
  historicalRange?: DateTimeRange
}
