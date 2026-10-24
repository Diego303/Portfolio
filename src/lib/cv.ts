import data from "@cv";
import type { CV } from "@/cv";

// Tipar el JSON contra src/cv.d.ts: si cv.json cambia de forma, `astro check` falla aquí.
export const cv: CV = data;
