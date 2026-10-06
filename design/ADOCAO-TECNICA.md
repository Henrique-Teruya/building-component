# Adoção técnica — do contrato documentado ao produto

> Adaptado de `black-swan/ui/src/docs/AdocaoTecnica.mdx`.
> Características: **workspace privado · ESM + CJS · CSS público · CI bloqueante**.

O pacote foi desenhado para ser consumido como uma biblioteca React **independente de
framework**, com CSS público, tipos estritos e validação isolada no Storybook.

---

## Arquitetura e fronteira

`@skwizlab/ui` contém fundamentos visuais e primitivas genéricas. O aplicativo contém
composição, dados e domínio. Essa separação permite testar o sistema isoladamente e
preserva imports públicos para uma extração futura — sem afirmar que o pacote já é
publicado.

| No pacote — reutilizável e independente | No aplicativo — composição e domínio |
| --- | --- |
| tokens, tema SKR, base CSS e efeitos | framework, autenticação, actions, hooks e providers |
| componentes React e helpers de variantes | integrações, permissões, métricas e regras de negócio |
| atributos nativos, refs, `className`, `data-slot` e `asChild` | componentes de leads, reservas, fila ou CVCRM |
| stories, testes, tipos e artefatos de build | conteúdo e comportamento específicos de uma jornada |

---

## Consumo local

```json
{ "dependencies": { "@skwizlab/ui": "workspace:*" } }
```

No stylesheet global do consumidor, **Tailwind vem antes** do agregado do pacote:

```css
@import "tailwindcss";
@import "@skwizlab/ui/styles.css";
```

O consumidor carrega Montserrat e disponibiliza a família em `--font-montserrat`.
Quando a variável não existe, o pacote usa sua pilha de fallback.

```tsx
import { Button, Card, PageHeader, PageTitle } from "@skwizlab/ui";

export function LeadsHeader() {
  return (
    <Card className="p-6">
      <PageHeader>
        <PageTitle>Leads</PageTitle>
        <Button>Novo lead</Button>
      </PageHeader>
    </Card>
  );
}
```

---

## CSS público

| Entrada | Conteúdo |
| --- | --- |
| `@skwizlab/ui/styles.css` | Agregado recomendado para a maioria dos consumidores. |
| `@skwizlab/ui/themes/skr.css` | Tema claro, tokens semânticos e aliases temporários `skr-*`. |
| `@skwizlab/ui/base.css` | Tipografia, foco, seleção, scrollbar e redução de movimento. |
| `@skwizlab/ui/components.css` | Estilos das primitivas e de suas variantes públicas. |
| `@skwizlab/ui/effects.css` | Grid, glass, sombras e ambient backdrop. |

---

## Contratos de composição

- **Atributos nativos e refs** — preservem semântica, formulário, acessibilidade e integrações.
- **`className`** — layout e composição local; não replique internamente o estilo canônico.
- **`data-slot`** — marcador estável para composição e inspeção.
- **`asChild`** — aplica o contrato visual a outro elemento (ex. `next/link`) sem criar HTML aninhado inválido.
- **Ícones como `ReactNode`** — o consumidor escolhe a biblioteca; o pacote não depende de biblioteca de ícones.
- **Helpers de variantes** (`buttonVariants`, `fieldControlVariants`…) — para integrações que aceitam string de classe em vez de componente React.

> **Semântica continua sendo responsabilidade de quem compõe.** `asChild` muda o
> elemento renderizado, mas não transforma automaticamente um link em botão nem resolve
> rótulos, navegação ou estado. Escolha o elemento pela ação que ele representa.

---

## Criando ou alterando uma story

Use CSF 3, mantenha os valores comuns em `meta.args` e permita que o caminho do
arquivo determine o título. Controls devem ser inferidos sempre que possível;
configure manualmente apenas valores complexos ou propositalmente fixos.

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./primitives";

const meta = {
  component: Button,
  tags: ["autodocs"],
  args: { children: "Continuar", variant: "primary" },
  argTypes: { children: { control: "text" } },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Disabled: Story = { args: { disabled: true } };
```

Uma story útil cobre **uma decisão, não apenas uma aparência**. Inclua, conforme o
componente: variantes, disabled, conteúdo longo, viewport estreito, interação,
teclado, `asChild` e redução de movimento. Use `play` para comportamentos essenciais.

---

## Gates de qualidade

Executados a partir da raiz do repositório upstream:

```bash
pnpm run ui:typecheck      # API pública e consumo em TypeScript strict
pnpm run ui:test           # Vitest: comportamento e contratos das primitivas
pnpm run ui:test-storybook # stories no Chromium; violações a11y são erros
pnpm run ui:build          # pacote distribuível
pnpm run ui:build-storybook# documentação estática
pnpm run ui:pack-check     # inspeciona exports públicos do pacote gerado
```

Há ainda **paridade visual** do aplicativo (`tests/design-system-visual.spec.ts`, desktop
e mobile, tolerância `0.005`). O workflow de UI executa esses gates e disponibiliza o
`storybook-static` como artefato privado de CI — o catálogo **não** é publicação pública.

---

## Versionamento e compatibilidade

Changesets controla o semver do pacote privado. Inclua um changeset quando a mudança
alterar o contrato público: **props, variantes, exports, tokens, CSS observável ou
comportamento esperado**. Mudanças incompatíveis exigem estratégia de migração dos
consumidores; **não remova aliases de compatibilidade sem verificar o uso**.

```bash
pnpm changeset
```

---

## Evite estes atalhos

- copiar classes do componente para recriar uma variante no produto;
- introduzir cor, sombra ou raio literal quando existe um token semântico;
- adicionar framework, autenticação ou dependência de domínio ao pacote;
- criar abstração para um caso hipotético sem uso recorrente;
- editar `dist/` ou `storybook-static/` em vez dos arquivos-fonte;
- declarar suporte em Docs sem implementação e validação correspondentes;
- usar `asChild` para esconder uma escolha semântica incorreta.

---

## Checklist de integração

- [ ] o componente existente foi consultado na documentação (Docs, Canvas, Controls);
- [ ] a solução permanece dentro da fronteira correta entre pacote e produto;
- [ ] conteúdo, estados e semântica foram definidos pela jornada;
- [ ] layout local usa composição, sem duplicar a implementação visual;
- [ ] teclado, foco, viewport estreito e conteúdo extremo foram revisados;
- [ ] testes proporcionais ao risco foram executados;
- [ ] mudança pública inclui Docs, stories e changeset quando aplicável.

---

## Nota para componentes criados em `skr-rel-reports`

Este projeto **não** tem Storybook, changesets nem `workspace:*`. Um componente novo
aqui segue o port CSS puro (`public/styles.css` + `public/index.html`) e registra a
mudança em `docs/DESIGN.md` + `docs/ARCHITECTURE.md`
(ver [`../DESIGN.md`](../DESIGN.md) e `docs/DOCUMENTATION.md`).

Se o componente for **exportado como React para outro projeto**, aplique os contratos
desta página (props, `data-slot`, `asChild`, variantes via cva, tokens semânticos) e
avalie nascer no upstream `@skwizlab/ui` — ver [`PRIMITIVAS.md`](PRIMITIVAS.md) e
[`COLABORACAO.md`](COLABORACAO.md).

---

> **Contrato técnico**: se não está no código-fonte, nos tipos e nas stories
> validadas, ainda não faz parte do sistema. A documentação deve reduzir ambiguidade e
> permanecer sincronizada com o artefato que o produto realmente consome.
