// Resumen de cada área de Capacidades, por nombre de techexp en cv.json.
// El detalle ("Ver todo el detalle") son los highlights del JSON. Un área sin resumen aquí
// muestra directamente sus highlights.
export const CAPABILITY_SUMMARIES: Record<string, { summary: string; points: string[] }> = {
  "Agentic AI y plataformas de agentes": {
    summary: "Agentes y sistemas multi-agente para empresa, sobre una plataforma propia.",
    points: ["Orquestación multi-agente con A2A", "MCP servers propios, RAG y memoria", "LLM gateway y guardrails de seguridad"],
  },
  "Desarrollo con agentes de código": {
    summary: "Desarrollo diario con Claude Code y Codex.",
    points: ["Harness engineering: skills, subagentes y hooks", "Prompt y context engineering", "Verificación automática con tests y linters"],
  },
  "Platform Engineering y DevOps": {
    summary: "Llevar sistemas a producción y mantenerlos ahí.",
    points: ["Kubernetes y OpenShift sobre Azure", "Infraestructura como código con Terraform y Ansible", "Pipelines CI/CD"],
  },
  Observabilidad: {
    summary: "Saber qué hace cada servicio y cada agente en todo momento.",
    points: ["Trazas, métricas y logs con OpenTelemetry", "Alertas y dashboards con New Relic", "Autoremediaciones"],
  },
  "Machine learning e IA generativa": {
    summary: "De las redes neuronales a la IA generativa en procesos reales.",
    points: ["Modelos con TensorFlow", "IA generativa aplicada a negocio", "LLMs locales con Ollama"],
  },
  "Backend y automatización": {
    summary: "Donde empecé: Python, APIs y automatización.",
    points: ["Automatizaciones en Python", "APIs y microservicios", "Procesos programados con Rundeck y Airflow"],
  },
  "Casos de uso y liderazgo técnico": {
    summary: "Del análisis con negocio a la operación.",
    points: ["Casos de uso de principio a fin", "Herramientas a medida para cada cliente", "Preparado para coordinar un equipo técnico"],
  },
};
