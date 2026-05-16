import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosApiService } from '../../../../core/services/api/pagos-api.service';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-pagos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './pagos-page.component.html',
  styleUrl: './pagos-page.component.css'
})
export class PagosPageComponent implements OnInit {

  busqueda = '';
  filtroMetodo = '';
  filtroEstado = '';

  pagos: any[] = [];
  paginaActual = 1;
  readonly itemsPorPagina = 10;
  pagoSeleccionado: any = null;
  mostrarModal = false;
  cargando = false;
  error = '';

  constructor(private pagosApi: PagosApiService) {}

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.cargando = true;
    this.error = '';
    this.pagosApi.listarTodos().subscribe({
      next: data => { this.pagos = data; this.cargando = false; },
      error: () => { this.error = 'Error al cargar los pagos. Verifica la conexión con el servidor.'; this.cargando = false; }
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.pagosFiltrados.length / this.itemsPorPagina)); }
  get pagosPaginados(): any[] { const i = (this.paginaActual - 1) * this.itemsPorPagina; return this.pagosFiltrados.slice(i, i + this.itemsPorPagina); }
  cambiarPagina(n: number): void { this.paginaActual = n; }
  resetPagina(): void { this.paginaActual = 1; }

  get pagosFiltrados(): any[] {
    return this.pagos.filter(p => {
      const texto = `${p.nombre_miembro ?? ''} ${p.miembro_cedula ?? ''} ${p.plan_duracion ?? ''}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideMetodo = !this.filtroMetodo || p.metodo_pago === this.filtroMetodo;
      const coincideEstado = !this.filtroEstado || p.estado_membresia === this.filtroEstado;
      return coincideBusqueda && coincideMetodo && coincideEstado;
    });
  }

  abrirDetalle(pago: any): void {
    this.pagoSeleccionado = pago;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.pagoSeleccionado = null;
  }

  labelMetodo(metodo: string): string {
    const map: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta_credito: 'Tarjeta Crédito',
      tarjeta_debito: 'Tarjeta Débito',
      transferencia: 'Transferencia'
    };
    return map[metodo] || metodo;
  }

  labelDuracion(dur: string): string {
    const map: Record<string, string> = {
      mensual: 'Mensual', trimestral: 'Trimestral',
      semestral: 'Semestral', anual: 'Anual'
    };
    return map[dur] || dur;
  }

  labelEstado(estado: string): string {
    const map: Record<string, string> = {
      activa: 'Activa', inactiva: 'Inactiva',
      vencida: 'Vencida', suspendida: 'Suspendida'
    };
    return map[estado] || estado;
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(valor);
  }
}
