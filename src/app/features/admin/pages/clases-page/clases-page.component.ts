import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasesApiService } from '../../../../core/services/api/clases-api.service';

interface Clase {
  id: number;
  deporte: string;
  entrenador: string;
  sala: number;
  fecha: string;
  horario: string;
  cupos: number;
  estado: 'programada' | 'cancelada' | 'finalizada';
  comentario?: string;
  _raw?: any;
}

@Component({
  selector: 'app-clases-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clases-page.component.html',
  styleUrl: './clases-page.component.css'
})
export class ClasesPageComponent implements OnInit {

  busqueda: string = '';
  filtroEstado: string = '';
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  claseSeleccionada: Clase | null = null;
  cargando: boolean = false;
  error: string = '';

  clases: Clase[] = [];

  constructor(private clasesApi: ClasesApiService) {}

  ngOnInit(): void {
    this.cargarClases();
  }

  cargarClases(): void {
    this.cargando = true;
    this.error = '';
    this.clasesApi.listarTodas().subscribe({
      next: (data: any[]) => {
        this.clases = data.map(c => ({
          id: c.id_clase,
          deporte: c.deporte?.nombre ?? '',
          entrenador: c.nombre_entrenador ?? '',
          sala: c.sala?.id_sala ?? 0,
          fecha: c.horario?.fecha ?? '',
          horario: c.horario?.hora_inicio ?? '',
          cupos: c.cupos,
          estado: c.estado,
          comentario: c.comentario,
          _raw: c
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar las clases. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get clasesFiltradas(): Clase[] {
    return this.clases.filter(c => {
      const texto = `${c.deporte} ${c.entrenador}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.filtroEstado || c.estado === this.filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }

  abrirDetalle(clase: Clase) {
    this.claseSeleccionada = { ...clase };
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  nuevaClase() {
    this.claseSeleccionada = {
      id: 0,
      deporte: '',
      entrenador: '',
      sala: 1,
      fecha: '',
      horario: '',
      cupos: 0,
      estado: 'programada',
      comentario: ''
    };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardar() {
    if (!this.claseSeleccionada) return;
    const esNueva = this.claseSeleccionada.id === 0;
    const payload = this.claseSeleccionada._raw ?? this.claseSeleccionada;

    const obs = esNueva
      ? this.clasesApi.crear(payload)
      : this.clasesApi.actualizar(this.claseSeleccionada.id, payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarClases(); },
      error: () => { alert('Error al guardar la clase.'); }
    });
  }

  eliminarClase(id: number) {
    if (!confirm('¿Desea eliminar esta clase?')) return;
    this.clasesApi.eliminar(id).subscribe({
      next: () => { this.cerrarModal(); this.cargarClases(); },
      error: () => { alert('Error al eliminar la clase.'); }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.claseSeleccionada = null;
  }
}
