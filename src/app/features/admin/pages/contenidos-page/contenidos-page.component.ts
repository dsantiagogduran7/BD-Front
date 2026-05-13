import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContenidosApiService } from '../../../../core/services/api/contenidos-api.service';

interface Contenido {
  id_contenido: number;
  titulo: string;
  descripcion: string;
  tipo_contenido: 'video' | 'articulo' | 'rutina' | 'guia';
  url_recurso: string;
  fecha_publicacion: string;
  deporte: string;
}

@Component({
  selector: 'app-contenidos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contenidos-page.component.html',
  styleUrl: './contenidos-page.component.css'
})
export class ContenidosPageComponent implements OnInit {

  busqueda: string = '';
  filtroTipo: string = '';
  filtroDeporte: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  contenidoSeleccionado: Contenido = this.crearContenidoVacio();
  cargando: boolean = false;
  error: string = '';

  contenidos: Contenido[] = [];

  constructor(private contenidosApi: ContenidosApiService) {}

  ngOnInit(): void {
    this.cargarContenidos();
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
          url_recurso: c.url_del_recurso ?? '',
          fecha_publicacion: c.fecha_publicacion ?? '',
          deporte: c.deporte?.nombre ?? ''
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los contenidos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  crearContenidoVacio(): Contenido {
    return {
      id_contenido: 0,
      titulo: '',
      descripcion: '',
      tipo_contenido: 'articulo',
      url_recurso: '',
      fecha_publicacion: '',
      deporte: ''
    };
  }

  get contenidosFiltrados(): Contenido[] {
    return this.contenidos.filter(c => {
      const texto = `${c.titulo} ${c.descripcion} ${c.deporte}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideTipo = !this.filtroTipo || c.tipo_contenido === this.filtroTipo;
      const coincideDeporte = !this.filtroDeporte || c.deporte === this.filtroDeporte;
      return coincideBusqueda && coincideTipo && coincideDeporte;
    });
  }

  get contenidosPaginados(): Contenido[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.contenidosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.contenidosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  abrirNuevo() {
    this.modoEdicion = false;
    this.contenidoSeleccionado = this.crearContenidoVacio();
    this.mostrarModal = true;
  }

  abrirEditar(contenido: Contenido) {
    this.modoEdicion = true;
    this.contenidoSeleccionado = { ...contenido };
    this.mostrarModal = true;
  }

  guardarContenido() {
    const payload = {
      titulo: this.contenidoSeleccionado.titulo,
      descripcion: this.contenidoSeleccionado.descripcion,
      tipo_contenido: this.contenidoSeleccionado.tipo_contenido,
      url_del_recurso: this.contenidoSeleccionado.url_recurso,
      fecha_publicacion: this.contenidoSeleccionado.fecha_publicacion
    };

    const obs = this.modoEdicion
      ? this.contenidosApi.actualizar(this.contenidoSeleccionado.id_contenido, payload)
      : this.contenidosApi.crear(payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarContenidos(); },
      error: () => { alert('Error al guardar el contenido.'); }
    });
  }

  eliminarContenido(id: number) {
    if (!confirm('¿Desea eliminar este contenido?')) return;
    this.contenidosApi.eliminar(id).subscribe({
      next: () => this.cargarContenidos(),
      error: () => { alert('Error al eliminar el contenido.'); }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.contenidoSeleccionado = this.crearContenidoVacio();
  }
}
