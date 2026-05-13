export interface MembresiaDto {

  id_plan: number;

  duracion:
    | 'mensual'
    | 'trimestral'
    | 'semestral'
    | 'anual';

  precio: number;

  estado:
    | 'activa'
    | 'inactiva'
    | 'vencida'
    | 'suspendida';

  fecha_inicio: string;

  fecha_fin: string;

}
