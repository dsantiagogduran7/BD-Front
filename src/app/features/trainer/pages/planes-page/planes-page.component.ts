import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SessionService } from '../../../../core/services/session.service';
import { PlanesEntrenamientoApiService } from '../../../../core/services/api/planes-entrenamiento-api.service';
import { EjerciciosApiService } from '../../../../core/services/api/ejercicios-api.service';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-planes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './planes-page.component.html',
  styleUrl: './planes-page.component.css'
})
export class PlanesPageComponent implements OnInit {

  private session = inject(SessionService);
  private myCedula = '';

  planes: any[] = [];
  ejerciciosCatalogo: any[] = [];

  cargando = true;
  error = '';
  busqueda = '';
  paginaActual = 1;
  readonly itemsPorPagina = 8;

  mostrarGestionar = false;
  planActivo: any = null;
  descripcionEditable = '';
  ejerciciosActivos: any[] = [];

  mostrarAddEj = false;
  modoEj: 'nuevo' | 'catalogo' = 'nuevo';
  ejercicioCatalogo: any = null;
  formEj = { nombre_ejerc: '', descripcion_ejerc: '', reps_serie: 1, num_series: 1 };

  errorGestionar = '';

  constructor(
    private planesApi: PlanesEntrenamientoApiService,
    private ejerciciosApi: EjerciciosApiService
  ) {}

  ngOnInit(): void {
    const trainer = this.session.getPerfilEntrenador();
    if (trainer) this.myCedula = trainer.cedula;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    forkJoin({
      planes:    this.planesApi.listarPorEntrenador(this.myCedula),
      ejercicios: this.ejerciciosApi.listarTodos()
    }).subscribe({
      next: ({ planes, ejercicios }) => {
        this.planes = planes;
        this.ejerciciosCatalogo = ejercicios;
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar los datos.'; this.cargando = false; }
    });
  }

  get planesFiltrados(): any[] {
    return this.planes.filter(p =>
      !this.busqueda || p.nombre_miembro?.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }
  get totalPaginas(): number { return Math.max(1, Math.ceil(this.planesFiltrados.length / this.itemsPorPagina)); }
  get planesPaginados(): any[] {
    const i = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.planesFiltrados.slice(i, i + this.itemsPorPagina);
  }
  cambiarPagina(n: number): void { this.paginaActual = n; }

  abrirGestionar(plan: any): void {
    this.planActivo       = plan;
    this.descripcionEditable = plan.descripcion;
    this.ejerciciosActivos   = [...(plan.ejercicios ?? [])];
    this.mostrarAddEj    = false;
    this.resetFormEj();
    this.errorGestionar  = '';
    this.mostrarGestionar = true;
  }

  guardarDescripcion(): void {
    if (!this.descripcionEditable.trim()) { this.errorGestionar = 'La descripción no puede estar vacía.'; return; }
    this.errorGestionar = '';
    this.planesApi.actualizar(this.planActivo.id_asignacion, {
      id_asignacion: this.planActivo.id_asignacion,
      descripcion: this.descripcionEditable.trim()
    }).subscribe({
      next: (updated) => {
        const idx = this.planes.findIndex(p => p.id_asignacion === this.planActivo.id_asignacion);
        if (idx !== -1) this.planes[idx].descripcion = updated.descripcion;
        this.planActivo.descripcion = updated.descripcion;
      },
      error: (err) => { this.errorGestionar = err?.error?.error ?? 'Error al actualizar.'; }
    });
  }

  cerrarGestionar(): void {
    this.mostrarGestionar = false;
    this.planActivo = null;
    this.errorGestionar = '';
    this.mostrarAddEj = false;
  }

  abrirAddEj(): void { this.mostrarAddEj = true; this.modoEj = 'nuevo'; this.resetFormEj(); this.errorGestionar = ''; }

  resetFormEj(): void {
    this.formEj = { nombre_ejerc: '', descripcion_ejerc: '', reps_serie: 1, num_series: 1 };
    this.ejercicioCatalogo = null;
  }

  onCatalogoChange(): void {
    if (this.ejercicioCatalogo) {
      this.formEj.nombre_ejerc      = this.ejercicioCatalogo.nombre_ejerc;
      this.formEj.descripcion_ejerc = this.ejercicioCatalogo.descripcion_ejerc;
      this.formEj.reps_serie        = this.ejercicioCatalogo.reps_serie;
      this.formEj.num_series        = this.ejercicioCatalogo.num_series;
    }
  }

  agregarEjercicio(): void {
    if (!this.formEj.nombre_ejerc.trim())      { this.errorGestionar = 'El nombre es obligatorio.'; return; }
    if (!this.formEj.descripcion_ejerc.trim()) { this.errorGestionar = 'La descripción es obligatoria.'; return; }
    if (!this.formEj.reps_serie || this.formEj.reps_serie < 1) { this.errorGestionar = 'Reps inválidas.'; return; }
    if (!this.formEj.num_series || this.formEj.num_series < 1) { this.errorGestionar = 'Series inválidas.'; return; }
    this.errorGestionar = '';

    const payload = {
      nombre_ejerc:      this.formEj.nombre_ejerc.trim(),
      descripcion_ejerc: this.formEj.descripcion_ejerc.trim(),
      reps_serie:        this.formEj.reps_serie,
      num_series:        this.formEj.num_series,
      id_asignacion:     this.planActivo.id_asignacion
    };
    this.ejerciciosApi.crear(payload).subscribe({
      next: (ej) => {
        this.ejerciciosActivos.push(ej);
        const idx = this.planes.findIndex(p => p.id_asignacion === this.planActivo.id_asignacion);
        if (idx !== -1) this.planes[idx].ejercicios = [...this.ejerciciosActivos];
        this.resetFormEj();
        this.mostrarAddEj = false;
        this.ejerciciosApi.listarTodos().subscribe(ejs => this.ejerciciosCatalogo = ejs);
      },
      error: (err) => { this.errorGestionar = err?.error?.error ?? 'Error al agregar.'; }
    });
  }

  eliminarEjercicio(idEjercicio: number): void {
    if (!confirm('¿Eliminar este ejercicio?')) return;
    this.ejerciciosApi.eliminar(idEjercicio).subscribe({
      next: () => {
        this.ejerciciosActivos = this.ejerciciosActivos.filter(e => e.id_ejercicio !== idEjercicio);
        const idx = this.planes.findIndex(p => p.id_asignacion === this.planActivo.id_asignacion);
        if (idx !== -1) this.planes[idx].ejercicios = [...this.ejerciciosActivos];
      },
      error: () => { this.errorGestionar = 'Error al eliminar el ejercicio.'; }
    });
  }
}
