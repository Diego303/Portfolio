import { defineCollection, z } from "astro:content";

// Un post = un JSON en src/content/blog/<slug>.json. Se publica en blog/<slug>.html
// y aparece como tarjeta en Documentos, ordenado por fecha.
const block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("h2"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: z.array(z.string()).min(1) }),
]);

const blog = defineCollection({
  type: "data",
  schema: z.object({
    code: z.string(), // "DOC-001"
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(), // "2026-05-12"
    readingTime: z.number().int().positive(), // minutos
    tags: z.array(z.string()),
    cover: z.string(), // ruta dentro de public/, p. ej. "blog/<slug>.webp"
    body: z.array(block).min(1),
  }),
});

export const collections = { blog };
