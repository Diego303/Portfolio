export interface CV {
  analyticsCode?: string;
  pageLayout?: string;
  basics: Basics;
  education: Array<Education>;
  certificates: Array<Certificates>;
  work: Array<Work>;
  skills: Array<Skills>;
  languages: Array<Languages>;
  interests: Array<Interests>;
  techexp: Array<TechExp>;
  projects: Array<Projects>;
  softSkills: Array<SoftSkills>;
  volunteer?: Array<Volunteer>;
  awards?: Array<Awards>;
  publications?: Array<Publications>;
  references?: Array<References>;
}

interface Basics {
  name: string;
  label: string;
  image: string;
  email: string;
  phone?: string;
  url: string;
  summary: string;
  theme?: string;
  profiles: Array<Profiles>;
  /** Párrafos de "Mi trayectoria" */
  story: Array<string>;
  /** Texto de "Lo que busco" */
  objective: string;
}

interface Profiles {
  icon: string;
  network: string;
  username: string;
  url: string;
}

/** Mes y año en español, p. ej. "Septiembre 2023" */
type MonthYear = string;

interface Work {
  name: string;
  position: string;
  location_type: string;
  url: string;
  startDate: MonthYear;
  endDate: MonthYear | null;
  summary: string;
  responsibilities: Array<string>;
  achievements?: Array<string>;
  /** Tecnología -> id de icono (mdi:…, simple-icons:…, ri:…). Partial porque TS infiere
   *  en cada puesto las claves de los demás como opcionales. */
  skills?: Partial<Record<string, string>>;
  /** Etapas del puesto; el puesto que las tiene se muestra a fondo */
  phases?: Array<Phase>;
  /** Áreas de trabajo; sus ítems son las responsabilidades agrupadas */
  areas?: Array<Area>;
}

interface Phase {
  name: string;
  period: string;
  summary: string;
  tech: Array<string>;
}

interface Area {
  name: string;
  icon: string;
  items: Array<string>;
}

interface Volunteer {
  organization: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: Array<string>;
}

interface Skills {
  icon: string;
  name: string;
  level: string;
  keywords: Array<string>;
}

interface Awards {
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

interface Certificates {
  name: string;
  /** Año */
  date: string;
  issuer: string;
  url: string;
}

interface Publications {
  name: string;
  publisher: string;
  releaseDate: string;
  url: string;
  summary: string;
}

interface Education {
  institution: string;
  url: string;
  area: string;
  studyType: string;
  /** Año */
  startDate: string;
  /** Año */
  endDate: string;
}

interface Languages {
  language: string;
  fluency: string;
}

/** "opensource" | "profesional" | "academico" */
type ProjectCategory = string;

interface Projects {
  name: string;
  category: ProjectCategory;
  context: string;
  isActive: boolean;
  description: string;
  highlights: Array<string>;
  tags: Array<string>;
  url: string;
  github?: string;
}

interface TechExp {
  name: string;
  icon: string;
  isActive: boolean;
  highlights: Array<string>;
}

interface SoftSkills {
  name: string;
  description: string;
}

interface Interests {
  name: string;
  keywords: Array<string>;
}

interface References {
  name: string;
  reference: string;
}
