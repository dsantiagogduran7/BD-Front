export interface ContenidoDto {
  id_contenido: number;
  titulo: string;
  descripcion: string;
  tipo_contenido: 'video' | 'articulo' | 'guia' | 'tutorial' | 'podcast' | 'infografia';
  duracion?: number;
  autor: string;
  fecha_publicacion: string;
  url_del_recurso?: string;
  id_deporte: number;
  deporte_nombre: string;
}
