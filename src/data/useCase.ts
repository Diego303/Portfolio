// AFINA ESTE CASO: cambia el sector, el problema y el resultado por los de tu proyecto real. Sin cifras si no puedes darlas.
export const USE_CASE = {
  tag: "Cliente corporativo · sector anonimizado",
  title: "Asistente con agentes sobre los sistemas internos de un cliente",
  steps: [
    {
      title: "El problema",
      text: "Los equipos necesitaban consultar documentación interna y actuar sobre varios sistemas propios desde un único punto, sin dar a un modelo acceso abierto a esos sistemas ni exponer datos sensibles.",
    },
    {
      title: "Qué construí",
      text: "Un sistema multi-agente sobre la plataforma: un orquestador que reparte el trabajo entre agentes especializados con A2A, RAG sobre la documentación del cliente, memoria de conversación y MCP servers propios que exponen solo las operaciones necesarias de cada sistema. Guardrails a la entrada y a la salida.",
    },
    {
      title: "Cómo lo desplegué",
      text: "Cada componente como servicio independiente en su pod de Kubernetes sobre Azure, con escalado horizontal, infraestructura como código y pipelines CI/CD. Los modelos, siempre a través del LLM gateway, y trazas OpenTelemetry de cada llamada a modelo y a herramienta.",
    },
    {
      title: "Qué cambió",
      text: "Un único punto de entrada en lugar de varias herramientas. Respuestas basadas en la documentación real del cliente. Acciones sobre sistemas internos con permisos acotados y trazables. Y una base reutilizable: el siguiente caso de uso parte de la misma plataforma.",
    },
  ],
  stack: ["LangChain", "A2A", "MCP", "RAG", "Guardrails", "Kubernetes", "Azure", "OpenTelemetry"],
};
