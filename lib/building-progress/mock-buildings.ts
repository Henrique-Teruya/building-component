import { BuildingData } from "./types";

// High-fidelity architectural render for SKR Pinheiros
const PINHEIROS_SVG = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#93c5fd" />
      <stop offset="60%" stop-color="#dbeafe" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="50%" stop-color="#7dd3fc" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
    <linearGradient id="concreteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="50%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
    <linearGradient id="timberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b45309" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="1000" height="1300" fill="url(#skyGrad)" />

  <!-- Ground / Landscaping -->
  <rect x="0" y="1120" width="1000" height="180" fill="#334155" />
  <rect x="0" y="1100" width="1000" height="20" fill="#15803d" opacity="0.6" />

  <!-- Tower Shadow -->
  <polygon points="760,1120 900,1220 300,1220 240,1120" fill="#000000" opacity="0.15" />

  <!-- Main Facade Massing -->
  <rect x="240" y="220" width="520" height="890" fill="url(#concreteGrad)" />

  <!-- Recessed Terrace Core -->
  <rect x="290" y="260" width="420" height="820" fill="#1e293b" />

  <!-- Slabs & Balconies with warm timber soffits -->
  ${Array.from({ length: 16 })
    .map(
      (_, i) => `
    <g transform="translate(0, ${260 + i * 50})">
      <!-- Slab -->
      <rect x="240" y="0" width="520" height="10" fill="#f8fafc" />
      <rect x="240" y="10" width="520" height="4" fill="url(#timberGrad)" />
      <!-- Glazing -->
      <rect x="300" y="14" width="400" height="34" fill="url(#glassGrad)" opacity="0.75" />
      <!-- Glass Balustrade -->
      <rect x="270" y="32" width="460" height="16" fill="#e0f2fe" opacity="0.65" stroke="#ffffff" stroke-width="0.8" />
      <!-- Vegetation planters -->
      <rect x="280" y="40" width="30" height="6" fill="#16a34a" />
      <rect x="690" y="40" width="30" height="6" fill="#16a34a" />
    </g>
  `
    )
    .join("")}

  <!-- Vertical Brise-Soleil Architectural Fins -->
  <line x1="330" y1="220" x2="330" y2="1100" stroke="#f1f5f9" stroke-width="6" />
  <line x1="430" y1="220" x2="430" y2="1100" stroke="#f1f5f9" stroke-width="4" />
  <line x1="500" y1="200" x2="500" y2="1100" stroke="#f8fafc" stroke-width="8" />
  <line x1="570" y1="220" x2="570" y2="1100" stroke="#f1f5f9" stroke-width="4" />
  <line x1="670" y1="220" x2="670" y2="1100" stroke="#f1f5f9" stroke-width="6" />

  <!-- Penthouse Crown -->
  <polygon points="300,220 380,160 620,160 700,220" fill="#0f172a" />
  <rect x="380" y="170" width="240" height="48" fill="url(#glassGrad)" opacity="0.85" />

  <!-- Base / Lobby / Street Realm -->
  <rect x="200" y="1040" width="600" height="80" fill="#0f172a" />
  <rect x="360" y="1050" width="280" height="70" fill="url(#glassGrad)" opacity="0.9" />
  <text x="500" y="1090" fill="#ffffff" font-family="Montserrat, sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="4">SKR PINHEIROS</text>
</svg>
`).toString("base64")}`;

