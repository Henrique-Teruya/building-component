# Foundation: Movimento (Motion) — tempo e resposta

> Adaptado de `black-swan/ui/src/docs/foundations/Motion.mdx`.
> Escopo: **200 ms · 350 ms · standard easing · reduced motion**.

Movimento explica mudança e confirma resposta. Motion conecta causa e efeito: uma
ação responde, um estado muda e a pessoa entende o que aconteceu. Duração, curva e
redução de movimento fazem parte da mesma decisão de qualidade.

---

## Tokens disponíveis

| Token | Valor | Para que serve |
| --- | --- | --- |
| `--duration-fast` | 200 ms | Feedback direto em controles, hover e pequenas mudanças de estado. |
| `--duration-standard` | 350 ms | Transições com deslocamento ou mudança visual que precisa ser acompanhada. |
| `--ease-standard` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Curva natural para desacelerar a mudança sem prolongar a tarefa. |

Idênticos no port local (`public/styles.css:46-48`).

O token define **tempo e curva**; cada componente define **quais propriedades** podem
se mover sem prejudicar leitura ou interação.

---

## Escolha pela intenção

| Situação | Intenção | Direção |
| --- | --- | --- |
| Hover e press | Confirmar que um elemento responde. | Fast; mudança curta e reversível. |
| Expansão ou troca de estado | Ajudar a acompanhar continuidade. | Standard quando houver deslocamento perceptível. |
| Loading | Comunicar atividade sem estimar progresso falso. | Movimento discreto, sem bloquear leitura. |
| Ambient effect | Criar atmosfera sem competir com a tarefa. | Baixa intensidade e remoção em reduced motion. |

---

## Reduced motion é parte do contrato

Quando `prefers-reduced-motion: reduce` está ativo, o sistema reduz animações e
transições para `0.01ms` e remove o movimento dos ambient blobs. Isso mantém estado e
conteúdo disponíveis sem exigir que a pessoa acompanhe deslocamentos desnecessários.

No port local, o port de `_reduced-motion` está em `public/styles.css` (bloco final)
e as animações de reveal respeitam a preferência — ver `docs/DESIGN.md` § Animações e
§ Acessibilidade.

> **Movimento nunca pode carregar significado sozinho.** Seleção, sucesso, erro e
> progresso também precisam de texto, forma, posição ou semântica acessível. A
> transição reforça a mudança; ela não substitui a informação.

---

## Critérios para reviews

1. O movimento explica uma relação ou apenas chama atenção?
2. A duração preserva a sensação de resposta imediata?
3. Foco, leitura e clique continuam estáveis durante a transição?
4. A experiência permanece completa com reduced motion?
5. Loops ambientais têm baixa intensidade e não disputam atenção com a tarefa?

---

## O que não é token

As durações de 25, 30 e 35 segundos dos blobs ambientais pertencem à implementação
do efeito atual (`public/styles.css:122-159`). Elas **não** são uma escala pública de
motion tokens e não devem ser reutilizadas como padrão de interação.

---

> **Princípio**: o melhor movimento reduz esforço para compreender uma mudança. Se a
> animação precisa ser explicada, ela provavelmente está ocupando espaço demais.
