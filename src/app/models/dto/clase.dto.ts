export interface ClaseDto {

  id_clase: number;

  deporte: string;

  entrenador: string;

  sala: number;

  fecha: string;

  hora_inicio: string;

  hora_fin: string;

  cupos: number;

  estado:
    | 'programada'
    | 'cancelada'
    | 'finalizada';

  comentario?: string;

}
