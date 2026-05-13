import { PersonaDto } from '../dto/persona.dto';
import { MiembroDto } from '../dto/miembro.dto';
import { EntrenadorDto } from '../dto/entrenador.dto';
import { OperadorDto } from '../dto/operador.dto';

export interface LoginResponseDto {
  token: string;
  rol: PersonaDto['rol'];
  cedula: string;
  nombre_completo: string;
  correo: string;
  perfil_completo: PersonaDto | MiembroDto | EntrenadorDto | OperadorDto;
}
