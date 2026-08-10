export type Relevance = "alta" | "media" | "baja";

export type BookInsight = {
  titulo: string;
  autor: string | null;
  categoria: string | null;
  ideas_clave: string[];
  aplicacion_vida_diaria: string;
  aplicacion_contenido: string;
  aplicacion_profesional: string;
  frase_destacada: string | null;
  nivel_relevancia: Relevance;
};

export type BookCard = BookInsight & {
  id: string;
  portada: string | null;
  createdAt: string;
};
