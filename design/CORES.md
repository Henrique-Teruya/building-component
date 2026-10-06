# Foundation: Cor — prioridade, estrutura e estado

> Adaptado de `black-swan/ui/src/docs/foundations/Color.mdx`. Escopo: **light theme · paleta · papéis semânticos**.

A foundation Color separa a paleta disponível dos papéis que a interface precisa
cumprir. Essa distinção mantém a expressão SKR reconhecível sem transformar cada
valor visual em uma decisão local.

---

## Paleta e papéis semânticos

**Palette** é o conjunto de cores primitivas. **Semantic roles** são os nomes que
explicam por que uma cor aparece: ação principal, superfície, texto, borda ou
feedback. Produtos e componentes devem **preferir os papéis semânticos**.

> **Escolha pela função, não pelo hexadecimal.** Se uma decisão precisa de "texto
> secundário", use esse papel. Não selecione `neutral-500` apenas porque o tom
> parece correto na tela atual.

---

## Paleta primitiva

| Cor | Hex | Token upstream | Token no port local |
| --- | --- | --- | --- |
| Brand Blue 500 | `#0071E3` | `--color-brand-blue-500` | `--brand-blue-500` |
| Brand Blue 700 | `#0057AD` | `--color-brand-blue-700` | `--brand-blue-700` |
| Neutral 0 | `#FFFFFF` | `--color-neutral-0` | `--neutral-0` |
| Neutral 50 | `#FBFBFD` | `--color-neutral-50` | `--neutral-50` |
| Neutral 300 | `#E8E8ED` | `--color-neutral-300` | `--neutral-300` |
| Neutral 500 | `#86868B` | `--color-neutral-500` | `--neutral-500` |
| Neutral 950 | `#1D1D1F` | `--color-neutral-950` | `--neutral-950` |

---

## Papéis semânticos

| Papel | Resolve para | Para que serve |
| --- | --- | --- |
| `brand-primary` | `brand-blue-500` | Ações e sinais de marca que precisam de maior reconhecimento visual. |
| `brand-contrast` | `brand-blue-700` | Ênfase azul mais escura, especialmente em texto ou detalhes sobre fundos claros. |
| `surface-canvas` | `neutral-0` | Plano principal sobre o qual as superfícies da experiência são organizadas. |
| `surface-card` | `neutral-50` | Agrupamento sutil de conteúdo, sem comunicar elevação por conta própria. |
| `surface-elevated` | `neutral-0` | Base de elementos que precisam se separar visualmente do plano inferior. |
| `text-primary` | `neutral-950` | Conteúdo principal, títulos e informações com prioridade de leitura. |
| `text-secondary` | `neutral-500` | Informações de apoio que continuam relevantes para compreender a interface. |
| `text-muted` | `#6e6e73` | Metadados e conteúdos de menor ênfase; **não deve esconder informação necessária**. |
| `border-subtle` | `neutral-300` | Separação leve entre regiões quando espaço e superfície não bastam. |
| `feedback-danger` | `#c64545` | Erros e consequências destrutivas. Deve aparecer com texto ou ícone explicativo. |

Tokens semânticos no port local: `public/styles.css:18-27`.

---

## Diretrizes de uso

1. Preserve contraste entre conteúdo e superfície no contexto real de uso.
2. **Não use cor como único meio** de comunicar seleção, erro ou mudança de estado.
3. Reserve `brand-primary` para ações e sinais que realmente merecem prioridade.
4. Prefira hierarquia por tipografia e espaço antes de adicionar novas cores.
5. Teste estados de foco, hover, disabled e conteúdo longo — não apenas o estado ideal.

---

## Acessibilidade e marca

A paleta expressa a marca, mas um hexadecimal isolado não garante contraste. A
combinação entre foreground, background, tamanho e peso precisa ser validada na
composição final. Produto define a importância da informação; Design escolhe o papel
apropriado; Engenharia preserva a associação semântica e testa os estados.

> **Aliases de compatibilidade** — nomes como `--color-skr-blue`, `--color-primary` e
> `--color-accent` permanecem disponíveis durante a migração. Código novo deve usar
> os papéis semânticos documentados acima. No port local, `--skr-*` existe
> (`public/styles.css:30-36`); `--color-primary`/`--color-accent` **não** foram portados.

---

> **Revisão profissional**: a cor certa sustenta a decisão; ela não tenta substituir
> a hierarquia. Em reviews, descreva o **papel** que precisa ser comunicado antes de
> discutir o tom.
