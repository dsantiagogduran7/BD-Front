import { PersonaDto } from '../dto/persona.dto';

export interface LoginRequestDto {
  correo: string;
  password: string;
}

export type RolLogin = PersonaDto['rol'];
