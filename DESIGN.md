# SKR Reports — Design System

Este documento documenta o design system **portado para CSS puro** do SKR Reports,
baseado no `@skwizlab/ui` do Skill.

> **Documentação completa de design**: as foundations, tokens, primitivas React,
> governança e adoção técnica estão em [`docs/design/`](design/README.md) (adaptadas
> da fonte canônica upstream `black-swan/ui/src/docs/`). Este arquivo documenta o
> **port local** — o que existe em `public/styles.css`.

## Visão Geral

- **Modo**: Light mode apenas
- **Fonte**: Montserrat (Google Fonts)
- **Cor principal**: `#0071e3` (Brand Blue)
- **Border radius**: 20px (cards), 12px (controles), 9999px (pill)
- **Estilo**: Clean, minimalista, com sombras sutis e blur effects

### Onde está a documentação de design

| Preciso de… | Arquivo |
| --- | --- |
| Tokens/componentes **deste app** (port CSS puro) | `docs/DESIGN.md` (este arquivo) |
| Foundations (cor, tipografia, forma, elevação, motion) | [`docs/design/`](design/README.md) |
| Tokens semânticos e escada de camadas | [`docs/design/TOKENS.md`](design/TOKENS.md) |
| Primitivas React (`@skwizlab/ui`) e variantes | [`docs/design/PRIMITIVAS.md`](design/PRIMITIVAS.md) |
| Fluxo de cada card/KPI (fonte de dados) | `docs/CARD-FLOW.md` |
| Convenções obrigatórias para agentes | `AGENTS.md` § Design System |

## Tokens de Cores

### Primitivas
```css
--brand-blue-500: #0071e3;
--brand-blue-700: #0057ad;
--neutral-0: #ffffff;
--neutral-50: #fbfbfd;
--neutral-300: #e8e8ed;
--neutral-500: #86868b;
--neutral-950: #1d1d1f;
```

### Semânticas
```css
--brand-primary: var(--brand-blue-500);
--brand-contrast: var(--brand-blue-700);
--surface-canvas: var(--neutral-0);
--surface-card: var(--neutral-50);
--surface-elevated: var(--neutral-0);
--text-primary: var(--neutral-950);
--text-secondary: var(--neutral-500);
--text-muted: #6e6e73;
--border-subtle: var(--neutral-300);
--feedback-danger: #c64545;
```

### Aliases de compatibilidade (`skr-*`)

```css
--skr-blue: var(--brand-primary);
--skr-black: var(--text-primary);
--skr-white: var(--surface-card);
--skr-gray-light: var(--surface-canvas);
--skr-gray: var(--text-secondary);
--skr-gray-dark: var(--text-primary);
--skr-gray-muted: var(--border-subtle);
```

Mantenidos por compatibilidade com o upstream (`themes/skr.css`). **Código novo usa os
papéis semânticos**, nunca os aliases.

### Tokens de forma, profundidade e movimento

```css
--radius-control: 12px;   /* campos, botões, controles compactos */
--radius-card: 20px;       /* cards e superfícies */
--radius-full: 9999px;     /* pills e círculos */
--shadow-card:             /* única sombra pública (3 camadas) */
  0 0 0 0.5px rgba(0, 0, 0, 0.02),
  0 2px 4px rgba(0, 0, 0, 0.02),
  0 4px 12px rgba(0, 0, 0, 0.03);
--ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
--duration-fast: 200ms;      /* hover, feedback direto */
--duration-standard: 350ms;  /* transições com deslocamento */
--font: "Montserrat", -apple-system, BlinkMacSystemFont, "SF Pro Text",
  "Helvetica Neue", sans-serif;
```

Definição completa: `public/styles.css:6-52`. Diretrizes de uso:
[`docs/design/FORMAS.md`](design/FORMAS.md), [`docs/design/ELEVACAO.md`](design/ELEVACAO.md),
[`docs/design/MOVIMENTO.md`](design/MOVIMENTO.md).

### Divergências port local vs upstream (`ui/src/themes/skr.css`)

| Existe no upstream, **não** neste projeto | Observação |
| --- | --- |
| `--color-primary`, `--color-secondary`, `--color-accent` | aliases legados; não portados |
| `--radius-pill` | alias de `--radius-full`; não portado |
| `--font-sans` / `--font-display` separados | aqui unificados em `--font` |
| bloco `:root` com `--background`, `--foreground`, `--card`, `--border`, `--primary` | helpers Tailwind/shadcn do upstream |

O port **remove o prefixo `color-`** dos tokens de cor
(`--color-brand-primary` upstream → `--brand-primary` aqui). Tabela completa de
mapeamento: [`docs/design/TOKENS.md`](design/TOKENS.md).

## Tipografia

- **Títulos**: `letter-spacing: -0.03em`, `font-weight: 700`
- **Page title**: 34px
- **Section title**: 24px
- **Labels de card**: 12px, uppercase, `letter-spacing: 0.08em`
- **Body**: 14px, `letter-spacing: -0.022em`

## Componentes

