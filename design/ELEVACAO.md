# Foundation: Elevação — profundidade

> Adaptado de `black-swan/ui/src/docs/foundations/Elevation.mdx`.
> Composição SKR: **superfície · borda sutil · sombra de card**.

Elevação organiza planos sem pesar a interface. Comunica a relação entre superfícies
por meio de fundo, borda e sombra. O sistema atual possui **uma única sombra
pública**, deliberadamente sutil, para evitar uma hierarquia de profundidade que o
produto ainda não precisa.

---

## Superfície antes da sombra

Elevação é uma composição. Primeiro, defina o plano com `surface-canvas`,
`surface-card` ou `surface-elevated`. Depois avalie se borda, sobreposição ou sombra
são necessárias para explicar a relação entre as camadas.

| Nível | Quando usar | Token |
| --- | --- | --- |
| **Flat surface** | Fundo e borda já separam o conteúdo. Não requer sombra adicional. | `--surface-card` |
| **Card elevation** | Profundidade leve para uma superfície que precisa se destacar do canvas. | `--shadow-card` |

---

## Token disponível

| Token | Composição | Intenção |
| --- | --- | --- |
| `--shadow-card` | Três camadas de baixa opacidade: contorno, contato e difusão. | Separar uma superfície sem criar aparência pesada ou flutuante em excesso. |

```css
--shadow-card:
  0 0 0 0.5px rgba(0, 0, 0, 0.02),
  0 2px 4px rgba(0, 0, 0, 0.02),
  0 4px 12px rgba(0, 0, 0, 0.03);
```

Idêntico no port local (`public/styles.css:42-45`).

---

## Diretrizes de uso

1. Use profundidade para **explicar relação entre planos**, não para decorar cards.
2. Não combine sombras locais até criar níveis que o sistema não documenta.
3. Preserve bordas sutis em fundos claros quando a sombra sozinha não delimitar a superfície.
4. Estados interativos podem alterar elevação somente quando isso reforça resposta e clicabilidade.
5. Glass e ambient effects são composições do pacote, **não** novos níveis da escala de elevação.

> **Mais sombra não significa mais prioridade.** Produto define o que é importante;
> tipografia, ordem e conteúdo comunicam essa prioridade. Elevation deve apenas
> esclarecer como as superfícies se relacionam.

---

## Quando ampliar a escala

Um novo nível precisa corresponder a uma relação espacial recorrente — por exemplo,
uma camada modal realmente distinta — e funcionar de forma consistente em todos os
componentes que compartilham essa responsabilidade. Uma sombra criada para "dar
destaque" a um único card permanece decisão local até existir evidência sistêmica.

No port local, o modal do modo TV (`tv-modal-card`) reaproveita as sombras de card —
ver `public/styles.css:1027` e `docs/DESIGN.md` § Modo TV.

---

> **Princípio**: profundidade deve ser percebida como estrutura, não como efeito.
> Comece pela superfície e adicione sombra apenas quando a relação entre planos exigir.
