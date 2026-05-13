export interface MaquinaDto {

  codigo_serie: number;

  nombre_maquina: string;

  modelo: string;

  marca: string;

  tipo_maquina:
    | 'cardio'
    | 'fuerza'
    | 'funcional'
    | 'rehabilitacion'
    | 'pesas'
    | 'otra';

  estado:
    | 'operativa'
    | 'en_mantenimiento'
    | 'fuera_de_servicio'
    | 'en_reparacion';

  capacidad: number;

}
