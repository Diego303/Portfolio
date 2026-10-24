import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

// Posts de src/content/blog, del más antiguo al más reciente.
export async function getPosts(): Promise<Post[]> {
  return (await getCollection("blog")).sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

// Minúsculas y sin tildes, igual que normaliza la búsqueda en src/scripts/documentos.js.
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Texto en el que busca el buscador de documentos: código, título, resumen, etiquetas y cuerpo.
export function searchText({ data }: Post): string {
  const body = data.body.map((b) => (b.type === "ul" ? b.items.join(" ") : b.text));
  return normalize([data.code, data.title, data.description, ...data.tags, ...body].join(" "));
}
