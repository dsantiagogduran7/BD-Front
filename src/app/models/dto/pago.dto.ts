export interface PagoDto {
  id_pago: number;
  metodo_pago: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia';
  fecha_pago: string;
  valor_pagado: number;
  miembro_cedula: string;
  nombre_miembro: string;
  correo_miembro: string;
  telefono_miembro: string;
  fecha_inicio_membresia: string;
  fecha_fin_membresia: string;
  estado_membresia: 'activa' | 'inactiva' | 'vencida' | 'suspendida';
  plan_id: number;
  plan_duracion: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  plan_precio: number;
}
