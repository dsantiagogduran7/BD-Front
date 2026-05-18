import { PlanDto } from './plan.dto';

export interface MembresiaDto {
  miembro_cedula: string;
  nombre_miembro: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activa' | 'inactiva' | 'vencida' | 'suspendida';
  plan: PlanDto;
  pagos?: any[];
}