### Card
```css
border-radius: 20px;
background: #fff;
border: 0.5px solid rgba(0, 0, 0, 0.04);
box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.03);
```

### Botões
- **Primário**: Fundo `--brand-primary`, texto branco, sombra azul sutil
- **Secundário**: Fundo `rgba(255, 255, 255, 0.6)`, backdrop blur, borda sutil
- **Border radius**: `9999px` (pill)

### Controles (Input/Select)
```css
border-radius: 12px;
background: rgba(0, 0, 0, 0.03);
border: 1px solid transparent;
```
- **Focus**: Borda azul `rgba(0, 113, 227, 0.4)` + ring `rgba(0, 113, 227, 0.1)`

### Badge
- Base `.badge`: pill curto com `padding: 5px 12px`, `border-radius: 6px`,
  `font-size: 11px`, `font-weight: 700`, uppercase, `letter-spacing: 0.03em`,
  fundo `rgba(0,0,0,0.04)` e texto `--text-secondary`
- Variantes `.badge.mock` e `.badge.real`: texto `--brand-contrast` sobre
  `rgba(0, 113, 227, 0.1)` — usadas no topbar para sinalizar ambiente
- `public/styles.css:246-267`

### Tabelas
- Wrapper `.table-wrap`: `overflow-x: auto` + `overscroll-behavior-x: contain`
  (sem scroll horizontal fantasma na página)
- `thead th`: 12px, 700, uppercase, `letter-spacing: 0.05em`, `--text-secondary`,
  borda inferior `0.5px rgba(0,0,0,0.08)`, `white-space: nowrap`
- `tbody td`: 14px, padding `12px 14px`, borda `0.5px rgba(0,0,0,0.04)`; última linha
  sem borda; hover `rgba(0, 113, 227, 0.04)`
- **Insets**: primeira/última coluna ganham `padding 24px` dentro de `.card` para o
  texto não ser cortado pelos cantos arredondados
- **Renderização lazy**: `tbody tr` usa `content-visibility: auto` com
  `contain-intrinsic-size: auto 46px` (mantém o paint barato em listas grandes)
- Colunas numéricas: `td.num`/`th.num` alinham à direita com `tabular-nums`
- `public/styles.css:808-868`

### Overlay de loading (export PDF)
- `#pdf-loading`: `position: fixed`, `inset: 0`, scrim `rgba(0,0,0,0.4)` +
  `backdrop-filter: blur(4px)`, `z-index: 400`
- `.pdf-loading-card`: card em `--surface-elevated`, raio `--radius-card`, sombra
  `--shadow-card`, texto 14px/700
- `.pdf-spinner`: 18px, borda `2.5px` azul translúcido com topo `--brand-primary`,
  rotação `0.7s linear infinite` (`@keyframes pdf-spin`)
- `public/styles.css:956-996`

### Footer
- `.footer`: texto 13px centralizado em `--text-secondary`, `margin-top: 24px`
- `public/styles.css:872-878`

### Header (Topbar)
- Fixo no topo, `backdrop-filter: blur(20px)`
- Fundo semi-transparente `rgba(255, 255, 255, 0.6)`
- Altura: 64px

### KPIs
- Grid: 3 colunas (desktop) → 2 (`≤768px`) → 1 (`≤480px`)
- KPI "Abertas" tem número em `--brand-primary` (classe `kpi-value--accent`)
- KPI "Abertas" abre **widget/popover** com a lista paginada de abertos

### Widget "Abertas" (popover)
- `position: fixed`, `left`/`top` calculados em JS e clampados à viewport
- `max-width: calc(100vw - 32px)`, `max-height: calc(100vh - 90px)`, scroll interno
- Abre no **hover** (desktop) ou **tap** (touch); fecha em `resize`/`scroll`/clique fora
- Tabela com 7 colunas (ID, Cliente, Assunto, Subassunto, Empreendimento, Unidade, Nº unidade)
- Paginação (100/pág) ocultada quando há só 1 página
- Chevron no card rotaciona 180° quando aberto
- `.kpi--has-popover` força `transform: none` (evita containing block que quebra o `fixed`)

### SLA Destaque
- Fonte `clamp(28px, 6vw, 48px)` — escala com a viewport sem media query extra
- Valor em `--brand-primary`, peso 800

### Gauge/Legenda
- Usar classe `gauge-legend` com `gauge-legend-dot` colorido
- Nunca usar legenda nativa do Chart.js

### Modo TV (Apresentação Automática)

Modo tela cheia para kiosk/apresentação, com avanço automático de páginas.
CSS: `public/styles.css:998-1502` · JS: `public/app.js` (`setupTvMode`,
`enterTvMode`, `goToTvPage`, `startTvTimer`) · Markup: `public/index.html:160-243`.

**Gatilho e modal**
- Botão `.tv-trigger` (`.btn.btn-secondary` + label `.tv-trigger-label`, oculto em `≤480px`)
  abre o modal `#tv-modal` (`aria-hidden` como estado)
- Modal `.tv-modal-card`: escolha de modo (`data-mode`: `realtime` | `filtrado`) e
  **intervalo** de troca (30/45/60/90s — `.tv-interval-btn` com
  `.tv-interval-btn--active`); fecha no X, no clique fora ou ao escolher
