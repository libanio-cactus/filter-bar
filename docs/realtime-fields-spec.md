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

Exibido em ambos os campos para indicar o dia de referência. A lógica usa `getDateContext()`:

**Campo fim:**

| Condição | Sufixo |
|----------|--------|
| `endMins > currentMins` (fim no futuro) | `ontem` |
| `endMins ≤ currentMins` | `hoje` |

**Campo início:**

| Condição | Sufixo |
|----------|--------|
| `endIsYesterday === true` | `ontem` (forçado — mesmo dia que o fim) |
| `startMins > endMins` (cruza meia-noite) | `ontem` |
| demais casos | `hoje` |

**Regra central:** quando o fim cai no futuro, o componente o interpreta automaticamente como ontem — sem erro. O início é forçado para ontem junto, garantindo que os dois fiquem no mesmo dia.

---

## 4. Validações (somente no modo Custom)

As validações só são executadas quando o preset é `'custom'`. No modo preset, não há validação.

### Regra 1 — Intervalo invertido no mesmo dia (ontem)
```
endIsYesterday === true && startMins > endMins → erro no campo "início"
```
Ocorre quando o fim está no futuro (interpretado como ontem) **e** o início, em minutos, é posterior ao fim — criando um intervalo onde o início viria depois do fim no mesmo dia.

Mensagem: *"Intervalo inválido: o horário inicial não pode ser posterior ao final."*

### Regra 2 — Início igual ao fim
```
startMins === endMins → erro no campo "início"
```
Mensagem: *"O horário inicial e final não podem ser iguais."*

### Prioridade
A Regra 1 é verificada primeiro. Se o fim já está no futuro, a Regra 2 não é avaliada.

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

- **Sem cruzamento de meia-noite validado no preset:** ao clicar em "4h" às 02:00, o `start` pode ser negativo em minutos (`-120`). A lógica de cálculo usa `Date` e o resultado é horário correto, mas a validação de "ontem/hoje" do sufixo é baseada em comparação simples de minutos, o que funciona corretamente para esse caso.
- **Fim sempre "hoje":** o sufixo do campo de fim é fixo `'hoje'`. Se no futuro houver suporte a intervalos que cruzam datas, isso precisará ser revisado.
- **Sem limite mínimo no início:** não há validação de intervalo mínimo (ex: impedir `start === end - 1 min`). Qualquer intervalo positivo é válido.
