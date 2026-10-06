# Foundation: Forma e raio (Shape & Radius)

> Adaptado de `black-swan/ui/src/docs/foundations/ShapeRadius.mdx`.
> Escala SKR: **controle 12 px · card 20 px · raio total**.

A forma reforça função, agrupamento e personalidade. Shape & Radius documenta três
níveis intencionais de arredondamento. Eles diferenciam controles, superfícies e
elementos compactos sem criar uma coleção arbitrária de cantos.

---

## Escala atual

| Nível | Valor | Token | Para que serve |
| --- | --- | --- | --- |
| **Controle** | 12 px | `--radius-control` | Campos, botões e contêineres compactos que pedem precisão e previsibilidade. |
| **Card** | 20 px | `--radius-card` | Superfícies de conteúdo e agrupamentos com presença visual mais ampla. |
| **Raio total** | 9999 px | `--radius-full` | Cria cápsulas em elementos alongados e círculos em elementos quadrados. |

Tokens idênticos no port local (`public/styles.css:39-41`).

> **"Raio total" expressa intenção, não uma medida visível.** Internamente,
> `--radius-full` usa um valor deliberadamente alto para que o navegador forme a
> maior curvatura possível de acordo com a altura e a largura do elemento. Assim, o
> resultado permanece uma cápsula ou um círculo sem expor um número arbitrário como
> orientação de design. `--radius-pill` continua disponível apenas como alias de
> compatibilidade **no upstream** — não foi portado para este projeto.

---

## Como escolher

- **Controle** — quando a pessoa interage diretamente com uma área compacta e delimitada.
- **Card** — para agrupar informações relacionadas em uma superfície com maior respiro.
- **Raio total** — para criar cápsulas ou círculos em elementos compactos e autocontidos.
- **Sem raio novo** — se a diferença é apenas decorativa e não comunica uma função recorrente.

---

## Forma não substitui estrutura

Raio não cria hierarquia sozinho. Espaçamento, superfície, título e ordem de
conteúdo continuam responsáveis pelo agrupamento. Misturar muitos valores de radius
enfraquece a assinatura visual e dificulta reconhecer componentes com a mesma função.

> **Contrato do componente**: o token define a decisão compartilhada; cada
> componente decide como aplicá-la de acordo com sua anatomia. Consumidores não devem
> sobrescrever o raio apenas para diferenciar uma tela.

---

## Critérios para reviews

1. Elementos com a mesma função usam a mesma família de forma?
2. A forma ajuda a compreender agrupamento ou apenas adiciona ornamento?
3. O conteúdo longo continua contido sem deformar pills ou controles?
4. Estados de foco e áreas clicáveis permanecem claramente visíveis?

---

> **Princípio**: consistência de forma torna a função reconhecível antes da leitura.
> Adicione um novo raio somente quando uma nova responsabilidade visual for recorrente.
