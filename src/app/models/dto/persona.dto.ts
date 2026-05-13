export interface PersonaDto {

  cedula: string;

  primer_nombre: string;

  segundo_nombre?: string;

  primer_apellido: string;

  segundo_apellido: string;

  correo: string;

  telefono: string;

  fecha_nacimiento: string;

  rol: 'administrador' | 'miembro' | 'entrenador' | 'operador';

}
