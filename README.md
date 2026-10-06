# BuildingProgressBlueprint — SKR Design System

Componente React para visualização técnica e acompanhamento de obras em tempo real para os clientes da **SKR**. O componente transforma fotos de empreendimentos em blueprints canônicos via **Magic Hour (modelo Nano Banana)** e projeta a evolução física percentual (0% a 100%) em camadas no cliente.

---

## 🏛️ Arquitetura

```text
BuildingProgressBlueprint (React / Client)
        │
        ├── Imagem/foto do empreendimento
        ├── % real da obra (ex: 68%)
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
Magic Hour SDK (Nano Banana / AI Image Editor)
        │
        ▼
Blueprint Canônico Gerado (armazenado/cacheado)
        │
        ▼
BuildingProgressBlueprint (Client Rendering)
        │
        ├── Blueprint base canônico
        ├── Overlay de progresso vertical (CSS clip-path / laser guide)
        ├── Marco de etapas: Fundação ✓ → Estrutura ✓ → Fachada 72% → Acabamentos 21%
        └── Modos: Progresso | Comparar (Slider) | Blueprint Técnico | Foto Real
```

### Regras Críticas de Arquitetura

1. **A chave da API Magic Hour NUNCA vai para o client**:
   - `lib/magic-hour/client.ts` possui guarda de segurança estrita `if (typeof window !== "undefined") throw Error`.
   - Somente a Route Handler (`app/api/building-blueprint/route.ts`) conversa com o SDK.
2. **Um único blueprint canônico por empreendimento**:
   - A IA é chamada **uma única vez** por foto/versão do prédio.
   - 10.000 clientes visualizando o mesmo prédio utilizam a versão em cache (zero chamadas adicionais à IA).
3. **Progresso 100% orientado a dados reais da SKR**:
   - A IA não estima porcentagem da obra. O avanço visual (0% a 100%) é renderizado instantaneamente pelo componente React.

---

## 🚀 Como Usar

### 1. Instalação e Requisitos

Defina a chave no seu ambiente (`.env.local`):

```bash
MAGIC_HOUR_API_KEY=sua_chave_aqui
```

> **Nota de Desenvolvimento:** Se a chave não for informada, o sistema entra em modo de demonstração técnica gerando o blueprint CAD vetorial de alta precisão automaticamente, garantindo que os testes funcionem sem travar o pipeline.

### 2. Uso no seu componente ou página

```tsx
import { BuildingProgressBlueprint } from "@/components/building-progress";

export default function PaginaEmpreendimento() {
  return (
    <BuildingProgressBlueprint
      buildingId="pinheiros-01"
      imageUrl="https://cdn.skr.com.br/empreendimentos/pinheiros.jpg"
      progress={68}
      projectName="SKR Pinheiros"
      location="Rua dos Pinheiros, 850 — São Paulo, SP"
    />
  );
}
```

### 3. Propriedades (`BuildingProgressBlueprintProps`)

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `buildingId` | `string` | *(obrigatório)* | Identificador único do empreendimento |
| `imageUrl` | `string` | *(obrigatório)* | URL da foto real ou render oficial do prédio |
| `progress` | `number` | *(obrigatório)* | Porcentagem real da obra (0 a 100) vinda do backend |
| `projectName` | `string` | `"SKR Empreendimento"` | Nome oficial do empreendimento |
| `location` | `string` | `"São Paulo, SP"` | Endereço ou localização |
| `phases` | `BuildingPhase[]` | *(calculado)* | Marcos das etapas (Fundação, Estrutura, Fachada...) |
| `initialBlueprintUrl` | `string` | `undefined` | URL pré-cacheada do blueprint (se já existir no BD) |
| `showControls` | `boolean` | `true` | Exibe as abas de modo (Progresso, Slider, Blueprint, Foto) |
| `defaultViewMode` | `"progress" \| "compare" \| "blueprint" \| "photo"` | `"progress"` | Modo inicial do visualizador |

---

## 📂 Estrutura de Arquivos

```text
components/
└── building-progress/
    ├── BuildingProgressBlueprint.tsx   # Componente pai e orquestrador
    ├── BlueprintViewer.tsx             # Visualizador multi-modo e slider de comparação
    ├── ProgressOverlay.tsx             # Overlay de nível laser e revelação da construção
    ├── BlueprintSkeleton.tsx           # Skeleton técnico com varredura arquitetônica
    ├── BlueprintError.tsx              # Card de erro com retry e fallback para foto
    └── index.ts                        # Exports públicos

lib/
├── magic-hour/
│   ├── client.ts                      # Client Magic Hour singleton (server-only)
│   ├── generate-blueprint.ts          # Serviço de geração e cache canônico
│   └── prompts.ts                     # Prompt restritivo de preservação geométrica
└── building-progress/
    ├── types.ts                       # Tipos TypeScript do domínio
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
npm test
```

Para rodar o build de produção:

```bash
npm run build
```

---

## 🎨 SKR Design System

O componente segue rigorosamente as diretrizes documentadas em `DESIGN.md`:
- **Fonte**: Montserrat (`400`, `600`, `700`, `800`)
- **Cor Primária**: `#0071e3` (`--brand-primary`)
- **Superfícies**: `#ffffff` (`--surface-canvas`), `#fbfbfd` (`--surface-card`)
- **Bordas arredondadas**: `20px` (cards), `12px` (controles), `9999px` (pills e botões)
- **Sombras**: Três camadas sutis (`--shadow-card`)
- **Acessibilidade**: Suporte a `prefers-reduced-motion` e atributos ARIA
