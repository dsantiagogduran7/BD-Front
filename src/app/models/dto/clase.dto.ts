export interface ClaseDto {
  id_clase: number;
  estado: 'programada' | 'cancelada' | 'finalizada';
  comentario: string;
  cupos: number;
  fecha: string;
  sala: { id_sala: number; capacidad: number } | null;
  horario: { id_horario: number; dia_semana: string; hora_inicio: string; hora_fin: string } | null;
  deporte: { id_deporte: number; nombre: string; descripcion: string } | null;
  cedula_entrenador: string;
  nombre_entrenador: string;
}

export interface ClaseFormDto {
  id_clase: number;
  estado: 'programada' | 'cancelada' | 'finalizada';
  comentario: string;
  cupos: number;
  fecha: string;
  id_sala: number;
  id_horario: number;
  id_deporte: number;
  cedula_entrenador: string;
}
