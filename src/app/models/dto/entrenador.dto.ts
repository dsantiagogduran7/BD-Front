import { PersonaDto } from './persona.dto';

export interface EntrenadorDto extends PersonaDto {

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

  deportes?: string[];

}
