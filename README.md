# BuildingProgressBlueprint — SKR Design System

Componente React para visualização técnica e acompanhamento de obras em tempo real para os clientes da **SKR**. O componente transforma fotos de empreendimentos em blueprints canônicos via **Magic Hour** e projeta a evolução física percentual (0% a 100%) em camadas no cliente.

---

## 🏛️ Arquitetura

```text
BuildingProgressBlueprint (React / Client)
        │
        ├── Imagem/foto do empreendimento
        ├── % real da obra (ex: 50%)
        │
        ▼
POST /api/building-blueprint (Next.js Server Route Handler)
        │
        ├── Valida entrada (Zod)
        ├── Verifica blueprint canônico existente no cache (SHA-256)
        │
        ▼
BlueprintService (Server-only)
        │
        ▼
Magic Hour SDK (AI Image Editor / modelo compatível com o plano)
        │
        ▼
Blueprint Canônico Gerado (armazenado/cacheado)
        ├── PNG RGBA com fundo transparente
        └── Extremidades verticais com feixes cilíndricos azul claro
        │
        ▼
BuildingProgressBlueprint (Client Rendering)
        │
        ├── Blueprint base canônico
        ├── Revelação vertical da foto (CSS transform / linha divisória)
        ├── Percentual construído em destaque
        └── Barra contínua de progresso, sem atalhos
```

### Regras Críticas de Arquitetura

1. **A chave da API Magic Hour NUNCA vai para o client**:
   - `lib/magic-hour/client.ts` possui guarda de segurança estrita `if (typeof window !== "undefined") throw Error`.
   - Somente a Route Handler (`app/api/building-blueprint/route.ts`) conversa com o SDK.
2. **Cache por foto/versão no processo atual**:
   - Requisições repetidas na mesma instância reutilizam o blueprint gerado.
   - Para incorporar o componente em produção com várias instâncias, persista o resultado em storage compartilhado; o cache em memória deste protótipo não garante uma única chamada à IA entre instâncias ou reinicializações.
3. **Progresso 100% orientado a dados reais da SKR**:
   - A IA não estima porcentagem da obra. Depois da geração, o componente anima de 0% até o valor fornecido pelo produto.

---

## 🚀 Como Usar

### 1. Instalação e Requisitos

Defina a chave no seu ambiente (`.env.local`):

```bash
MAGIC_HOUR_API_KEY=sua_chave_aqui
```

> **Nota de Desenvolvimento:** Sem chave, fotos enviadas como PNG, JPG ou WEBP usam uma conversão local de bordas para demonstrar o fluxo. Esse resultado é uma visualização técnica de demonstração, não uma geração por IA. Com a chave configurada, o servidor consulta o plano da conta antes do upload: Free usa Qwen Image 2.1 em 640px; Creator, Pro e Business usam Nano Banana 2 em 2k. Gera uma imagem por pedido. A resolução reduzida do Free pode limitar detalhes finos. Falhas da API permitem retry.

A imagem de exemplo da página inicial já recebe um blueprint preparado localmente no servidor, mesmo com a chave configurada. Abrir ou atualizar o playground não envia esse exemplo ao Magic Hour nem consome créditos. Uma foto enviada pelo usuário continua usando a IA quando a chave estiver configurada.

### Falha de geração no ambiente local

O saldo de créditos não libera modelos ou resoluções restritos a planos pagos. Uma conta Free com créditos pode receber **HTTP 402** ao solicitar Nano Banana 2 ou 2k. O servidor seleciona uma configuração compatível com o plano para evitar essa recusa. Um 402 remanescente é retornado como `billing_restricted`, sem concluir apenas pelo status que o saldo é zero. O upload pode concluir normalmente antes da recusa. O motivo seguro também fica disponível no console e no nome acessível do estado de erro. A interface mantém somente “Tentar novamente”.

Para testar uploads pela conversão local, sem chamar a IA, inicie o projeto com a chave vazia apenas nesse comando:

```bash
MAGIC_HOUR_API_KEY= pnpm dev
```

