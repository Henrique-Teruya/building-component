# Primitivas — contrato das componentes `@skwizlab/ui`

> Adaptado de `black-swan/docs/DESIGN_SYSTEM.md` + `ui/src/variants.ts` +
> `ui/src/components/primitives.tsx` + `ui/README.md`.
> **Em caso de conflito, o código é a verdade** (ver §6).

`@skwizlab/ui` é a fonte canônica para tokens visuais compartilhados, efeitos e
primitivas genéricas do Skill. O aplicativo continua responsável por framework,
autenticação, actions, hooks, tipos do CVCRM e componentes de domínio.

**Status**: workspace pnpm privado, versão `0.1.0`. Não há registry, token, Railway ou
publicação externa nesta etapa.

---

## 1. Lista de primitivas (17 exports)

`ui/src/index.ts` exporta 15 componentes + helpers de variantes + `cn`:

| Componente | Elemento | Props principais |
| --- | --- | --- |
| `Button` | `button` | `variant` (`primary` \| `secondary` \| `soft` \| `danger`), `iconStart`, `iconEnd`, `asChild` |
| `Card` | `div` | `variant` (`standard` \| `hero` \| `glass`), `hoverable`, `asChild` |
| `Input` | `input` | `asChild` |
| `Select` | `select` | `asChild` |
| `Textarea` | `textarea` | `asChild` |
| `Pill` | `span` | `active` (boolean) → `data-state="active\|inactive"`, `asChild` |
| `PageHeader` | `div` | `asChild` |
| `PageEyebrow` | `p` | `asChild` |
| `PageTitle` | `h1` | `maxLines?: number` (ellipsis/line-clamp), `asChild` |
| `IconTile` | `div` | `asChild` |
| `Badge` | `span` | `tone` (`neutral` \| `featured`), `asChild` |
| `ListItem` | `div` | `asChild` |
| `Divider` | `div` | `variant` (`compact` \| `gradient`), `role` (default `separator`), `asChild` |
| `TextLink` | `a` | `asChild` |
| `AmbientBackdrop` | `div` | sempre `aria-hidden`, renderiza 3 blobs + wash |

**Helpers exportados**: `buttonVariants`, `cardVariants`, `fieldControlVariants`,
`pillVariants`, `pageHeaderVariants`, `pageEyebrowVariants`, `pageTitleVariants`,
`iconTileVariants`, `badgeVariants`, `listItemVariants`, `dividerVariants`,
`textLinkVariants`, `cn` — para integrações que aceitam string de classe (ex. Clerk,
`IntlTelInput`).

---

## 2. Variantes públicas (fonte: `ui/src/variants.ts`)

| Componente | Variantes | Default |
| --- | --- | --- |
| Botão | `primary`, `secondary`, `soft`, `danger` | `primary` |
| Card | `standard`, `hero`, `glass` + flag `hoverable: true/false` | `standard`, `hoverable: false` |
| Pill | `active: true/false` | `false` |
| Badge | `tone: neutral`, `featured` | `neutral` |
| Divider | `compact`, `gradient` | `compact` |
| Campos (`Input`/`Select`/`Textarea`) | sem variantes — classe base `skwiz-ui-field-control` | — |

> ⚠️ **Correção de doc upstream**: `black-swan/docs/DESIGN_SYSTEM.md` (linhas 42 e 53)
> cita a variante de card `editorial`. **Ela não existe em `variants.ts`.** Vale o
> código: `standard`, `hero`, `glass`.

---

## 3. Contratos de composição

- **Atributos nativos e refs**: todas as primitivas usam `forwardRef` e repassam
  `ComponentPropsWithoutRef` — preservam semântica, formulário, acessibilidade e integrações.
- **`className`**: usado para layout e composição local; não replique internamente o
  estilo canônico.
- **`data-slot`**: marcador estável para composição e inspeção
  (`button`, `card`, `input`, `select`, `textarea`, `pill`, `page-header`,
  `page-eyebrow`, `page-title`, `icon-tile`, `badge`, `list-item`, `divider`,
  `text-link`, `ambient-backdrop`).
- **`asChild`** (Radix `Slot`/`Slottable`): aplica o contrato visual a outro elemento,
  como `next/link`, sem criar HTML aninhado inválido. **Semântica continua sendo
  responsabilidade de quem compõe** — `asChild` não transforma um link em botão nem
  resolve rótulos, navegação ou estado.
- **Ícones como `ReactNode`**: `iconStart`/`iconEnd` do `Button`; o pacote recebe
  ícones como nó e **não** depende de biblioteca de ícones.
- **`Button`**: sem `asChild`, aplica `type="button"` por default (com `type` explícito
  quando fornecido).
- **`AmbientBackdrop`**: sempre `aria-hidden="true"`; renderiza os blobs cyan/amber/accent
  + wash internamente.

---

## 4. Consumo

```json
{ "dependencies": { "@skwizlab/ui": "workspace:*" } }
```

```css
@import "tailwindcss";
@import "@skwizlab/ui/styles.css";
```

O consumidor carrega Montserrat e disponibiliza a família em `--font-montserrat`.
Quando a variável não existe, o pacote usa sua pilha de fallback.

```tsx
import { Button, Card, PageHeader, PageTitle } from "@skwizlab/ui";

<Card className="p-6">
  <PageHeader>
    <PageTitle>Leads</PageTitle>
    <Button>Novo lead</Button>
  </PageHeader>
</Card>;
```

### CSS público

| Entrada | Conteúdo |
| --- | --- |
| `@skwizlab/ui/styles.css` | Agregado recomendado para a maioria dos consumidores. |
| `@skwizlab/ui/themes/skr.css` | Tema claro, tokens semânticos e aliases `skr-*`. |
| `@skwizlab/ui/base.css` | Tipografia, foco, seleção, scrollbar e redução de movimento. |
| `@skwizlab/ui/components.css` | Estilos das primitivas e de suas variantes públicas. |
| `@skwizlab/ui/effects.css` | Grid, glass, sombras e ambient backdrop. |

---

## 5. Neste projeto (port CSS puro)

`skr-rel-reports` **não** consome o pacote React. O design system foi portado para
CSS puro em `public/styles.css` com classes próprias (`.btn`, `.card`, `.field`,
`.badge`, `.kpi`…). Ao criar um componente aqui:

1. Use os tokens do port (`--brand-primary`, `--radius-card`…), não os `--color-*`.
2. Siga as classes e padrões já existentes — ver [`../DESIGN.md`](../DESIGN.md).
3. Atualize `docs/DESIGN.md` + `docs/ARCHITECTURE.md` na mesma implementação.

Ao criar um componente **React para exportar a outro projeto**, siga o contrato desta
página (props, `data-slot`, `asChild`, variantes via cva) — ver
[`ADOCAO-TECNICA.md`](ADOCAO-TECNICA.md).

---

## 6. Verdade de código (upstream)

| Assunto | Arquivo |
| --- | --- |
| Tokens | `black-swan/ui/src/themes/skr.css` |
| Variantes (cva) | `black-swan/ui/src/variants.ts` |
| Componentes React | `black-swan/ui/src/components/primitives.tsx` |
| Visual das variantes | `black-swan/ui/src/components.css` |
| Efeitos | `black-swan/ui/src/effects.css` |
| Tests | `black-swan/ui/src/components/primitives.test.tsx` |
| Stories (referência visual) | `black-swan/ui/src/components/*.stories.tsx` |

---

> **Contrato técnico**: se não está no código-fonte, nos tipos e nas stories
> validadas, ainda não faz parte do sistema.
