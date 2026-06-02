# Spec — Seleção de Horário Real Time

Componente: `RealtimeFields` + `TimeInput`
Contexto: FilterBar, modo Real time

---

## 1. Presets de intervalo

Cinco opções fixas, exibidas como pills:

| Label | Valor interno | Intervalo calculado |
|-------|--------------|---------------------|
| 1h    | `'1h'`       | Agora − 60 min → Agora |
| 4h    | `'4h'`       | Agora − 240 min → Agora |
| 8h    | `'8h'`       | Agora − 480 min → Agora |
| 12h   | `'12h'`      | Agora − 720 min → Agora |
| Hoje  | `'hoje'`     | 00:00 → Agora |

**Comportamento ao clicar num preset:**
- O preset fica ativo (estado visual verde)
- Os campos de hora são atualizados automaticamente com o intervalo calculado **no momento do clique** (usando `new Date()`)
- O estado interno muda de `'custom'` para o valor do preset selecionado

**Preset padrão:** `1h`

---

## 2. Modo Custom

Ativado automaticamente quando o usuário edita qualquer campo de hora manualmente.

- O estado interno passa para `'custom'` — nenhum preset fica ativo
- Os campos de hora passam a exibir o estado ativo (borda verde `rgba(168,214,42,0.45)`)
- As validações (seção 4) entram em vigor

---

## 3. Campos de hora (TimeInput)

### Formato
- **Exibição e valor:** `HH:MM` (24h, sem AM/PM)
- **Placeholder:** `HH:MM`
- **Máscara:** apenas dígitos; `:` inserido automaticamente após os 2 primeiros dígitos

### Entrada
- Texto livre com `inputMode="numeric"` — formata enquanto digita
- Ao perder o foco com valor incompleto: reverte para o último valor válido
- Botão de ícone (relógio) abre o picker nativo `<input type="time">` como alternativa

### Sufixo (badge ao lado do horário)

Exibido em ambos os campos via `getDateContext()`. A lógica distingue três cenários:

**Campo fim (`endSuffix`):**

| Condição | Sufixo |
|----------|--------|
| `endMins > currentMins` E `startMins ≤ endMins` | `ontem` — mesmo dia, ambos no passado de ontem |
| demais casos | `hoje` |

**Campo início (`startSuffix`):**

| Condição | Sufixo |
|----------|--------|
| `endIsYesterday === true` | `ontem` — forçado junto com o fim (mesmo dia) |
| `startMins > endMins` (cross-midnight) | `ontem` — início de ontem, fim de hoje |
| demais casos | `hoje` |

**Cenários completos:**

| Situação (agora = 01:00) | Start | End | Sufixo início | Sufixo fim |
|---|---|---|---|---|
| Mesmo dia no passado | 22:30 | 23:40 | ontem | ontem |
| Cross-midnight concluído | 23:00 | 00:30 | ontem | hoje |
| Cross-midnight com fim futuro | 23:13 | 01:55 | ontem | hoje + erro |
| Intervalo só hoje | 08:00 | 10:30 | hoje | hoje |

---

## 4. Validações (somente no modo Custom)

As validações só são executadas quando o preset é `'custom'`. No modo preset, não há validação.

### Regra 1a — Cross-midnight com fim ainda no futuro
```
endInFuture === true && endIsYesterday === false → erro no campo "fim"
```
Ocorre quando `startMins > endMins` (intenção cross-midnight) mas o horário de fim ainda não chegou hoje.

Exemplo: agora `01:30`, entrada `23:13 → 01:55`. O fim (01:55) está no futuro, e como `start > end`, o componente não pode assumir "ambos ontem" — mantém o erro original.

Mensagem: *"O horário final não pode ser maior que o horário atual (HH:MM). Real time exibe dados até agora."*

O horário atual é inserido dinamicamente na mensagem.

### Regra 1b — Intervalo invertido no mesmo dia (ambos ontem)
```
endIsYesterday === true && startMins > endMins → erro no campo "início"
```
Ocorre quando `startMins ≤ endMins` seria esperado para "ambos ontem", mas o início é posterior ao fim — intervalo sem sentido no mesmo dia.

Mensagem: *"Intervalo inválido: o horário inicial não pode ser posterior ao final."*

### Regra 2 — Início igual ao fim
```
startMins === endMins → erro no campo "início"
```
Mensagem: *"O horário inicial e final não podem ser iguais."*

### Prioridade
Regra 1a é verificada primeiro. Se o fim está no futuro em cenário cross-midnight, o erro é emitido antes de qualquer outra checagem. Regra 1b só é avaliada se `endIsYesterday === true`. Regra 2 só é avaliada se nenhuma Regra 1 disparou.

---

## 5. Exibição do erro (ErrorTip)

Tooltip posicionada abaixo do campo com erro:

- Aparece: imediatamente após a validação falhar
- Desaparece: ao clicar no X da tooltip — o usuário descarta manualmente
- Reaparece: se o usuário alterar os campos novamente (estado `tipDismissed` é resetado a cada mudança de hora)
- Cor: borda vermelha `rgba(229,57,53,0.4)`, texto `#E57373`
- Apenas **um** erro é exibido por vez (campo de início ou de fim, nunca os dois)

---

## 6. Impacto no botão Aplicar

O botão Aplicar fica **desabilitado** (`canApply = false`) quando:
- `preset === 'custom'` **E** há erro de validação (`realtimeValid === false`)

O botão fica habilitado quando:
- Qualquer preset fixo está ativo (1h, 4h, 8h, 12h, hoje) — sem validação
- **OU** o preset é `'custom'` e não há erro de validação

---

## 7. Estados visuais dos campos de hora

| Estado | Borda |
|--------|-------|
| Repouso (preset ativo, sem foco) | `#2A2C38` |
| Custom ativo (sem foco no campo) | `rgba(168,214,42,0.45)` — verde sutil |
| Com foco no campo | `rgba(168,214,42,0.45)` — verde sutil |
| Com erro | `rgba(229,57,53,0.6)` — vermelho |

Transição: `border-color 0.15s`

---

## 8. O que é emitido no `onFilter`

Quando o usuário clica em Aplicar, o valor enviado é:

```ts
// Preset fixo ativo:
{
  mode: 'realtime',
  realtimePreset: '1h' | '4h' | '8h' | '12h' | 'hoje',
  realtimeCustomRange: { start: 'HH:MM', end: 'HH:MM' } // calculado no clique do preset
}

// Custom válido:
{
  mode: 'realtime',
  realtimePreset: 'custom',
  realtimeCustomRange: { start: 'HH:MM', end: 'HH:MM' }
}
```

---

## 9. Limitações conhecidas

- **Sem cruzamento de meia-noite validado no preset:** ao clicar em "4h" às 02:00, o `start` calculado pode resultar em horário de ontem. A lógica usa `Date` e o resultado é correto, mas `getDateContext` não é chamado no modo preset — os sufixos de preset são calculados diretamente por `startMins > endMins`, o que funciona para esse caso.
- **Sem limite mínimo no intervalo:** não há validação de intervalo mínimo. Qualquer intervalo positivo (início ≠ fim, sem erro de regra) é válido.