Para gerar pela IA, use `pnpm dev` com a chave válida e saldo suficiente na conta Magic Hour. Consulte as [restrições de modelos e resolução](https://docs.magichour.ai/api-reference/models). Erros de autenticação, limite de requisições e falha de geração têm códigos próprios; nenhuma resposta bruta do provedor ou credencial é enviada ao navegador.

O blueprint contém somente linhas sobre transparência real, usando o azul SKR `#0071e3` com destaques `#dbeafe`. O destaque acompanha as arestas externas dos volumes retangulares principais projetados para a frente: duas fachadas principais têm quatro feixes, um par por volume. Cada feixe reúne sete linhas finas, com pontas arredondadas e perfil cilíndrico discreto. Montantes, brises, colunas internas, divisões de painéis, janelas e varandas permanecem finos, mesmo quando atravessam vários pavimentos. O componente não usa card: não tem superfície, borda ou sombra, e se integra diretamente ao fundo do produto. Uma máscara suave esmaece as quatro bordas e os cantos da composição, mantendo seu centro nítido. A grade SKR aparece entre os traços; slider e scan não acrescentam painéis ou grades adicionais.

A interface final contém apenas a composição foto/blueprint, o percentual e a barra contínua. Não há abas, atalhos, botões superiores ou controle de tela cheia. Arraste uma imagem para o componente ou clique na imagem para enviar ou substituir o arquivo; o processamento começa automaticamente. Sem imagem inicial, aparece somente uma área de envio com uma instrução curta. O upload também funciona pelo teclado.

A saída da IA passa por remoção do fundo e de preenchimentos internos antes de virar PNG RGBA. A prévia local usa os pixels da foto enviada; URLs remotas exigem a IA configurada. O cache inclui a versão do estilo, evitando reaproveitar imagens antigas com fundo escuro. Ao usar `initialBlueprintUrl` ou um adaptador externo, forneça uma imagem transparente no mesmo enquadramento da foto.

Na geração por IA, o servidor corrige a orientação EXIF e encaixa a foto inteira em um canvas com proporção suportada, usando somente margens brancas adicionais. A requisição envia essa proporção explicitamente. Na saída, o servidor compensa o arredondamento de resolução do modelo (até 16 pixels por eixo) e remove apenas as margens que adicionou. A composição conserva a proporção da foto e o limite de validação de 1%; um canvas de proporção incompatível continua sendo rejeitado.

O upload aceita PNG, JPG e WEBP até 10 MB. Durante a geração e preparação, a área inteira do componente é ocupada por um scan blueprint transparente: desenho técnico e uma linha azul em varredura contínua sobre o fundo do produto. O desenho de carregamento tem 14 pavimentos, janelas com montantes, varandas, lajes, estrutura interna, cobertura e cotas finas. Somente as extremidades verticais recebem os sete fios arredondados, com o mesmo perfil cilíndrico azul SKR do resultado. A ilustração de preparação mantém sua proporção e não representa um percentual de processamento. Imagens e porcentagem permanecem ocultas.

A saída começa somente depois de original e blueprint serem carregados e decodificados e de duas etapas de pintura estabilizarem o layout. Fades simultâneos de 400 ms retiram o scan e revelam somente o blueprint, com número e barra em 0%. Após uma pausa de 200 ms, foto, número e slider avançam juntos até o percentual real em 1,4 segundo, com desaceleração suave. A foto aparece de baixo para cima, preservando o alinhamento com o blueprint. Todos os exemplos usam 50%; a prop `progress` continua aceitando o valor real do empreendimento. Esse avanço representa a parte construída, sem simular um percentual do processamento por IA.

Uma nova geração volta à apresentação em 0%. Alterações do percentual externo durante o avanço continuam a partir do valor visível até o novo destino. Ajustar a barra interrompe a animação e assume o valor escolhido; `onProgressChange` é chamado apenas por essa interação, nunca pelos quadros da animação. A substituição da imagem e o unmount cancelam qualquer avanço pendente.

O percentual real construído aparece ao lado da imagem, sem legenda, em Barlow Condensed bold: uma tipografia alta e impactante, com o símbolo de porcentagem menor. A linha que delimita a parte construída fica sem texto. Ocultar o slider com `showProgressSlider={false}` mantém o indicador principal visível. Ao incorporar o componente, leve também os arquivos de `public/fonts/` e o token `--font-progress-display` do tema.

Para revisar a animação, abra `/animation-preview` com `pnpm run dev`. Essa prévia usa imagens locais: mantém o processamento em loop até “Revelar resultado”, oferece “Simular falha” e permite repetir. Não chama a API de IA.

A cobertura respeita os limites do componente em desktop e mobile. A varredura e a revelação da foto usam transform e opacity. Com `prefers-reduced-motion`, a linha fica estática, os fades duram 150 ms e, depois de mostrar 0%, o resultado assume o percentual real sem varredura gradual.

### 2. Uso no seu componente ou página

```tsx
import { BuildingProgressBlueprint } from "@/components/building-progress";

export default function PaginaEmpreendimento() {
  return (
    <BuildingProgressBlueprint
      buildingId="pinheiros-01"
      imageUrl="https://cdn.skr.com.br/empreendimentos/pinheiros.jpg"
      progress={50}
    />
  );
}
```

### 3. Propriedades (`BuildingProgressBlueprintProps`)

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `buildingId` | `string` | `"skr-building-01"` | Identificador do empreendimento |
| `imageUrl` | `string` | `undefined` | URL da foto real ou render oficial; sem ela, o componente abre a área de upload |
| `progress` | `number` | `50` | Porcentagem real da obra (0 a 100) vinda do backend; destino do avanço após a geração |
| `initialBlueprintUrl` | `string` | `undefined` | URL pré-cacheada do blueprint (se já existir no BD) |
| `showProgressSlider` | `boolean` | `true` | Exibe o controle de porcentagem |
| `generateBlueprint` | `(input: BlueprintGeneratorInput) => Promise<string>` | Route Handler local | Adaptador opcional para integrar outra API; recebe foto/arquivo, ID, force e AbortSignal e retorna a URL do blueprint |
| `onBlueprintGenerated` | `(url: string) => void` | `undefined` | Callback após o resultado ser carregado e validado |
| `onProgressChange` | `(progress: number) => void` | `undefined` | Callback do controle de progresso |

---

## 📂 Estrutura de Arquivos

```text
components/
└── building-progress/
    ├── BuildingProgressBlueprint.tsx   # Componente pai e orquestrador
    ├── BlueprintViewer.tsx             # Composição, upload pela imagem e percentual
    ├── ProgressComposition.tsx         # Enquadramento compartilhado das imagens
    ├── ProgressOverlay.tsx             # Overlay de nível laser e revelação da construção
    ├── BlueprintSkeleton.tsx           # Export compatível do scan blueprint
    ├── BlueprintError.tsx              # Feedback de erro e ação de tentar novamente
    └── index.ts                        # Exports públicos

components/blueprint/blueprint-scan/
    ├── BlueprintScan.tsx               # Desenho técnico e varredura minimalista
    └── BlueprintScanCover.tsx          # Cobertura e fade após preparação

lib/
├── magic-hour/
│   ├── client.ts                      # Client Magic Hour singleton (server-only)
│   ├── generate-blueprint.ts          # Serviço de geração e cache canônico
│   └── prompts.ts                     # Prompt restritivo de preservação geométrica
└── building-progress/
    ├── types.ts                       # Tipos TypeScript do domínio
    ├── blueprint-linework.ts          # Transparência e hierarquia de traços
    ├── prepare-visual.ts              # Decodificação e barreira antes do reveal
    └── mock-buildings.ts              # Empreendimentos de demonstração (Pinheiros, Jardins...)

app/
├── api/
│   └── building-blueprint/
│       └── route.ts                   # Route Handler POST /api/building-blueprint
├── page.tsx                           # Playground interativo do Portal do Proprietário
├── layout.tsx                         # Layout com grid e ambient backdrop SKR
└── skr-theme.css                      # Tokens canônicos do SKR Design System (DESIGN.md)

test/
└── building-progress.test.ts          # Testes unitários (hash, prompt, cache, limites 0-100%)
```

---

## 🧪 Testes

Para rodar a suíte de testes unitários:

```bash
pnpm run test
```

Para rodar o build de produção:

```bash
pnpm run build
```

---

## 🎨 SKR Design System

O componente segue rigorosamente as diretrizes documentadas em `DESIGN.md`:
- **Fontes**: Montserrat na interface; Barlow Condensed (`700`) local no percentual construído
- **Cor Primária**: `#0071e3` (`--brand-primary`)
- **Superfícies**: `#ffffff` (`--surface-canvas`), `#fbfbfd` (`--surface-card`)
- **Bordas arredondadas**: `20px` (cards), `12px` (controles), `9999px` (pills e botões)
- **Sombras**: Três camadas sutis (`--shadow-card`)
- **Acessibilidade**: Suporte a `prefers-reduced-motion` e atributos ARIA
