import { PersonaDto } from './persona.dto';

export interface EntrenadorDto extends PersonaDto {

  password?: string;

  tipo_entrenamiento:
    | 'fuerza'
    | 'aerobico'
    | 'flexibilidad'
    | 'equilibrio';

  tiempo_experiencia: number;

  nivel_exigencia:
    | 'bajo'
    | 'moderado'
    | 'medio'
    | 'alto'
    | 'extremo';

  fecha_ingreso_sis: string;

  deportes?: { id_deporte: number; nombre: string }[];

}
