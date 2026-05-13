export interface ContenidoDto {

  id_contenido: number;

  titulo: string;

  descripcion: string;

  tipo_contenido:
    | 'video'
    | 'articulo'
    | 'guia'
    | 'tutorial'
    | 'podcast'
    | 'infografia';

  autor: string;

  fecha_publicacion: string;

  deporte: string;

  url_del_recurso?: string;

}
