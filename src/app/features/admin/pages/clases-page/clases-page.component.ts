import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClasesApiService } from '../../../../core/services/api/clases-api.service';
import { HorariosApiService } from '../../../../core/services/api/horarios-api.service';
import { DeportesApiService } from '../../../../core/services/api/deportes-api.service';
import { SalasApiService } from '../../../../core/services/api/salas-api.service';
import { EntrenadoresApiService } from '../../../../core/services/api/entrenadores-api.service';
import { ClaseDto, ClaseFormDto } from '../../../../models/dto/clase.dto';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

const DIA_MAP: Record<number, string> = {
  0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles',
  4: 'jueves', 5: 'viernes', 6: 'sabado'
};

@Component({
  selector: 'app-clases-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './clases-page.component.html',
  styleUrl: './clases-page.component.css'
})
export class ClasesPageComponent implements OnInit {

  busqueda = '';
  filtroEstado = '';
  mostrarModal = false;
  modoEdicion = false;
  cargando = true;
  error = '';

  clases: ClaseDto[] = [];
  paginaActual = 1;
  readonly itemsPorPagina = 10;
  deportes: any[] = [];
  horariosFiltrados: any[] = [];
  salas: any[] = [];
  entrenadores: any[] = [];

  claseSeleccionada: ClaseDto | null = null;
  form: ClaseFormDto = this.formVacio();

  constructor(
    private clasesApi: ClasesApiService,
    private horariosApi: HorariosApiService,
    private deportesApi: DeportesApiService,
    private salasApi: SalasApiService,
    private entrenadoresApi: EntrenadoresApiService
  ) {}

  ngOnInit(): void {
    forkJoin({
      clases: this.clasesApi.listarTodas(),
      deportes: this.deportesApi.listarTodos(),
      salas: this.salasApi.listarTodas(),
      entrenadores: this.entrenadoresApi.listarTodos()
    }).subscribe({
      next: ({ clases, deportes, salas, entrenadores }) => {
        this.clases = clases as ClaseDto[];
        this.deportes = deportes;
        this.salas = salas;
        this.entrenadores = entrenadores;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar datos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.clasesFiltradas.length / this.itemsPorPagina)); }
  get clasesPaginadas(): ClaseDto[] { const i = (this.paginaActual - 1) * this.itemsPorPagina; return this.clasesFiltradas.slice(i, i + this.itemsPorPagina); }
  cambiarPagina(n: number): void { this.paginaActual = n; }
  resetPagina(): void { this.paginaActual = 1; }

  get clasesFiltradas(): ClaseDto[] {
    return this.clases.filter(c => {
      const texto = `${c.deporte?.nombre ?? ''} ${c.nombre_entrenador}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.filtroEstado || c.estado === this.filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }

  onFechaChange(): void {
    if (!this.form.fecha) {
      this.horariosFiltrados = [];
      this.form.id_horario = 0;
      return;
    }
    const diaSemana = DIA_MAP[new Date(this.form.fecha + 'T00:00:00').getDay()];
    this.form.id_horario = 0;
    this.horariosApi.listarPorDia(diaSemana).subscribe({
      next: h => { this.horariosFiltrados = h; },
      error: () => { this.horariosFiltrados = []; }
    });
  }

  abrirDetalle(clase: ClaseDto): void {
    this.claseSeleccionada = clase;
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  nuevaClase(): void {
    this.claseSeleccionada = null;
    this.form = this.formVacio();
    this.horariosFiltrados = [];
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  activarEdicion(): void {
    if (!this.claseSeleccionada) return;
    const c = this.claseSeleccionada;
    this.form = {
      id_clase: c.id_clase,
      estado: c.estado,
      comentario: c.comentario,
      cupos: c.cupos,
      fecha: c.fecha,
      id_sala: c.sala?.id_sala ?? 0,
      id_horario: c.horario?.id_horario ?? 0,
      id_deporte: c.deporte?.id_deporte ?? 0,
      cedula_entrenador: c.cedula_entrenador
    };
    if (c.fecha) {
      const diaSemana = DIA_MAP[new Date(c.fecha + 'T00:00:00').getDay()];
      this.horariosApi.listarPorDia(diaSemana).subscribe({
        next: h => { this.horariosFiltrados = h; },
        error: () => { this.horariosFiltrados = []; }
      });
    }
    this.modoEdicion = true;
  }

  guardar(): void {
    if (!this.formValido()) return;

    const payload = {
      estado: this.form.estado,
      comentario: this.form.comentario,
      cupos: this.form.cupos,
      fecha: this.form.fecha,
      id_sala: this.form.id_sala,
      id_horario: this.form.id_horario,
      id_deporte: this.form.id_deporte,
      cedula_entrenador: this.form.cedula_entrenador
    };

    const esNueva = this.form.id_clase === 0;
    const obs = esNueva
      ? this.clasesApi.crear(payload)
      : this.clasesApi.actualizar(this.form.id_clase, payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.recargar(); },
      error: (err) => {
        const msg = err?.error?.error ?? 'Error al guardar la clase.';
        alert(msg);
      }
    });
  }

  eliminarClase(id: number): void {
    if (!confirm('¿Desea eliminar esta clase?')) return;
    this.clasesApi.eliminar(id).subscribe({
      next: () => { this.cerrarModal(); this.recargar(); },
      error: () => { alert('Error al eliminar la clase.'); }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.claseSeleccionada = null;
    this.modoEdicion = false;
  }

  private recargar(): void {
    this.clasesApi.listarTodas().subscribe({
      next: data => { this.clases = data as ClaseDto[]; }
    });
  }

  private formVacio(): ClaseFormDto {
    return {
      id_clase: 0,
      estado: 'programada',
      comentario: '',
      cupos: 0,
      fecha: '',
      id_sala: 0,
      id_horario: 0,
      id_deporte: 0,
      cedula_entrenador: ''
    };
  }

  private formValido(): boolean {
    const f = this.form;
    if (!f.fecha) { alert('Selecciona una fecha.'); return false; }
    if (!f.id_deporte) { alert('Selecciona un deporte.'); return false; }
    if (!f.id_horario) { alert('Selecciona un horario.'); return false; }
    if (!f.id_sala) { alert('Selecciona una sala.'); return false; }
    if (!f.cedula_entrenador.trim()) { alert('Selecciona un entrenador.'); return false; }
    if (!f.cupos || f.cupos <= 0) { alert('Los cupos deben ser mayores a 0.'); return false; }
    if (!f.comentario.trim()) { alert('Ingresa un comentario.'); return false; }
    return true;
  }
}
