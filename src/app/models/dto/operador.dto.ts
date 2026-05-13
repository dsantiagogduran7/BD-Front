import { PersonaDto } from './persona.dto';

export interface OperadorDto extends PersonaDto {

  nivel_tecnico:
    | 'basico'
    | 'intermedio'
    | 'avanzado'
    | 'experto';

  especialidad:
    | 'mecanico'
    | 'electrico'
    | 'inspeccion'
    | 'gestion_instalaciones';

  tipo_operador:
    | 'preventivo'
    | 'correctivo'
    | 'locativo';

}
