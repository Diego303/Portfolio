// URL dentro del sitio publicado bajo `base` (p. ej. "/Portfolio/cv-diego-alba-ruiz.pdf").
export function url(path = ""): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, "");
  return `${base}/${path.replace(/^\/+/, "")}`;
}

const MONTHS_LONG = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTHS_ABBR = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

// "Septiembre 2023" -> "sept. 2023"
function monthYear(s: string): string {
  const [m, y] = s.trim().split(/\s+/);
  const i = MONTHS_LONG.indexOf(m.toLowerCase());
  return i < 0 ? s : `${MONTHS_ABBR[i]} ${y}`;
}

// Periodo de un puesto: "sept. 2023 – hoy", "mar. 2023 – jul. 2023" o "sept. 2022" si empieza y acaba el mismo mes.
export function period(start: string, end: string | null): string {
  if (end === null) return `${monthYear(start)} – hoy`;
  if (end === start) return monthYear(start);
  return `${monthYear(start)} – ${monthYear(end)}`;
}

// Fecha de un documento: "12 may 2026"
export function docDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const NUMBERS = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce"];

// 8 -> "ocho" (para textos como "en ocho áreas")
export function inWords(n: number): string {
  return NUMBERS[n] ?? String(n);
}
