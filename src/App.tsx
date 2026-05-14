import { useState } from 'react'
import { FilterBar, SelectField, type FilterBarValue } from './components/FilterBar'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#555A66' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function countSelected(...values: string[]) {
  return values.filter(Boolean).length
}

export default function App() {
  const [lastResult, setLastResult] = useState<FilterBarValue | null>(null)

  // Exemplo 2
  const [operador, setOperador] = useState('')
  const [status, setStatus] = useState('')

  // Exemplo 3
  const [pais, setPais] = useState('')
  const [moeda, setMoeda] = useState('')
  const [metodo, setMetodo] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState('')
  const [kyc, setKyc] = useState('')
  const [plataforma, setPlataforma] = useState('')
  const [origem, setOrigem] = useState('')
  const [tagVip, setTagVip] = useState('')

  return (
    <div className="min-h-screen p-8 flex flex-col gap-12" style={{ backgroundColor: '#16171D' }}>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold" style={{ color: '#F2F2F2' }}>
          FilterBar — Protótipo
        </h1>
        <p className="text-sm" style={{ color: '#555A66' }}>
          Componente padronizado de filtro para o Backoffice 1.5
        </p>
      </div>

      <Section title="Exemplo 1 — Sem filtros extras">
        <FilterBar onFilter={setLastResult} />
      </Section>

      <Section title="Exemplo 2 — Com filtros extras (ex: tela de Transações)">
        <FilterBar
          onFilter={setLastResult}
          extraFilterCount={countSelected(operador, status)}
          extraFilters={
            <>
              <SelectField
                label="Operador"
                options={['Operador A', 'Operador B', 'Operador C']}
                value={operador}
                onChange={setOperador}
              />
              <SelectField
                label="Status"
                options={['Aprovado', 'Pendente', 'Recusado', 'Estornado']}
                value={status}
                onChange={setStatus}
              />
            </>
          }
        />
      </Section>

      <Section title="Exemplo 3 — Com muitos filtros (quebra em múltiplas linhas)">
        <FilterBar
          onFilter={setLastResult}
          showExtraDivider={false}
          extraFilterCount={countSelected(pais, moeda, metodo, tipoUsuario, kyc, plataforma, origem, tagVip)}
          extraFilters={
            <>
              <SelectField
                label="País"
                options={['Brasil', 'Portugal', 'Espanha', 'México', 'Argentina', 'Chile']}
                value={pais}
                onChange={setPais}
              />
              <SelectField
                label="Moeda"
                options={['BRL', 'USD', 'EUR', 'MXN', 'ARS']}
                value={moeda}
                onChange={setMoeda}
              />
              <SelectField
                label="Método"
                options={['PIX', 'Boleto', 'Cartão', 'Crypto', 'Transferência']}
                value={metodo}
                onChange={setMetodo}
              />
              <SelectField
                label="Tipo de usuário"
                options={['Novo', 'Recorrente', 'VIP', 'Inativo']}
                value={tipoUsuario}
                onChange={setTipoUsuario}
              />
              <SelectField
                label="KYC"
                options={['Aprovado', 'Pendente', 'Recusado', 'Não enviado']}
                value={kyc}
                onChange={setKyc}
              />
              <SelectField
                label="Plataforma"
                options={['Web', 'iOS', 'Android', 'Mobile Web']}
                value={plataforma}
                onChange={setPlataforma}
              />
              <SelectField
                label="Origem"
                options={['Orgânico', 'Afiliado', 'Mídia paga', 'Indicação']}
                value={origem}
                onChange={setOrigem}
              />
              <SelectField
                label="Tag VIP"
                options={['Bronze', 'Prata', 'Ouro', 'Diamante']}
                value={tagVip}
                onChange={setTagVip}
              />
            </>
          }
        />
      </Section>

      {lastResult && (
        <Section title="Último filtro aplicado (output simulado)">
          <pre
            className="text-xs p-4 rounded-xl overflow-auto"
            style={{
              backgroundColor: '#1E2028',
              border: '1px solid #2A2C38',
              color: '#6DB33F',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </Section>
      )}
    </div>
  )
}