- Botões do modal: `.tv-modal-btn` com `--primary`/`--secondary`, ícone + label + descrição
- Z-index do modal acima de todo o conteúdo; scrim com blur

**Estrutura em tela cheia**
- `#tv-mode.tv-mode` — container fixo, `aria-hidden` espelhado, trava o scroll do `body`
- `.tv-fixed-header` — cabeçalho fixo com eyebrow/título da página atual
  (atualizados por `updateTvHeader`)
- `.tv-container` → `.tv-page[data-page]` (5 páginas: Visão Geral, Por Empreendimento,
  Desempenho por assunto, Financeiro & Relacionamento, Projetos/Documentos/Jurídico);
  só `.tv-page--active` é visível
- Grids próprios: `.tv-dep-grid-2` (2 col) e `.tv-dep-grid-3` (3 col → 2 em `≤1024px`
  → 1 em `≤768px`); `.tv-overview` reutiliza KPIs/chart com escalas maiores

**Navegação**
- `.tv-exit-zone` (topo) — sai do modo; também `Escape`
- `.tv-next-zone` (direita) — avança página (ciclo circular: última → primeira)
- `.tv-progress-track`/`.tv-progress-bar` — barra de progresso do intervalo, animada
  via `--tv-interval` (reset a cada troca)
- `.tv-exit-hint` — "Clique aqui para sair", aparece em `mousemove` e some após 2s
  (`.tv-hint-visible`)

**Animações do modo TV**
- Transição de página: fade `opacity` 400ms
- Reveal dos blocos: `.tv-block` → `.tv-card-visible` com stagger `100 + i×120ms`
  (só opacity, sem slide)
- Gráficos animam com `easeOutQuart` 700ms na primeira exibição da página
- Em modo `realtime`, há pre-fetch de dados antes de voltar à página 0

**Modo kiosk (URL)**
- `?tv=1&modo=realtime|filtrado&intervalo=30000|45000|60000|90000` entra direto no
  modo TV após o primeiro relatório carregar (`public/app.js:1793`)

**Responsive do modo TV**
- `≤1024px`: padding reduzido; `tv-dep-grid-3` → 2 colunas
- `≤768px`: KPIs 2 col, charts 220-300px, grids → 1 coluna
- `≤480px`: KPIs 1 col; label do trigger oculto

## Layout

### Grid Background
```css
background-image: 
  linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
background-size: 40px 40px;
```

### Ambient Backdrop
- Blobs animados (cyan, amber, accent) com blur 85-95px
- Animações suaves (25-35s)
- Respeitar `prefers-reduced-motion`

### Breakpoints
- `≤900px`: `dep-grid` vira 1 coluna
- `≤768px`: KPIs 2 colunas; `page-title` 28px
- `≤600px`: filtros em coluna; `content` padding 16px
- `≤480px`: KPIs 1 coluna; `page-title` 24px; botão export compacto

## Animações

- **Transições**: `cubic-bezier(0.25, 0.1, 0.25, 1)`
- **Duração fast**: 200ms
- **Duração standard**: 350ms
- **Card reveal**: `opacity 0→1` + `translateY(16px)→0` via classe `is-visible`
  (IntersectionObserver)
- **Popover**: fade `opacity` + `translateY(8px)→0` (200ms)
- **Modo TV**: fade de página 400ms; reveal de blocos com stagger `100 + i×120ms`;
  charts `easeOutQuart` 700ms (ver § Modo TV)
- **Ambient blobs**: loops de 25–35s — são efeito local, **não** uma escala de
  motion tokens (ver [`docs/design/MOVIMENTO.md`](design/MOVIMENTO.md) § O que não é token)

## Acessibilidade

- Skip link para navegação por teclado
- `focus-visible` com outline azul
- `prefers-reduced-motion`: zera `animation-duration`/`transition-duration` em `0.01ms`
  e desliga os ambient blobs (`public/styles.css:1506-1517`)
- Contraste adequado nos textos
- Responsivo em todas as larguras (sem overflow horizontal); widget de abertas
  acessível por touch (tap) além de hover
- Modo TV: exit/next zones são `<button>` com `aria-label`; `#tv-mode` usa
  `aria-hidden` espelhado no estado

## Guia de documentação

- Todo componente novo/alterado deve ser refletido aqui e em `docs/ARCHITECTURE.md`
- Fundations, tokens, primitivas React e governança: [`docs/design/`](design/README.md)
- Ver `docs/DOCUMENTATION.md` — a importância de documentar e o padrão do projeto
- Convenções obrigatórias para agentes: `AGENTS.md` § Design System

## Exemplo de Uso

```html
<div class="card">
  <div class="card-title">TÍTULO DO CARD</div>
  <div class="card-sub">Descrição do card</div>
  <!-- Conteúdo -->
</div>

<button class="btn btn-primary">Ação Primária</button>
<button class="btn btn-secondary">Ação Secundária</button>

<div class="field">
  <label>Campo</label>
  <input type="text" />
</div>
```