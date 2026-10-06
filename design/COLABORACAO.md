# Colaboração e governança — decisões compartilhadas

> Adaptado de `black-swan/ui/src/docs/Colaboracao.mdx`. Objetivos: **alinhamento · rastreabilidade · qualidade**.

O design system reduz retrabalho quando cada área contribui no momento certo e a
decisão registra intenção, impacto e evidência — não apenas preferência visual.

---

## Governança sem burocracia

Governança é o conjunto de critérios que ajuda a responder três perguntas: **o que
entra no sistema, quem precisa participar e como sabemos que a mudança está pronta**.
O objetivo não é centralizar todas as decisões, mas evitar que uma escolha local crie
divergência, dívida ou risco para outras jornadas.

---

## Papel de cada área

| Área | Forte em | Limite |
| --- | --- | --- |
| **Produto** — contexto e resultado | Define problema, público, prioridade, regra de negócio, estados da jornada e resultado esperado. | Não delega ao componente a decisão sobre o fluxo. |
| **Design** — interação e coerência | Investiga padrões existentes, desenha comportamento, testa composição e protege a linguagem sistêmica. | Não transforma uma exceção isolada em padrão sem evidência. |
| **Marketing e marca** — percepção e linguagem | Contribui com tom, mensagem, reconhecimento e coerência entre produto e demais pontos de contato. | Não usa a interface operacional como extensão automática de uma campanha. |
| **Engenharia** — contrato e sustentabilidade | Avalia API, semântica, dependências, performance, compatibilidade, testes e impacto nos consumidores. | Não duplica uma primitiva apenas para acelerar uma entrega local. |
| **Qualidade e acessibilidade** — cenários e evidência | Desafia estados extremos, teclado, leitura, responsividade e regressões funcionais ou visuais. | Não limita a validação ao caminho ideal. |

---

## Quando envolver o design system

| Situação | Direção recomendada | Participação necessária |
| --- | --- | --- |
| Uma primitiva já cobre a necessidade | Reutilizar e compor no produto | Produto, design e engenharia da entrega |
| A diferença é conteúdo ou regra de negócio | Manter no produto | Áreas responsáveis pela jornada |
| O mesmo padrão aparece em várias superfícies | Avaliar evolução do sistema | Design e engenharia, com produto e marca quando houver impacto |
| A mudança altera props, variantes ou semântica | Tratar como mudança de contrato | Engenharia, design e consumidores afetados |
| A proposta muda expressão de marca | Alinhar fundamentos antes da implementação | Design, marketing/marca e produto |
| A mudança remove ou quebra comportamento existente | Planejar migração e versionamento | Responsáveis pelo sistema e por cada consumidor |

---

## Fluxo de contribuição

1. **Enquadre o problema** — registre usuário, contexto, recorrência, impacto e resultado esperado.
2. **Investigue o catálogo** — verifique componentes, variantes, tokens e exemplos antes de propor algo novo.
3. **Escolha a fronteira** — reutilização, composição do produto ou evolução do sistema.
4. **Proponha o contrato** — intenção, API, estados, acessibilidade, compatibilidade e impacto visual.
5. **Implemente e documente** — código-fonte, stories, testes, orientação e changeset quando o contrato público mudar.
6. **Valide e adote** — revise com as áreas afetadas, execute os gates e acompanhe a integração.

---

## O que trazer para uma decisão

- problema e público afetado, com exemplos reais;
- telas, fluxos ou componentes em que o padrão se repete;
- alternativa existente e motivo pelo qual não atende;
- estados relevantes: default, hover, foco, disabled, loading, vazio, erro e conteúdo extremo;
- impacto esperado para usuário, marca, produto e manutenção;
- riscos de compatibilidade e consumidores que precisarão migrar;
- evidência visual ou funcional suficiente para comparar antes e depois.

> **Preferência não é critério suficiente.** "Parece melhor" inicia uma conversa, mas
> não encerra uma decisão. Relacione a proposta a clareza, consistência,
> reconhecimento de marca, acessibilidade, conversão, eficiência operacional ou
> redução de dívida.

---

## Pronto para começar

Antes de implementar uma evolução do sistema, confirme:

- o problema está descrito sem pressupor a solução;
- existe evidência de recorrência ou valor sistêmico;
- a fronteira entre biblioteca e produto está definida;
- as áreas afetadas participaram da intenção e dos critérios;
- estados, conteúdo, responsividade e acessibilidade foram considerados;
- impacto nos consumidores e estratégia de adoção são conhecidos.

## Pronto para entregar

Uma mudança no sistema está concluída quando:

- o código-fonte implementa o contrato aprovado;
- Docs, Controls e stories explicam uso, variantes e limites;
- interação, acessibilidade, tipos e build passam nos gates;
- a paridade visual relevante foi revisada;
- documentação técnica e orientação profissional não se contradizem;
- mudanças públicas têm changeset e plano de migração quando necessário;
- nenhuma possibilidade futura é descrita como funcionalidade disponível.

---

## Como lideranças podem revisar sem abrir o código

1. Leia a **intenção** na documentação (aba Docs no upstream).
2. Compare stories de estados e variações no Canvas.
3. Use Controls para desafiar conteúdo e configuração.
4. Revise em viewport menor e com foco visível.
5. Pergunte qual métrica, risco ou qualidade a mudança melhora.
6. Registre a decisão e os impactos, não apenas a aprovação visual.

---

> **Princípio de governança**: o sistema evolui quando uma decisão local se prova
> valiosa como decisão compartilhada. Nem toda boa solução de produto deve virar
> componente; **toda mudança de componente deve servir a mais do que uma tela**.
