import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosApiService } from '../../../../core/services/api/pagos-api.service';
import { PagoDto } from '../../../../models/dto/pago.dto';

@Component({
  selector: 'app-pagos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos-page.component.html',
  styleUrl: './pagos-page.component.css'
})
export class PagosPageComponent implements OnInit {

  busqueda: string = '';
  filtroMetodo: string = '';
  filtroEstado: string = '';
  mostrarModal: boolean = false;
  pagoSeleccionado: PagoDto | null = null;
  cargando: boolean = false;
  error: string = '';

  pagos: PagoDto[] = [];

  constructor(private pagosApi: PagosApiService) {}

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.cargando = true;
    this.error = '';
    this.pagosApi.listarTodos().subscribe({
      next: (data: any[]) => {
        this.pagos = data.map(p => ({
          id_pago: p.id_pago,
          miembro: p.nombre_miembro ?? '',
          cedula: p.miembro_cedula ?? '',
          plan: p.plan_duracion ?? '',
          metodo_pago: p.metodo_pago,
          valor_pagado: p.valor_pagado ?? 0,
          fecha_pago: p.fecha_pago ?? '',
          estado_membresia: p.estado_membresia
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los pagos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get pagosFiltrados(): PagoDto[] {
    return this.pagos.filter(p => {
      const texto = `${p.miembro} ${p.cedula} ${p.plan}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideMetodo = !this.filtroMetodo || p.metodo_pago === this.filtroMetodo;
      const coincideEstado = !this.filtroEstado || p.estado_membresia === this.filtroEstado;
      return coincideBusqueda && coincideMetodo && coincideEstado;
    });
  }

  abrirDetalle(pago: PagoDto) {
    this.pagoSeleccionado = { ...pago };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pagoSeleccionado = null;
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }
}