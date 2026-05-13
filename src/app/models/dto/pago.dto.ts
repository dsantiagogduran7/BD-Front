export interface PagoDto {

  id_pago: number;

  miembro: string;

  cedula: string;

  metodo_pago:
    | 'efectivo'
    | 'tarjeta_credito'
    | 'tarjeta_debito'
    | 'transferencia';

  fecha_pago: string;

  valor_pagado: number;

  plan: string;

  estado_membresia:
    | 'activa'
    | 'inactiva'
    | 'vencida'
    | 'suspendida';

}
