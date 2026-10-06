# SKR Design System — Documentação de design

> **Índice e mapa de fontes.** Reúne aqui toda a documentação de design system SKR
> necessária para construir componentes neste projeto (e exportá-los para outros).
> Atualizado em 2026-10-06 a partir da fonte canônica upstream.

---

## 1. Mapa completo da documentação de design

### 1.1 Neste projeto (`skr-rel-reports`)

| Arquivo | Conteúdo |
| --- | --- |
| `docs/design/` (este diretório) | **Documentação de design completa** — fundamentos, tokens, primitivas, governança, adoção |
| `docs/DESIGN.md` | Design system **portado para CSS puro** deste app: tokens locais, componentes implementados, breakpoints, a11y |
| `public/styles.css` | Fonte executável do port (tokens em `public/styles.css:6-52`) |
| `docs/CARD-FLOW.md` | Fluxo/fonte de dados de cada card e KPI |
| `docs/ARCHITECTURE.md` | Layout, responsividade e decisões de arquitetura |
| `AGENTS.md` § *Design System* | Convenções obrigatórias (light mode, `gauge-legend`, sem paletas novas) |

### 1.2 Fonte canônica upstream (`/Users/henrique/black-swan`) — **não é sincronizada automaticamente**

O `scripts/sync-gateway.sh` copia apenas `lib/` (gateway). A documentação de design
não é copiada por nenhum script — este diretório foi criado por adaptação manual.

| Arquivo upstream | Documento aqui |
| --- | --- |
| `ui/src/docs/Introducao.mdx` | [`INTRODUCAO.md`](INTRODUCAO.md) |
| `ui/src/docs/Fundamentos.mdx` | [`FUNDAMENTOS.md`](FUNDAMENTOS.md) |
| `ui/src/docs/Colaboracao.mdx` | [`COLABORACAO.md`](COLABORACAO.md) |
| `ui/src/docs/AdocaoTecnica.mdx` | [`ADOCAO-TECNICA.md`](ADOCAO-TECNICA.md) |
| `ui/src/docs/foundations/DesignTokens.mdx` | [`TOKENS.md`](TOKENS.md) |
| `ui/src/docs/foundations/Color.mdx` | [`CORES.md`](CORES.md) |
| `ui/src/docs/foundations/Typography.mdx` | [`TIPOGRAFIA.md`](TIPOGRAFIA.md) |
| `ui/src/docs/foundations/ShapeRadius.mdx` | [`FORMAS.md`](FORMAS.md) |
| `ui/src/docs/foundations/Elevation.mdx` | [`ELEVACAO.md`](ELEVACAO.md) |
| `ui/src/docs/foundations/Motion.mdx` | [`MOVIMENTO.md`](MOVIMENTO.md) |
| `docs/DESIGN_SYSTEM.md` + `ui/src/variants.ts` + `ui/src/components/primitives.tsx` | [`PRIMITIVAS.md`](PRIMITIVAS.md) |
| `ui/src/themes/skr.css` | Tokens executáveis (ver §3 abaixo) |
| `ui/src/components/*.stories.tsx` | Referência visual das primitivas (só no upstream, via Storybook) |

**Leia nesta ordem**: [`INTRODUCAO.md`](INTRODUCAO.md) → [`FUNDAMENTOS.md`](FUNDAMENTOS.md) →
[`TOKENS.md`](TOKENS.md) → as foundations (`CORES`/`TIPOGRAFIA`/`FORMAS`/`ELEVACAO`/`MOVIMENTO`) →
[`PRIMITIVAS.md`](PRIMITIVAS.md) → [`ADOCAO-TECNICA.md`](ADOCAO-TECNICA.md).

---

## 2. Adaptação MDX → Markdown

Os arquivos upstream são MDX de Storybook (dependem de `imports`, JSX, `Pill`,
`foundations.css` e links `?path=/docs/...`). Aqui foram convertidos para Markdown
puro, com:

- hero/tags JSX removidos; o conteúdo textual foi preservado integralmente;
- swatches JSX viraram tabelas com os hexadecimais literais;
- links de Storybook removidos (o Storybook só existe no upstream);
- exemplos de código mantidos.

Em caso de divergência, **o código upstream é a verdade** — ver §4.

---

## 3. Tokens executáveis: onde olhar

| Contexto | Arquivo | Estilo de token |
| --- | --- | --- |
| Upstream (`@skwizlab/ui`, Tailwind 4) | `black-swan/ui/src/themes/skr.css` | `--color-brand-primary` (prefixo `color-`) |
| **Port neste projeto** (CSS puro) | `public/styles.css:6-52` | `--brand-primary` (sem prefixo `color-`) |

**Mapeamento de nomes port ↔ upstream:**

| Upstream (`skr.css`) | Port local (`styles.css`) |
| --- | --- |
| `--color-brand-primary` | `--brand-primary` |
| `--color-surface-canvas` / `-card` / `-elevated` | `--surface-canvas` / `--surface-card` / `--surface-elevated` |
| `--color-text-primary` / `-secondary` / `-muted` | `--text-primary` / `--text-secondary` / `--text-muted` |
| `--color-border-subtle`, `--color-feedback-danger` | `--border-subtle`, `--feedback-danger` |
| `--color-skr-*` (aliases) | `--skr-*` |
| `--color-brand-blue-500`, `--color-neutral-50` | `--brand-blue-500`, `--neutral-50` |
| `--font-sans`, `--font-display` | `--font` (uma única pilha) |
| `--radius-*`, `--shadow-card`, `--ease-standard`, `--duration-*` | **idênticos** (sem prefixo `color-`) |

**Divergências conhecidas port vs upstream** (upstream tem, o port local não tem —
não usar no CSS deste projeto):

- `--color-primary`, `--color-secondary`, `--color-accent`
- `--radius-pill` (alias de `--radius-full`)
- `--font-sans` / `--font-display` separados; bloco `:root` com `--background`,
  `--foreground`, `--card`, `--border`, `--primary` (helpers Tailwind/shadcn)

---

## 4. Verdade de código (fontes upstream)

| Assunto | Fonte executável |
| --- | --- |
| Tokens | `black-swan/ui/src/themes/skr.css` |
| Variantes (cva) | `black-swan/ui/src/variants.ts` |
| Contrato React (props, `data-slot`, `asChild`) | `black-swan/ui/src/components/primitives.tsx` |
| Visual das variantes | `black-swan/ui/src/components.css` |
| Efeitos (grid/glass/ambient) | `black-swan/ui/src/effects.css` |

> ⚠️ **`black-swan/docs/DESIGN_SYSTEM.md` está desatualizado** em um ponto: cita a
> variante de card `editorial`, que **não existe** em `variants.ts` (cards têm
> `standard`, `hero`, `glass` + flag `hoverable`). Em caso de conflito, vale o código.

---

## 5. Regras deste projeto que não mudam

Extraídas de `AGENTS.md` (mantêm-se mesmo ao construir componentes novos):

- **Light mode apenas**; Montserrat; brand blue `#0071e3`.
- Nenhuma paleta nova, nenhum dark theme.
- Legenda de gráfico sempre no padrão `gauge-legend` (nunca a nativa do Chart.js).
- Respeitar `prefers-reduced-motion`.
- Componente novo/alterado = atualizar `docs/DESIGN.md` e `docs/ARCHITECTURE.md`
  na mesma implementação (`docs/DOCUMENTATION.md`).

---

_Mantido pela equipe de Tecnologia SKR._
