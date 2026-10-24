// Textos del portfolio que no salen de cv.json: cabecera, inicio y textos laterales de cada sección.

export const META_DESCRIPTION =
  "Diego Alba Ruiz, AI Engineer. Plataformas de agentes de IA y DevOps: agentes, sistemas multi-agente, MCP, RAG, guardrails y Kubernetes.";

export const CV_PDF = "cv-diego-alba-ruiz.pdf";

export const FOOTER_YEAR = "2026";

export const NAV = [
  { href: "#sobre", label: "Sobre mí" },
  { href: "#experiencia", label: "Experiencia" },
  { href: "#arquitectura", label: "Arquitectura" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#documentos", label: "Documentos" },
  { href: "#contacto", label: "Contacto" },
];

// Paletas del selector. Los colores de cada una están en src/styles/v4.css (:root[data-palette=…]).
export const PALETTES = [
  { id: "nebulosa", name: "Nebulosa", desc: "Petróleo, turquesa y ámbar", dots: ["#070d12", "#6cc6c8", "#f2e3c6", "#e8a86a"] },
  { id: "violeta", name: "Violeta", desc: "Morado, azul y rosa", dots: ["#07060c", "#9d8cff", "#6fb6ff", "#ff8fc7"] },
  { id: "aurora", name: "Aurora", desc: "Verde boreal y azul hielo", dots: ["#050c0b", "#5fe0b0", "#8ec9ff", "#c6a8ff"] },
  { id: "ocaso", name: "Ocaso", desc: "Coral, rosa y oro", dots: ["#0d0807", "#ff9a6b", "#f07a8e", "#ffd27a"] },
];

export const HERO = {
  hello: "AI Engineer en NTT Data",
  role: "Plataformas de agentes de IA y DevOps.",
  thesis: "Diseño agentes de IA y la plataforma que los lleva a producción.",
  facts: [
    { value: "+3 años", label: "en NTT Data, desde 2023" },
    { value: "IA + DevOps", label: "de la idea al clúster" },
    { value: "CKAD", label: "y 3 certificaciones más" },
  ],
};

export const SECTIONS = {
  experiencia: "Mi puesto actual a fondo y, debajo, los anteriores.",
  experienciaEtapas: "Las etapas se solapan: cada una se apoya en la anterior.",
  caso: "Un proyecto contado de principio a fin, anonimizado.",
  arquitectura:
    "La plataforma de agentes con la que trabajo: cada componente es un servicio en su propio pod de Kubernetes, con escalado independiente, y todo el recorrido de una petición queda trazado.",
  arquitecturaPie:
    "Recorrido de una petición: API, guardrails de entrada, orquestador, agentes especializados con su contexto y herramientas, LLM gateway y guardrails de salida.",
  // {n} se sustituye por el número de áreas de techexp, en letra.
  capacidades: "Lo que sé hacer, en {n} áreas. Elige una para ver el resumen.",
  proyectos: "Repos públicos, proyectos profesionales en NTT Data (código privado) y académicos.",
  documentos: "Notas técnicas sobre lo que construyo: agentes, plataformas y DevOps.",
  // {n} se sustituye por el número de skills de cv.json.
  stack: "Las {n} tecnologías con las que trabajo, por dominio.",
  formacion: "Estudios y certificaciones.",
  contacto: "Si quieres montar una plataforma de agentes o llevar un caso de uso a producción, hablemos.",
};