// High-fidelity architectural render for SKR Jardins
const JARDINS_SVG = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1300" width="1000" height="1300">
  <defs>
    <linearGradient id="skyJardins" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="100%" stop-color="#f0f9ff" />
    </linearGradient>
    <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#78350f" />
      <stop offset="50%" stop-color="#b45309" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <rect width="1000" height="1300" fill="url(#skyJardins)" />
  <rect x="0" y="1140" width="1000" height="160" fill="#1e293b" />

  <!-- Boutique Tower Shape -->
  <rect x="260" y="240" width="480" height="880" fill="#0f172a" />
  
  ${Array.from({ length: 12 })
    .map(
      (_, i) => `
    <g transform="translate(0, ${270 + i * 68})">
      <rect x="260" y="0" width="480" height="8" fill="url(#bronzeGrad)" />
      <rect x="300" y="12" width="400" height="48" fill="#38bdf8" opacity="0.7" />
      <!-- Terraced garden boxes -->
      <rect x="280" y="44" width="440" height="16" fill="#15803d" opacity="0.8" />
    </g>
  `
    )
    .join("")}

  <text x="500" y="1110" fill="#d97706" font-family="Montserrat, sans-serif" font-size="18" font-weight="700" text-anchor="middle" letter-spacing="4">SKR JARDINS • LORENA</text>
</svg>
`).toString("base64")}`;

export const MOCK_BUILDINGS: BuildingData[] = [
  {
    id: "pinheiros-01",
    name: "SKR Pinheiros",
    location: "Rua dos Pinheiros, 850 — São Paulo, SP",
    imageUrl: PINHEIROS_SVG,
    progress: 68,
    lastUpdated: "Hoje, 11:30",
    deliveryForecast: "Novembro / 2026",
    phases: [
      { id: "fund", name: "Fundação", progress: 100, status: "completed" },
      { id: "estr", name: "Estrutura", progress: 100, status: "completed" },
      { id: "fach", name: "Fachada", progress: 72, status: "in_progress" },
      { id: "inst", name: "Instalações", progress: 48, status: "in_progress" },
      { id: "acab", name: "Acabamentos", progress: 21, status: "in_progress" },
    ],
  },
  {
    id: "jardins-02",
    name: "SKR Jardins",
    location: "Alameda Lorena, 1420 — Jardins, SP",
    imageUrl: JARDINS_SVG,
    progress: 92,
    lastUpdated: "Ontem, 16:45",
    deliveryForecast: "Abril / 2026",
    phases: [
      { id: "fund", name: "Fundação", progress: 100, status: "completed" },
      { id: "estr", name: "Estrutura", progress: 100, status: "completed" },
      { id: "fach", name: "Fachada", progress: 100, status: "completed" },
      { id: "inst", name: "Instalações", progress: 95, status: "in_progress" },
      { id: "acab", name: "Acabamentos", progress: 84, status: "in_progress" },
    ],
  },
  {
    id: "moema-03",
    name: "SKR Moema Arte",
    location: "Av. Ibirapuera, 2100 — Moema, SP",
    imageUrl: PINHEIROS_SVG,
    progress: 35,
    lastUpdated: "Há 2 dias",
    deliveryForecast: "Março / 2027",
    phases: [
      { id: "fund", name: "Fundação", progress: 100, status: "completed" },
      { id: "estr", name: "Estrutura", progress: 62, status: "in_progress" },
      { id: "fach", name: "Fachada", progress: 12, status: "in_progress" },
      { id: "inst", name: "Instalações", progress: 0, status: "pending" },
      { id: "acab", name: "Acabamentos", progress: 0, status: "pending" },
    ],
  },
  {
    id: "vila-mariana-04",
    name: "SKR Vila Mariana",
    location: "Rua Domingos de Morais, 1200 — SP",
    imageUrl: PINHEIROS_SVG,
    progress: 0,
    lastUpdated: "Esta semana",
    deliveryForecast: "Dezembro / 2027",
    phases: [
      { id: "fund", name: "Fundação", progress: 0, status: "pending" },
      { id: "estr", name: "Estrutura", progress: 0, status: "pending" },
      { id: "fach", name: "Fachada", progress: 0, status: "pending" },
      { id: "inst", name: "Instalações", progress: 0, status: "pending" },
      { id: "acab", name: "Acabamentos", progress: 0, status: "pending" },
    ],
  },
];
