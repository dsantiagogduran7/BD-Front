import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, switchMap, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionService } from '../../../../core/services/session.service';
import { PlanesApiService } from '../../../../core/services/api/planes-api.service';
import { MembresiasApiService } from '../../../../core/services/api/membresias-api.service';
import { PagosApiService } from '../../../../core/services/api/pagos-api.service';
import { PlanDto } from '../../../../models/dto/plan.dto';
import { MembresiaDto } from '../../../../models/dto/membresia.dto';

@Component({
  selector: 'app-membresias-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './membresias-page.component.html',
  styleUrl: './membresias-page.component.css'
})
export class MembresiasPageComponent implements OnInit {

  private session = inject(SessionService);
  private cedula = '';

  cargando = true;
  error = '';
  mensajeOk = '';
  mensajeError = '';

  planes: PlanDto[] = [];
  membresiaActual: MembresiaDto | null = null;

  mostrarModal = false;
  planSeleccionado: PlanDto | null = null;
  metodoPago: string = 'efectivo';
  procesando = false;

  constructor(
    private planesApi: PlanesApiService,
    private membresiasApi: MembresiasApiService,
    private pagosApi: PagosApiService
  ) {}

  ngOnInit(): void {
    const miembro = this.session.getPerfilMiembro();
    if (miembro) this.cedula = miembro.cedula;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    forkJoin({
      planes:    this.planesApi.listarTodos(),
      membresia: this.membresiasApi.buscarVigente(this.cedula).pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ planes, membresia }) => {
        this.planes         = planes;
        this.membresiaActual = membresia;
        this.cargando        = false;
      },
      error: () => {
        this.error    = 'Error al cargar los datos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get planesDisponibles(): PlanDto[] {
    if (!this.membresiaActual) return this.planes;
    return this.planes.filter(p => p.id_plan !== this.membresiaActual!.plan.id_plan);
  }

  abrirModal(plan: PlanDto): void {
    this.planSeleccionado = plan;
    this.metodoPago       = 'efectivo';
    this.mostrarModal     = true;
  }

  cerrarModal(): void {
    this.mostrarModal     = false;
    this.planSeleccionado = null;
  }

  confirmarSuscripcion(): void {
    if (!this.planSeleccionado || this.procesando) return;
    this.procesando = true;

    const hoy      = new Date().toISOString().split('T')[0];
    const fechaFin = this.calcularFechaFin(hoy, this.planSeleccionado.duracion);
    const plan     = this.planSeleccionado;

    const cancelar$ = this.membresiaActual
      ? this.membresiasApi.actualizar(
          this.cedula,
          this.membresiaActual.plan.id_plan,
          this.membresiaActual.fecha_inicio,
          {
            miembro_cedula: this.cedula,
            id_plan:        this.membresiaActual.plan.id_plan,
            fecha_inicio:   this.membresiaActual.fecha_inicio,
            fecha_fin:      this.membresiaActual.fecha_fin,
            estado:         'suspendida'
          }
        )
      : of(null);

    cancelar$.pipe(
      switchMap(() => this.membresiasApi.crear({
        miembro_cedula: this.cedula,
        id_plan:        plan.id_plan,
        fecha_inicio:   hoy,
        fecha_fin:      fechaFin,
        estado:         'activa'
      })),
      switchMap((nuevaMembresia: MembresiaDto) =>
        this.pagosApi.registrar({
          miembro_cedula:         this.cedula,
          id_plan:                plan.id_plan,
          fecha_inicio_membresia: hoy,
          metodo_pago:            this.metodoPago,
          fecha_pago:             hoy,
          valor_pagado:           plan.precio
        }).pipe(map(() => nuevaMembresia))
      )
    ).subscribe({
      next: (nuevaMembresia: MembresiaDto) => {
        this.membresiaActual = nuevaMembresia;
        this.session.actualizarPerfil({ membresia_estado: 'activa' });
        this.cerrarModal();
        this.procesando = false;
        this.ok('¡Plan activado correctamente! Se ha generado el pago.');
      },
      error: (err) => {
        this.procesando = false;
        this.err(err?.error?.error ?? err?.error?.message ?? 'No se pudo procesar el plan. Intenta de nuevo.');
        this.cargarDatos();
      }
    });
  }

  cancelarMembresia(): void {
    if (!this.membresiaActual) return;
    if (!confirm('¿Estás seguro de que deseas cancelar tu membresía actual?')) return;

    this.membresiasApi.actualizar(
      this.cedula,
      this.membresiaActual.plan.id_plan,
      this.membresiaActual.fecha_inicio,
      {
        miembro_cedula: this.cedula,
        id_plan:        this.membresiaActual.plan.id_plan,
        fecha_inicio:   this.membresiaActual.fecha_inicio,
        fecha_fin:      this.membresiaActual.fecha_fin,
        estado:         'suspendida'
      }
    ).subscribe({
      next: () => {
        this.session.actualizarPerfil({ membresia_estado: 'inactiva' });
        this.ok('Membresía cancelada correctamente.');
        this.membresiaActual = null;
      },
      error: () => { this.err('No se pudo cancelar la membresía.'); }
    });
  }

  calcularFechaFin(fechaInicio: string, duracion: string): string {
    const d = new Date(fechaInicio + 'T00:00:00');
    switch (duracion) {
      case 'mensual':    d.setMonth(d.getMonth() + 1);       break;
      case 'trimestral': d.setMonth(d.getMonth() + 3);       break;
      case 'semestral':  d.setMonth(d.getMonth() + 6);       break;
      case 'anual':      d.setFullYear(d.getFullYear() + 1); break;
    }
    return d.toISOString().split('T')[0];
  }

  formatFecha(f: string): string {
    if (!f) return '—';
    try {
      const d = new Date(f + 'T00:00:00');
      return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return f; }
  }

  formatPrecio(p: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p);
  }

  labelDuracion(d: string): string {
    const map: Record<string, string> = {
      mensual: '1 Mes', trimestral: '3 Meses', semestral: '6 Meses', anual: '12 Meses'
    };
    return map[d] ?? d;
  }

  private ok(msg: string): void {
    this.mensajeOk    = msg;
    this.mensajeError = '';
    setTimeout(() => this.mensajeOk = '', 5000);
  }

  private err(msg: string): void {
    this.mensajeError = msg;
    this.mensajeOk    = '';
    setTimeout(() => this.mensajeError = '', 5000);
  }
}
