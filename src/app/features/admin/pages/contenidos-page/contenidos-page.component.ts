import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContenidosApiService } from '../../../../core/services/api/contenidos-api.service';
import { DeportesApiService } from '../../../../core/services/api/deportes-api.service';
import { ContenidoDto } from '../../../../models/dto/contenido.dto';
import { DeporteDto } from '../../../../models/dto/deporte.dto';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-contenidos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './contenidos-page.component.html',
  styleUrl: './contenidos-page.component.css'
})
export class ContenidosPageComponent implements OnInit {

  busqueda: string = '';
  filtroTipo: string = '';
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  esNuevo: boolean = false;
  contenidoSeleccionado: ContenidoDto | null = null;
  cargando: boolean = false;
  error: string = '';
  errorValidacion: string = '';

  contenidos: ContenidoDto[] = [];
  deportes: DeporteDto[] = [];
  paginaActual = 1;
  readonly itemsPorPagina = 10;

  constructor(
    private contenidosApi: ContenidosApiService,
    private deportesApi: DeportesApiService
  ) {}

  ngOnInit(): void {
    this.cargarDeportes();
    this.cargarContenidos();
  }

  cargarDeportes(): void {
    this.deportesApi.listarTodos().subscribe({ next: (data) => { this.deportes = data; } });
  }

  cargarContenidos(): void {
    this.cargando = true;
    this.error = '';
    this.contenidosApi.listarTodos().subscribe({
      next: (data: any[]) => {
        this.contenidos = data.map(c => ({
          id_contenido: c.id_contenido,
          titulo: c.titulo,
          descripcion: c.descripcion,
          tipo_contenido: c.tipo_contenido,
          duracion: c.duracion,
          autor: c.autor ?? '',
          url_del_recurso: c.url_del_recurso ?? '',
          fecha_publicacion: c.fecha_publicacion ?? '',
          id_deporte: c.deporte?.id_deporte ?? 0,
          deporte_nombre: c.deporte?.nombre ?? ''
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los contenidos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.contenidosFiltrados.length / this.itemsPorPagina)); }
  get contenidosPaginados(): ContenidoDto[] { const i = (this.paginaActual - 1) * this.itemsPorPagina; return this.contenidosFiltrados.slice(i, i + this.itemsPorPagina); }
  cambiarPagina(n: number): void { this.paginaActual = n; }

  get contenidosFiltrados(): ContenidoDto[] {
    return this.contenidos.filter(c => {
      const texto = `${c.titulo} ${c.autor} ${c.deporte_nombre}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideTipo = !this.filtroTipo || c.tipo_contenido === this.filtroTipo;
      return coincideBusqueda && coincideTipo;
    });
  }

  abrirDetalle(contenido: ContenidoDto) {
    this.contenidoSeleccionado = { ...contenido };
    this.modoEdicion = false;
    this.esNuevo = false;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  nuevoContenido() {
    this.contenidoSeleccionado = {
      id_contenido: 0,
      titulo: '',
      descripcion: '',
      tipo_contenido: 'articulo',
      duracion: undefined,
      autor: '',
      url_del_recurso: '',
      fecha_publicacion: '',
      id_deporte: 0,
      deporte_nombre: ''
    };
    this.modoEdicion = true;
    this.esNuevo = true;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.contenidoSeleccionado = null;
    this.esNuevo = false;
    this.errorValidacion = '';
  }

  private validar(): string {
    const c = this.contenidoSeleccionado!;
    if (!c.titulo?.trim()) return 'El título es obligatorio.';
    if (c.titulo.length > 50) return 'El título no puede superar 50 caracteres.';
    if (!c.descripcion?.trim()) return 'La descripción es obligatoria.';
    if (c.descripcion.length > 200) return 'La descripción no puede superar 200 caracteres.';
    if (!c.autor?.trim()) return 'El autor es obligatorio.';
    if (!c.fecha_publicacion) return 'La fecha de publicación es obligatoria.';
    if (!c.id_deporte || c.id_deporte === 0) return 'Debes seleccionar un deporte.';
    return '';
  }

  guardar() {
    if (!this.contenidoSeleccionado) return;
    const msg = this.validar();
    if (msg) { this.errorValidacion = msg; return; }
    this.errorValidacion = '';

    const payload = {
      titulo: this.contenidoSeleccionado.titulo,
      descripcion: this.contenidoSeleccionado.descripcion,
      tipo_contenido: this.contenidoSeleccionado.tipo_contenido,
      duracion: this.contenidoSeleccionado.duracion || null,
      url_del_recurso: this.contenidoSeleccionado.url_del_recurso || null,
      fecha_publicacion: this.contenidoSeleccionado.fecha_publicacion,
      autor: this.contenidoSeleccionado.autor,
      id_deporte: this.contenidoSeleccionado.id_deporte
    };

    const obs = this.esNuevo
      ? this.contenidosApi.crear(payload)
      : this.contenidosApi.actualizar(this.contenidoSeleccionado.id_contenido, payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarContenidos(); },
      error: (err) => {
        this.errorValidacion = err?.error?.message || 'Error al guardar. Verifica que los datos sean correctos.';
      }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Desea eliminar este contenido?')) return;
    this.contenidosApi.eliminar(id).subscribe({
      next: () => { this.cerrarModal(); this.cargarContenidos(); },
      error: () => { this.errorValidacion = 'Error al eliminar el contenido.'; }
    });
  }

  getNombreDeporte(id: number): string {
    return this.deportes.find(d => d.id_deporte === id)?.nombre ?? '';
  }
}
