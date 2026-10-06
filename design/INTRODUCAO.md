# Introdução — o design system SKR (`@skwizlab/ui`)

> Adaptado de `black-swan/ui/src/docs/Introducao.mdx` (Storybook upstream).
> Escopo atual: **SKR light · React 19 · TypeScript strict · Tailwind 4 · tokens semânticos**.

Uma linguagem compartilhada para transformar estratégia em experiência. O
`@skwizlab/ui` reúne decisões de marca, experiência e engenharia que tornam os
produtos SKR mais coerentes, reconhecíveis e confiáveis.

---

## O que é o `@skwizlab/ui`

É o design system da experiência digital SKR: uma biblioteca privada de tokens,
estilos, efeitos e componentes React genéricos. Seu papel é traduzir princípios de
marca e de usabilidade em decisões repetíveis, para que cada equipe não precise
resolver novamente cor, hierarquia, superfície, estados e comportamento básico.

Para a organização, funciona como um **acordo operacional entre áreas**. Para
engenharia, esse acordo também é executável: os mesmos componentes apresentados na
documentação são importados pelo produto.

| Valor | O que entrega |
| --- | --- |
| **Consistência** | Marca, produto e tecnologia trabalham com a mesma linguagem visual e os mesmos estados. |
| **Velocidade** | Menos decisões repetidas — as equipes partem de soluções aprovadas. |
| **Qualidade** | Estados, responsividade, interação e acessibilidade avaliáveis antes da integração. |
| **Evolução** | Melhoria na fonte compartilhada chega aos produtos sem criar novas divergências. |

> **A orientação documenta a intenção; o pacote entrega o contrato.** As páginas de
> orientação explicam intenção, contexto e governança. As páginas de componentes
> mostram a API pública, as variantes e os estados que existem no código. Uma
> proposta visual ainda não implementada **não** faz parte disponível do sistema.

---

## Para quem esta documentação foi feita

Não é necessário conhecer React para participar de uma revisão. Cada área consulta
o sistema com uma pergunta diferente:

| Área | Valida | Observe |
| --- | --- | --- |
| **Produto** | Se a interface deixa clara a prioridade da jornada e contempla estados relevantes | hierarquia, fluxo, estados vazio/erro/sucesso, critérios de aceite |
| **Design** | Padrões existentes, novas experiências e evoluções com impacto sistêmico conhecido | tokens, tipografia, contraste, ritmo, responsividade, interação |
| **Marketing e marca** | Se a expressão digital é premium, precisa e profissional | tom, clareza da mensagem, reconhecimento, consistência entre pontos de contato |
| **Engenharia e qualidade** | Props, semântica, comportamento e evidências automatizadas | Docs, Controls, foco, teclado, conteúdo extremo, testes |

---

## Documentação (percurso de leitura)

1. **[Fundamentos](FUNDAMENTOS.md)** — marca, princípios de experiência, linguagem visual, conteúdo e acessibilidade. *Para alinhar intenção e avaliar qualidade.*
2. **[Colaboração](COLABORACAO.md)** — papéis, governança, critérios de decisão e fluxo para propor uma mudança. *Para organizar decisões entre áreas.*
3. **[Adoção técnica](ADOCAO-TECNICA.md)** — arquitetura, consumo do pacote, stories, testes e versionamento. *Para implementar e entregar com segurança.*
4. Foundations: [Design tokens](TOKENS.md) · [Cor](CORES.md) · [Tipografia](TIPOGRAFIA.md) · [Forma e raio](FORMAS.md) · [Elevação](ELEVACAO.md) · [Movimento](MOVIMENTO.md)
5. **[Primitivas](PRIMITIVAS.md)** — componentes React e variantes públicas.

---

## O que o Storybook permite avaliar

O Storybook (só existe no upstream, `pnpm run ui:storybook`) é o ambiente isolado de
desenvolvimento e documentação do pacote. Ele mostra cada componente fora de um fluxo
específico, separando decisão sistêmica de regra exclusiva do produto.

- **Docs** — propósito, API, exemplos, variantes e estados documentados.
- **Canvas** — composição, responsividade, foco, conteúdo e acabamento.
- **Controls** — experimentar propriedades sem alterar código.
- **Testes** — interações essenciais; violações de acessibilidade são falhas bloqueantes.

