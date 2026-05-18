export interface PlanDto {
  id_plan: number;
  duracion: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  precio: number;
}
