import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasesApiService } from '../../../../core/services/api/clases-api.service';
import { ClaseDto } from '../../../../models/dto/clase.dto';

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
  claseSeleccionada: ClaseDto | null = null;
  cargando: boolean = false;
  error: string = '';

  clases: ClaseDto[] = [];

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
          id_clase: c.id_clase,
          deporte: c.deporte?.nombre ?? '',
          entrenador: c.nombre_entrenador ?? '',
          sala: c.sala?.id_sala ?? 0,
          fecha: c.horario?.fecha ?? '',
          hora_inicio: c.horario?.hora_inicio ?? '',
          hora_fin: c.horario?.hora_fin ?? '',
          cupos: c.cupos,
          estado: c.estado,
          comentario: c.comentario
        }));
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar las clases. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get clasesFiltradas(): ClaseDto[] {
    return this.clases.filter(c => {
      const texto = `${c.deporte} ${c.entrenador}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.filtroEstado || c.estado === this.filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }

  abrirDetalle(clase: ClaseDto) {
    this.claseSeleccionada = { ...clase };
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  nuevaClase() {
    this.claseSeleccionada = {
      id_clase: 0,
      deporte: '',
      entrenador: '',
      sala: 1,
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      cupos: 0,
      estado: 'programada',
      comentario: ''
    };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardar() {
    if (!this.claseSeleccionada) return;
    const esNueva = this.claseSeleccionada.id_clase === 0;

    const obs = esNueva
      ? this.clasesApi.crear(this.claseSeleccionada)
      : this.clasesApi.actualizar(this.claseSeleccionada.id_clase, this.claseSeleccionada);

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