**Leitura rápida para quem não desenvolve:** comece pela aba *Docs*; abra stories
nomeadas por estado (*Disabled*, *Long content*, *Narrow*); use *Controls* para
alterar textos; em *Canvas* mude o viewport; registre feedback pelo impacto
observado (usuário, marca, conversão, operação, acessibilidade).

---

## Escopo atual

O sistema é deliberadamente pequeno. Cobre a base compartilhável da experiência SKR
e cresce somente quando existe um padrão real, recorrente e independente do domínio.

**Incluído — fonte visual compartilhada**
- tema claro SKR e tokens semânticos;
- tipografia base, foco e redução de movimento;
- superfícies, profundidade e efeitos ambientais;
- primitivas React genéricas e suas variantes;
- stories, documentação e validações automatizadas.

**Fora do pacote — contexto do produto**
- regras de negócio, jornadas e métricas;
- Next.js, autenticação, actions e integrações;
- componentes ligados a leads, reservas ou CVCRM;
- conteúdo final e decisões editoriais de uma tela;
- identidade de campanhas e peças de comunicação.

> **Estado atual, não promessa futura**: o pacote oferece um tema **SKR claro**.
> Multibrand, dark mode e publicação em registry **não** fazem parte do contrato atual.

---

## Da estratégia ao produto

O design system não substitui pesquisa, estratégia, direção criativa ou desenho de
jornada. Ele organiza a passagem entre essas decisões e a interface implementada:

1. **Estratégia e marca** — percepção desejada, público, mensagem e resultado.
2. **Fundamentos e tokens** — intenção traduzida em cor, tipografia, forma, profundidade e movimento.
3. **Primitivas e padrões** — decisões recorrentes em componentes consistentes e acessíveis.
4. **Jornadas do produto** — sistema combinado com conteúdo, dados e regras do negócio.

---

## Princípios de decisão

| # | Princípio |
| --- | --- |
| 01 | **Clareza operacional** — hierarquia, leitura rápida e confiança vêm antes do ornamento. |
| 02 | **Paridade antes da reinvenção** — uma migração preserva o comportamento vigente antes de propor redesign. |
| 03 | **Precisão material** — Montserrat, contornos finos, translucidez e sombras sutis criam profundidade. |
| 04 | **Semântica antes do valor** — marca, superfície, texto e feedback expressam intenção, não números soltos. |
| 05 | **Inclusão como qualidade** — teclado, foco, contraste, leitura e movimento reduzido fazem parte do contrato. |
| 06 | **Evidência antes da abstração** — um novo padrão nasce de uso recorrente, não de possibilidade hipotética. |

## Como decidir onde uma solução pertence

- **Reutilize** — quando uma primitiva existente resolve comportamento e hierarquia necessários.
- **Componha** — quando a necessidade é combinação de componentes já disponíveis.
- **Evolua o sistema** — quando o padrão é recorrente, genérico e relevante para mais de uma superfície.
- **Mantenha no produto** — quando depende de regra de negócio, integração, permissão ou vocabulário de domínio.

---

## Início rápido para engenharia

No **upstream** (`black-swan`): `pnpm run ui:storybook`. O consumidor importa o CSS
do pacote depois do Tailwind e carrega Montserrat em `--font-montserrat`:

```css
@import "tailwindcss";
@import "@skwizlab/ui/styles.css";
```

```tsx
import { Button, Card, PageTitle } from "@skwizlab/ui";

export function Example() {
  return (
    <Card variant="standard" className="p-6">
      <PageTitle>Leads</PageTitle>
      <Button>Novo lead</Button>
    </Card>
  );
}
```

Neste projeto (`skr-rel-reports`) o design system está **portado para CSS puro** em
`public/styles.css` — ver [`../DESIGN.md`](../DESIGN.md) para o port local.

---

**Próximo passo**: escolha o percurso — [Fundamentos](FUNDAMENTOS.md) para avaliar a
linguagem, [Colaboração](COLABORACAO.md) para organizar uma mudança ou
[Adoção técnica](ADOCAO-TECNICA.md) para implementar.
