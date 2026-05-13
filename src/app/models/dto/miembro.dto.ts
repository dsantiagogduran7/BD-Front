import { PersonaDto } from './persona.dto';

export interface MiembroDto extends PersonaDto {

  altura: number;

  peso_actual: number;

  nivel_experiencia: 'novato' | 'avanzado' | 'profesional';

  membresia_estado?: 'activa' | 'inactiva' | 'vencida' | 'suspendida';

  plan_nombre?: string;

}
