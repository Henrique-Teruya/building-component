# Foundation: Tipografia — hierarquia

> Adaptado de `black-swan/ui/src/docs/foundations/Typography.mdx`. Escopo: **Montserrat · display/sans · 300 · 400 · 700**.

Tipografia transforma conteúdo em hierarquia. A typography foundation organiza
leitura, prioridade e tom. Montserrat sustenta uma expressão contemporânea e
precisa, enquanto fallbacks nativos preservam legibilidade quando a fonte de marca
não está disponível.

---

## Duas funções, uma família

O tema upstream oferece duas pilhas tipográficas. Ambas priorizam Montserrat,
fornecida pelo produto consumidor, e recorrem a fontes de sistema como fallback.

| Pilha | Token upstream | Uso |
| --- | --- | --- |
| **Display** | `--font-display` | Títulos e mensagens de maior expressão. Peso e espaçamento apertado criam presença sem depender de ornamento. |
| **Sans** | `--font-sans` | Leitura funcional: corpo, controles, metadados e instruções. |

**No port local deste projeto** as duas pilhas foram unificadas em um único token
`--font` (`public/styles.css:50-51`):

```css
--font: "Montserrat", -apple-system, BlinkMacSystemFont, "SF Pro Text",
  "Helvetica Neue", sans-serif;
```

A distinção display/sans aqui é feita por classe (`page-title`, `section-title`,
`card-title`), não por token — ver `docs/DESIGN.md` § Tipografia.

---

## Pesos disponíveis

| Peso | Nome | Uso |
| --- | --- | --- |
| 300 | Light | expressão leve |
| 400 | Regular | leitura principal |
| 700 | Bold | hierarquia e ação |

O Storybook upstream carrega esses três pesos para representar o contrato atual. No
produto, **o consumidor é responsável por disponibilizar Montserrat** em
`--font-montserrat` (upstream) ou via Google Fonts (port local, `public/index.html`).

> Obs.: o port local também usa peso **800** no destaque de SLA e 500/600 em alguns
> rótulos — ver `docs/DESIGN.md`. São usos locais, não fazem parte do contrato
> upstream de três pesos.

---

## Hierarquia de conteúdo

| Papel | Objetivo | Orientação |
| --- | --- | --- |
| Título de página | Nomear a tarefa ou contexto principal. | Uma ideia curta, específica e reconhecível. |
| Título de seção | Separar blocos de decisão ou leitura. | Deve permitir varrer a página sem ler todos os parágrafos. |
| Corpo | Explicar contexto, instrução ou consequência. | Frases diretas, largura confortável e ritmo consistente. |
| Metadado | Complementar a informação principal. | Menor ênfase, sem esconder dados necessários para decidir. |
| Ação | Explicitar o que acontece depois do clique. | Verbo objetivo; evite rótulos genéricos como "Continuar". |

---

## O que já é base e o que pertence ao componente

O estilo base aplica `font-display`, peso 700 e tracking mais fechado aos headings.
O corpo usa `font-sans`, peso 400 e tracking de leitura. **Tamanhos tipográficos e
line-height ainda não são uma escala pública de tokens**: os componentes controlam
esses valores conforme sua responsabilidade.

Isso evita apresentar uma escala inexistente como contrato. Uma futura escala de
type tokens deverá nascer de padrões recorrentes e ser validada em mais de uma
superfície antes de entrar no tema.

---

## Critérios para reviews

1. A ordem visual corresponde à prioridade real do conteúdo?
2. É possível compreender a página lendo apenas títulos e ações?
3. O texto continua legível em viewport estreito e com zoom?
4. Metadados têm menor ênfase sem perder contraste ou significado?
5. O rótulo de cada ação descreve uma consequência previsível?

> **Tipografia também é conteúdo.** Design define hierarquia visual; Produto define
> prioridade e clareza; Marketing protege voz e precisão; Engenharia preserva
> semântica, responsividade e carregamento da fonte.

---

> **Princípio**: se tudo parece importante, a interface não ajudou o usuário a
> decidir. Hierarquia tipográfica deve tornar a intenção visível antes do detalhe.
