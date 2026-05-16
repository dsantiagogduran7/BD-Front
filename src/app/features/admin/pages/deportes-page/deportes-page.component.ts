import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeportesApiService } from '../../../../core/services/api/deportes-api.service';
import { DeporteDto } from '../../../../models/dto/deporte.dto';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-deportes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './deportes-page.component.html',
  styleUrl: './deportes-page.component.css'
})
export class DeportesPageComponent implements OnInit {

  busqueda: string = '';
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  esNuevo: boolean = false;
  deporteSeleccionado: DeporteDto | null = null;
  cargando: boolean = false;
  error: string = '';
  errorValidacion: string = '';

  deportes: DeporteDto[] = [];
  paginaActual = 1;
  readonly itemsPorPagina = 10;

  constructor(private deportesApi: DeportesApiService) {}

  ngOnInit(): void {
    this.cargarDeportes();
  }

  cargarDeportes(): void {
    this.cargando = true;
    this.error = '';
    this.deportesApi.listarTodos().subscribe({
      next: (data) => { this.deportes = data; this.cargando = false; },
      error: () => {
        this.error = 'Error al cargar los deportes. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.deportesFiltrados.length / this.itemsPorPagina)); }
  get deportesPaginados(): DeporteDto[] { const i = (this.paginaActual - 1) * this.itemsPorPagina; return this.deportesFiltrados.slice(i, i + this.itemsPorPagina); }
  cambiarPagina(n: number): void { this.paginaActual = n; }

  get deportesFiltrados(): DeporteDto[] {
    if (!this.busqueda) return this.deportes;
    const q = this.busqueda.toLowerCase();
    return this.deportes.filter(d =>
      d.nombre.toLowerCase().includes(q) || d.descripcion.toLowerCase().includes(q)
    );
  }

  abrirDetalle(deporte: DeporteDto) {
    this.deporteSeleccionado = { ...deporte };
    this.modoEdicion = false;
    this.esNuevo = false;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  nuevoDeporte() {
    this.deporteSeleccionado = { id_deporte: 0, nombre: '', descripcion: '' };
    this.modoEdicion = true;
    this.esNuevo = true;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.deporteSeleccionado = null;
    this.esNuevo = false;
    this.errorValidacion = '';
  }

  private validar(): string {
    const d = this.deporteSeleccionado!;
    if (!d.nombre?.trim()) return 'El nombre es obligatorio.';
    if (d.nombre.length > 20) return 'El nombre no puede superar 20 caracteres.';
    if (!d.descripcion?.trim()) return 'La descripción es obligatoria.';
    if (d.descripcion.length > 100) return 'La descripción no puede superar 100 caracteres.';
    return '';
  }

  guardar() {
    if (!this.deporteSeleccionado) return;
    const msg = this.validar();
    if (msg) { this.errorValidacion = msg; return; }
    this.errorValidacion = '';

    const payload = {
      nombre: this.deporteSeleccionado.nombre,
      descripcion: this.deporteSeleccionado.descripcion
    };

    const obs = this.esNuevo
      ? this.deportesApi.crear(payload)
      : this.deportesApi.actualizar(this.deporteSeleccionado.id_deporte, payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarDeportes(); },
      error: (err) => {
        this.errorValidacion = err?.error?.message || 'Error al guardar. Verifica que los datos sean correctos.';
      }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Desea eliminar este deporte? Los contenidos asociados también se verán afectados.')) return;
    this.deportesApi.eliminar(id).subscribe({
      next: () => { this.cerrarModal(); this.cargarDeportes(); },
      error: () => { this.errorValidacion = 'Error al eliminar el deporte.'; }
    });
  }
}
