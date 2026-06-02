# Spec — Seleção de Horário (modo Real time)

**Componente:** Campos de hora dentro do FilterBar, aba Real time
**Público:** PM, Design, Eng

---

## 1. O que é esse componente

Quando o usuário está no modo **Real time**, ele precisa definir o intervalo de tempo que quer visualizar. Ele pode fazer isso de dois jeitos:

1. **Escolhendo um preset** — clica em um botão de atalho (1h, 4h, 8h, 12h ou Hoje)
2. **Digitando manualmente** — informa o horário de início e fim nos campos de texto

---

## 2. Presets (atalhos de tempo)

Cinco botões que calculam o intervalo automaticamente a partir do momento do clique:

| Botão | O que representa |
|-------|-----------------|
| 1h    | Da última 1 hora até agora |
| 4h    | Das últimas 4 horas até agora |
| 8h    | Das últimas 8 horas até agora |
| 12h   | Das últimas 12 horas até agora |
| Hoje  | Da meia-noite de hoje até agora |

**Comportamento:**
- Clicar num preset atualiza os campos de hora automaticamente
- O preset selecionado fica destacado em verde
- O padrão ao abrir é sempre **1h**
- Ao clicar num preset, os campos mostram os horários calculados — mas o filtro só é aplicado quando o usuário clicar em **Aplicar**

---

## 3. Campos de hora manuais

### Como digitar
- Formato: `HH:MM` — hora no formato 24h (ex: `22:30`, `01:15`)
- Só aceita números — os dois pontos são inseridos automaticamente
- Se o usuário sair do campo com um horário incompleto, o campo volta para o último valor válido
- Também há um ícone de relógio que abre o seletor de hora nativo do sistema operacional

### Badge de dia (ontem / hoje)

Ao lado de cada campo aparece um badge pequeno indicando a qual dia aquele horário pertence. Isso existe porque o Real time pode exibir dados de até 24 horas atrás — então um horário como `23:00` pode ser de hoje ou de ontem dependendo do contexto.

**Regras de quando cada campo mostra "ontem":**

| Situação | Badge início | Badge fim |
|----------|-------------|-----------|
| Ambos os horários estão no passado, no mesmo dia (ex: 22:30 → 23:40, agora são 01:00) | ontem | ontem |
| Intervalo cruza a meia-noite e o fim já passou (ex: 23:00 → 00:30, agora são 01:00) | ontem | hoje |
| Intervalo só no período de hoje (ex: 08:00 → 10:30) | hoje | hoje |

> **Exemplo prático:** São 01:00 da manhã e o usuário quer ver dados entre 22:30 e 23:40. Esses dois horários são de ontem — o componente reconhece isso automaticamente e mostra o badge "ontem" nos dois campos, sem o usuário precisar fazer nada.

---

## 4. Validações (só ao digitar manualmente)

Quando o usuário usa os presets, não há validação — os horários são sempre válidos. As regras abaixo só se aplicam quando o usuário digita os horários à mão.

### Regra 1 — Fim no futuro em intervalo que cruza meia-noite

**Quando acontece:** o usuário quer consultar um intervalo que cruza a meia-noite (início maior que fim, ex: 23:13 → 01:55), mas o horário de fim ainda não chegou hoje.

**Exemplo:** são 01:30, o usuário digitou 23:13 → 01:55. O horário 01:55 ainda não chegou.

**O que acontece:** aparece um aviso abaixo do campo de fim informando o horário atual e pedindo para corrigir.

**Mensagem:** *"O horário final não pode ser maior que o horário atual (01:30). Real time exibe dados até agora."*

---

### Regra 2 — Intervalo invertido (início depois do fim no mesmo dia)

**Quando acontece:** o usuário digitou dois horários do mesmo dia, mas o início é depois do fim — o que não faz sentido.

**Exemplo:** início 23:00, fim 21:00 (ambos interpretados como ontem, mas 23:00 é depois de 21:00).

**O que acontece:** aparece um aviso abaixo do campo de início.

**Mensagem:** *"Intervalo inválido: o horário inicial não pode ser posterior ao final."*

---

### Regra 3 — Início igual ao fim

**Quando acontece:** os dois campos têm exatamente o mesmo horário.

**Mensagem:** *"O horário inicial e final não podem ser iguais."*

---

### Ordem de verificação

As regras são verificadas nesta ordem: **1 → 2 → 3**. Só uma mensagem de erro aparece por vez.

---

## 5. Como o aviso de erro aparece

- Surge imediatamente abaixo do campo com problema
- O usuário pode fechar clicando no **X** do aviso
- Se o usuário alterar qualquer campo depois de fechar, o aviso pode reaparecer

---

## 6. Botão Aplicar

O botão **Aplicar** só fica ativo quando:
- Está usando um preset (sempre válido), **ou**
- Está com horários digitados manualmente e **sem nenhum erro**

Enquanto há erro nos campos manuais, o botão fica desabilitado — o usuário não consegue aplicar o filtro até corrigir.

---

## 7. Resumo visual dos estados dos campos

| Estado | Aparência da borda |
|--------|-------------------|
| Normal (preset ativo) | Cinza sutil |
| Campo em edição ou modo manual ativo | Verde sutil |
| Com erro | Vermelho |

---

## 8. O que fica fora do escopo atual

- Não há validação de intervalo mínimo — qualquer intervalo válido é aceito, mesmo que seja de 1 minuto
- O modo Real time exibe no máximo **24 horas** de dados — para períodos maiores, o usuário deve usar o modo **Histórico**
