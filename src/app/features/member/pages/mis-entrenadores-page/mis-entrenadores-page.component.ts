import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SessionService } from '../../../../core/services/session.service';
import { AsignacionesApiService } from '../../../../core/services/api/asignaciones-api.service';
import { EntrenadoresApiService } from '../../../../core/services/api/entrenadores-api.service';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-mis-entrenadores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './mis-entrenadores-page.component.html',
  styleUrl: './mis-entrenadores-page.component.css'
})
export class MisEntrenadoresPageComponent implements OnInit {

  private session = inject(SessionService);
  private myCedula = '';

  items: any[] = [];

  cargando = true;
  error = '';
  busqueda = '';
  paginaActual = 1;
  readonly itemsPorPagina = 6;

  // Modal: Ver detalle entrenador
  mostrarDetalle = false;
  itemViendo: any = null;

  // Modal: Confirmar desvincular
  mostrarConfirmar = false;
  itemAEliminar: any = null;
  eliminando = false;
  errorEliminar = '';

  constructor(
    private asignacionesApi: AsignacionesApiService,
    private entrenadoresApi: EntrenadoresApiService
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
      asignaciones: this.asignacionesApi.listarPorMiembro(this.myCedula),
      entrenadores: this.entrenadoresApi.listarTodos()
    }).subscribe({
      next: ({ asignaciones, entrenadores }) => {
        this.items = asignaciones.map((a: any) => ({
          ...a,
          entrenador: entrenadores.find((e: any) => e.cedula === a.cedula_entrenador) ?? null
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los datos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get itemsFiltrados(): any[] {
    return this.items.filter(i =>
      !this.busqueda || i.nombre_entrenador?.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }
  get totalPaginas(): number { return Math.max(1, Math.ceil(this.itemsFiltrados.length / this.itemsPorPagina)); }
  get itemsPaginados(): any[] {
    const i = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.itemsFiltrados.slice(i, i + this.itemsPorPagina);
  }
  cambiarPagina(n: number): void { this.paginaActual = n; }

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

  deportesLabel(deportes: { nombre: string }[]): string {
    return deportes.map(d => d.nombre).join(', ');
  }

  abrirDetalle(item: any): void { this.itemViendo = item; this.mostrarDetalle = true; }
  cerrarDetalle(): void { this.mostrarDetalle = false; this.itemViendo = null; }

  abrirConfirmar(item: any): void {
    this.itemAEliminar = item;
    this.errorEliminar = '';
    this.eliminando = false;
    this.mostrarConfirmar = true;
  }

  confirmarDesvincular(): void {
    this.eliminando = true;
    this.asignacionesApi.eliminar(this.itemAEliminar.id_asignacion).subscribe({
      next: () => { this.mostrarConfirmar = false; this.cargar(); },
      error: () => {
        this.eliminando = false;
        this.errorEliminar = 'Error al desvincular el entrenador. Intenta de nuevo.';
      }
    });
  }

  cerrarConfirmar(): void { this.mostrarConfirmar = false; this.itemAEliminar = null; }
}
