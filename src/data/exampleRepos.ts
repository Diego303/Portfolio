// REPOS DE EJEMPLO: estos dos no existen todavía. Cámbialos por repos reales (y muévelos a `projects`
// en cv.json con category "opensource" y su `github`) o bórralos.
export const EXAMPLE_REPOS = [
  {
    name: "mcp-server-plantilla",
    context: "GitHub · ejemplo",
    description:
      "Plantilla de MCP server en Python con herramientas de ejemplo, descripciones pensadas para el modelo, tests y despliegue en contenedor.",
    highlights: ["Herramientas con superficie mínima", "Tests y contenedor listos"],
    tags: ["MCP", "Python", "Docker"],
  },
  {
    name: "agente-k8s-helm",
    context: "GitHub · ejemplo",
    description:
      "Agente pequeño desplegado en Kubernetes con un chart de Helm: configuración, probes, escalado horizontal y trazas OpenTelemetry.",
    highlights: ["Chart de Helm con HPA y probes", "Trazas de cada llamada a modelo"],
    tags: ["LangChain", "Kubernetes", "Helm", "OpenTelemetry"],
  },
];
