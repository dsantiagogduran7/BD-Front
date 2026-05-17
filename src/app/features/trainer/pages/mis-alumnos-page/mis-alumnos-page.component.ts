import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SessionService } from '../../../../core/services/session.service';
import { AsignacionesApiService } from '../../../../core/services/api/asignaciones-api.service';
import { PlanesEntrenamientoApiService } from '../../../../core/services/api/planes-entrenamiento-api.service';
import { MiembrosApiService } from '../../../../core/services/api/miembros-api.service';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-mis-alumnos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './mis-alumnos-page.component.html',
  styleUrl: './mis-alumnos-page.component.css'
})
export class MisAlumnosPageComponent implements OnInit {

  private session = inject(SessionService);
  private myCedula = '';

  items: any[] = [];
  miembros: any[] = [];

  cargando = true;
  error = '';
  busqueda = '';
  paginaActual = 1;
  readonly itemsPorPagina = 8;

  // Modal: Ver detalle miembro
  mostrarDetalle = false;
  itemViendo: any = null;

  // Modal: Crear plan para miembro sin plan
  mostrarCrear = false;
  itemParaPlan: any = null;
  formCrear = { descripcion: '' };
  errorCrear = '';
  guardandoCrear = false;

  constructor(
    private asignacionesApi: AsignacionesApiService,
    private planesApi: PlanesEntrenamientoApiService,
    private miembrosApi: MiembrosApiService
  ) {}

  ngOnInit(): void {
    const trainer = this.session.getPerfilEntrenador();
    if (trainer) this.myCedula = trainer.cedula;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    forkJoin({
      asignaciones: this.asignacionesApi.listarPorEntrenador(this.myCedula),
      planes:       this.planesApi.listarPorEntrenador(this.myCedula),
      miembros:     this.miembrosApi.listarTodos()
    }).subscribe({
      next: ({ asignaciones, planes, miembros }) => {
        this.miembros = miembros;
        this.items = asignaciones.map((a: any) => ({
          ...a,
          plan: planes.find((p: any) => p.id_asignacion === a.id_asignacion) ?? null
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
      !this.busqueda || i.nombre_miembro?.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }
  get totalPaginas(): number { return Math.max(1, Math.ceil(this.itemsFiltrados.length / this.itemsPorPagina)); }
  get itemsPaginados(): any[] {
    const i = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.itemsFiltrados.slice(i, i + this.itemsPorPagina);
  }
  cambiarPagina(n: number): void { this.paginaActual = n; }

  getMiembro(cedula: string): any {
    return this.miembros.find(m => m.cedula === cedula) ?? null;
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

  abrirDetalle(item: any): void { this.itemViendo = item; this.mostrarDetalle = true; }
  cerrarDetalle(): void { this.mostrarDetalle = false; this.itemViendo = null; }

  abrirCrear(item: any): void {
    this.itemParaPlan = item;
    this.formCrear = { descripcion: '' };
    this.errorCrear = '';
    this.guardandoCrear = false;
    this.mostrarCrear = true;
  }

  guardarCrear(): void {
    if (!this.formCrear.descripcion.trim()) { this.errorCrear = 'La descripción es obligatoria.'; return; }
    this.errorCrear = '';
    this.guardandoCrear = true;

    this.planesApi.crear({
      id_asignacion: this.itemParaPlan.id_asignacion,
      descripcion: this.formCrear.descripcion.trim()
    }).subscribe({
      next: () => { this.mostrarCrear = false; this.cargar(); },
      error: (err) => {
        this.guardandoCrear = false;
        this.errorCrear = err?.error?.error ?? 'Error al crear el plan.';
      }
    });
  }

  cerrarCrear(): void { this.mostrarCrear = false; this.errorCrear = ''; }
}
