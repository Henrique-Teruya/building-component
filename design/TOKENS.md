# Design tokens — decisões nomeadas, reutilizáveis e verificáveis

> Adaptado de `black-swan/ui/src/docs/foundations/DesignTokens.mdx`. Escopo: **SKR light · CSS variables · semânticos · Tailwind 4**.

Design tokens registram as decisões fundamentais da experiência SKR em nomes que
design e engenharia podem compartilhar. Reduzem valores soltos, preservam intenção e
tornam uma mudança sistêmica rastreável.

---

## O que é um design token

Um token é uma decisão de design com **nome, valor e propósito**. Em vez de uma tela
depender diretamente de `#0071e3`, ela usa `brand-primary`: o código expressa a
**função** daquela cor, e não apenas sua aparência atual.

Para lideranças de Design, Produto e Marketing, isso transforma consistência em um
sistema administrável. Para engenharia, cria uma API visual que pode ser usada pelos
componentes, revisada em pull requests e atualizada na fonte compartilhada.

> **Token não é sinônimo de qualquer variável CSS.** Um valor entra no contrato
> público quando representa uma decisão recorrente, tem responsabilidade clara e pode
> evoluir sem depender de uma tela específica.

---

## As três camadas do tema SKR

| # | Camada | Descrição | Exemplo |
| --- | --- | --- | --- |
| 01 | **Primitivos** | Valores de base da paleta. Descrevem a matéria-prima, sem indicar onde deve ser usada. | `--color-brand-blue-500` |
| 02 | **Semânticos** | Nomes orientados à intenção: marca, superfície, texto, borda ou feedback. | `--color-brand-primary` |
| 03 | **Compatibilidade** | Aliases mantidos para a migração atual. Preservam integrações, mas não orientam código novo. | `--color-skr-blue` |

### Por que a camada semântica é a principal

O valor `brand-blue-500` pode continuar azul e ainda assim deixar de ser a escolha
certa para uma ação. Já `brand-primary` descreve o papel esperado. Essa separação
permite revisar marca ou acessibilidade sem espalhar decisões técnicas por todos os
consumidores.

---

## Famílias disponíveis

| Família | Conteúdo | Tokens |
| --- | --- | --- |
| **Color** | Paleta primitiva e papéis semânticos de marca, superfície, texto, borda e feedback. | `--color-*` |
| **Typography** | Pilhas tipográficas para leitura funcional e expressão de títulos. | `--font-sans` · `--font-display` |
| **Shape & Radius** | Três formas recorrentes para controles, superfícies e elementos compactos. | `--radius-*` |
| **Elevation** | Profundidade sutil para superfícies elevadas, sem criar ruído visual. | `--shadow-card` |
| **Motion** | Durações e curva padrão para feedback rápido e transições coerentes. | `--duration-*` · `--ease-standard` |

### Mapa de nomenclatura port ↔ upstream

Este projeto usa o **port CSS puro** (`public/styles.css:6-52`), que remove o prefixo
`color-` das famílias de cor e unifica as pilhas de fonte:

| Upstream (`ui/src/themes/skr.css`) | Port local (`public/styles.css`) |
| --- | --- |
| `--color-brand-primary` | `--brand-primary` |
| `--color-surface-*` | `--surface-*` |
| `--color-text-*` | `--text-*` |
| `--color-border-subtle`, `--color-feedback-danger` | `--border-subtle`, `--feedback-danger` |
| `--color-skr-*` | `--skr-*` |
| `--font-sans` / `--font-display` | `--font` (pilha única) |
| `--radius-*`, `--shadow-card`, `--ease-standard`, `--duration-*` | **iguais** |

> Ao construir um componente novo **neste** projeto, use os nomes do port local.
> Ao construir para o **upstream** (`@skwizlab/ui`), use os nomes com prefixo `color-`.

---

## Modelo de nomenclatura

| Camada | Estrutura | Exemplo | Regra de uso |
| --- | --- | --- | --- |
| Primitiva | `categoria + família + escala` | `color-brand-blue-500` | Base para compor tokens semânticos; evite acoplar componentes ao valor. |
| Semântica | `categoria + papel + variação` | `color-text-secondary` | Escolha padrão para componentes e experiências novas. |
| Compatibilidade | `nome legado` | `color-primary` | Somente para preservar a migração; não amplia o contrato. |

---

## Como escolher um token

1. Comece pelo **papel na experiência**: texto, superfície, marca, feedback, forma ou movimento.
2. Use um token semântico existente quando a intenção for equivalente.
3. Não escolha pelo valor mais parecido nem crie um alias exclusivo para uma tela.
4. Se nenhum token representar a decisão, valide recorrência, contraste, impacto e governança antes de ampliar o tema.

---

## O que ainda não é contrato

O pacote upstream **não** expõe escalas públicas de **spacing**, **grid**,
**breakpoints**, **tamanho tipográfico** ou **ícones**. Esses assuntos são
foundations comuns em design systems maduros, mas documentá-los como disponíveis
agora criaria uma promessa falsa. **Dark mode e multibrand também não fazem parte do
escopo atual.**

> ⚠️ **No port local há breakpoints e escala tipográfica** (documentados em
> [`../DESIGN.md`](../DESIGN.md) § Tipografia e § Breakpoints) — são decisões locais
> deste app, não tokens do `@skwizlab/ui`. Não promova a escala local como contrato
> do sistema sem passar pela governança descrita em [`COLABORACAO.md`](COLABORACAO.md).

> **Fonte canônica**: os tokens upstream estão em `ui/src/themes/skr.css`. Esta
> documentação explica o contrato; o arquivo CSS continua sendo a definição executável
> consumida pelos produtos. No port local, a fonte executável é `public/styles.css`.

---

> **Critério central**: novos valores só entram quando representam uma decisão
> compartilhada. O sistema cresce por evidência de uso, não para catalogar todas as
> possibilidades.
