// Reparto del Stack por dominio, con los nombres exactos de `skills` en cv.json.
// El icono y el tooltip (keywords) salen del JSON. Si añades una skill al JSON, ponla en un grupo:
// el build falla si alguna queda sin grupo.
export const STACK_GROUPS = [
  {
    title: "Agentic AI",
    skills: [
      "MCP (Model Context Protocol)",
      "RAG",
      "A2A (Agent-to-Agent)",
      "Sistemas multi-agente",
      "LLM Gateway",
      "AI Guardrails",
      "Agentic AI",
      "Memoria de agentes",
      "Agent Skills",
      "Prompt & Context Engineering",
      "LangChain",
      "Ollama",
    ],
  },
  { title: "Desarrollo con IA", skills: ["Claude Code", "OpenAI Codex", "Harness Engineering"] },
  {
    title: "Plataforma y DevOps",
    skills: ["Kubernetes", "OpenShift", "Docker", "Terraform", "Ansible", "CI/CD", "Azure", "Linux", "Bash", "Nginx"],
  },
  { title: "Observabilidad", skills: ["OpenTelemetry", "New Relic"] },
  {
    title: "Backend, datos y ML",
    skills: ["Python", "API REST", "PostgreSQL", "Rundeck", "Apache Airflow", "TensorFlow", "Java"],
  },
  {
    title: "Frontend y herramientas",
    skills: ["JavaScript", "React", "Astro", "Vite", "HTML", "CSS", "Git", "GitHub"],
  },
];
