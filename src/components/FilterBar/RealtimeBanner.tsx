export function RealtimeBanner() {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg"
      style={{
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      }}
      role="alert"
    >
      <svg
        className="flex-shrink-0 mt-0.5"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      <p className="text-sm" style={{ color: '#A89070' }}>
        <span style={{ color: '#F59E0B', fontWeight: 600 }}>Real time ativo: </span>
        você pode exibir dados das <span style={{ color: '#F2F2F2', fontWeight: 600 }}>últimas 24 horas</span>. Para consultas em datas anteriores, utilize o modo{' '}
        <span style={{ color: '#F2F2F2', fontWeight: 600 }}>Histórico</span>.
      </p>
    </div>
  )
}
