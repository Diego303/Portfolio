// REPOS DE EJEMPLO: tarjetas open source provisionales que se muestran antes de los proyectos de cv.json.
// Ahora no hay ninguna: los repos reales van en `projects` de cv.json con category "opensource" y su `github`.
export interface ExampleRepo {
  name: string;
  context: string;
  description: string;
  highlights: string[];
  tags: string[];
}

export const EXAMPLE_REPOS: ExampleRepo[] = [];
