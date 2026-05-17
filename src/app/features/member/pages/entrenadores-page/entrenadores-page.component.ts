import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SessionService } from '../../../../core/services/session.service';
import { EntrenadoresApiService } from '../../../../core/services/api/entrenadores-api.service';
import { AsignacionesApiService } from '../../../../core/services/api/asignaciones-api.service';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-entrenadores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './entrenadores-page.component.html',
  styleUrl: './entrenadores-page.component.css'
})
export class EntrenadoresPageComponent implements OnInit {

  private session = inject(SessionService);
  private myCedula = '';

  entrenadores: any[] = [];
  vinculados = new Set<string>();

  cargando = true;
  error = '';
  vinculando: string | null = null;

  busqueda = '';
  tipoFiltro = '';
  nivelFiltro = '';

  paginaActual = 1;
  readonly itemsPorPagina = 9;

  readonly tiposEntrenamiento = [
    { value: 'fuerza',        label: 'Fuerza' },
    { value: 'aerobico',      label: 'Aeróbico' },
    { value: 'flexibilidad',  label: 'Flexibilidad' },
    { value: 'equilibrio',    label: 'Equilibrio' },
  ];

  readonly nivelesExigencia = [
    { value: 'bajo',     label: 'Bajo' },
    { value: 'moderado', label: 'Moderado' },
    { value: 'medio',    label: 'Medio' },
    { value: 'alto',     label: 'Alto' },
    { value: 'extremo',  label: 'Extremo' },
  ];

  // Modal: Ver detalle
  mostrarDetalle = false;
  entrenadorViendo: any = null;

  constructor(
    private entrenadoresApi: EntrenadoresApiService,
    private asignacionesApi: AsignacionesApiService
  ) {}

  ngOnInit(): void {
    const miembro = this.session.getPerfilMiembro();
    if (miembro) this.myCedula = miembro.cedula;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    forkJoin({
      entrenadores:  this.entrenadoresApi.listarTodos(),
      asignaciones:  this.asignacionesApi.listarPorMiembro(this.myCedula)
    }).subscribe({
      next: ({ entrenadores, asignaciones }) => {
        this.entrenadores = entrenadores;
        this.vinculados = new Set(asignaciones.map((a: any) => a.cedula_entrenador));
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los entrenadores. Verifica la conexión.';
        this.cargando = false;
      }
    });
  }

  get entrenadorFiltrados(): any[] {
    const q = this.busqueda.toLowerCase();
    return this.entrenadores.filter(e => {
      const nombre = `${e.primer_nombre} ${e.primer_apellido}`.toLowerCase();
      const coincideNombre = !q || nombre.includes(q);
      const coincideTipo   = !this.tipoFiltro  || e.tipo_entrenamiento === this.tipoFiltro;
      const coincideNivel  = !this.nivelFiltro || e.nivel_exigencia    === this.nivelFiltro;
      return coincideNombre && coincideTipo && coincideNivel;
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.entrenadorFiltrados.length / this.itemsPorPagina)); }
  get entrenadorPaginados(): any[] {
    const i = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.entrenadorFiltrados.slice(i, i + this.itemsPorPagina);
  }
  cambiarPagina(n: number): void { this.paginaActual = n; }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.tipoFiltro = '';
    this.nivelFiltro = '';
    this.paginaActual = 1;
  }

  onFiltroChange(): void { this.paginaActual = 1; }

  nombreCompleto(e: any): string {
    return [e.primer_nombre, e.segundo_nombre, e.primer_apellido, e.segundo_apellido]
      .filter(Boolean).join(' ');
  }

  iniciales(e: any): string {
    return (e.primer_nombre[0] + e.primer_apellido[0]).toUpperCase();
  }

  deportesLabel(deportes: { nombre: string }[]): string {
    return deportes.map(d => d.nombre).join(', ');
  }

  getEdad(fecha: string): number {
    if (!fecha) return 0;
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    if (hoy.getMonth() - nac.getMonth() < 0 ||
        (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      fuerza: 'Fuerza', aerobico: 'Aeróbico',
      flexibilidad: 'Flexibilidad', equilibrio: 'Equilibrio'
    };
    return map[tipo] ?? tipo;
  }

  labelExigencia(nivel: string): string {
    const map: Record<string, string> = {
      bajo: 'Bajo', moderado: 'Moderado', medio: 'Medio', alto: 'Alto', extremo: 'Extremo'
    };
    return map[nivel] ?? nivel;
  }

  vincular(entrenador: any): void {
    this.vinculando = entrenador.cedula;
    const hoy = new Date().toISOString().split('T')[0];
    this.asignacionesApi.crear({
      cedula_entrenador: entrenador.cedula,
      cedula_miembro: this.myCedula,
      fecha_asignacion: hoy
    }).subscribe({
      next: () => {
        this.vinculados.add(entrenador.cedula);
        this.vinculando = null;
      },
      error: () => { this.vinculando = null; }
    });
  }

  abrirDetalle(entrenador: any): void { this.entrenadorViendo = entrenador; this.mostrarDetalle = true; }
  cerrarDetalle(): void { this.mostrarDetalle = false; this.entrenadorViendo = null; }
}
