import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SessionService } from '../../../../core/services/session.service';
import { ClasesApiService } from '../../../../core/services/api/clases-api.service';
import { AsistirApiService } from '../../../../core/services/api/asistir-api.service';
import { DeportesApiService } from '../../../../core/services/api/deportes-api.service';
import { ClaseDto } from '../../../../models/dto/clase.dto';

@Component({
  selector: 'app-clases-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clases-page.component.html',
  styleUrl: './clases-page.component.css'
})
export class ClasesPageComponent implements OnInit {

  private session = inject(SessionService);
  private cedula = '';

  cargando = true;
  error = '';
  mensajeOk = '';
  mensajeError = '';

  todasClases: ClaseDto[] = [];
  misInscripciones = new Set<number>();
  deportes: any[] = [];

  filtroEstadoMis = '';
  filtroDeporte = 0;
  busquedaEntrenador = '';

  constructor(
    private clasesApi: ClasesApiService,
    private asistirApi: AsistirApiService,
    private deportesApi: DeportesApiService
  ) {}

  ngOnInit(): void {
    const miembro = this.session.getPerfilMiembro();
    if (miembro) this.cedula = miembro.cedula;

    forkJoin({
      clases:      this.clasesApi.listarTodas(),
      asistencias: this.asistirApi.consultarPorMiembro(this.cedula),
      deportes:    this.deportesApi.listarTodos()
    }).subscribe({
      next: ({ clases, asistencias, deportes }) => {
        this.todasClases      = clases as ClaseDto[];
        this.misInscripciones = new Set((asistencias as any[]).map(a => a.clase_id_clase));
        this.deportes         = deportes;
        this.cargando         = false;
      },
      error: () => {
        this.error    = 'Error al cargar los datos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get misClasesFiltradas(): ClaseDto[] {
    return this.todasClases.filter(c => {
      if (!this.misInscripciones.has(c.id_clase)) return false;
      return !this.filtroEstadoMis || c.estado === this.filtroEstadoMis;
    });
  }

  get clasesDisponibles(): ClaseDto[] {
    return this.todasClases.filter(c => {
      if (c.estado !== 'programada') return false;
      if (this.misInscripciones.has(c.id_clase)) return false;
      const okDeporte    = !this.filtroDeporte    || c.deporte?.id_deporte === +this.filtroDeporte;
      const okEntrenador = !this.busquedaEntrenador ||
        c.nombre_entrenador.toLowerCase().includes(this.busquedaEntrenador.toLowerCase());
      return okDeporte && okEntrenador;
    });
  }

  inscribir(clase: ClaseDto): void {
    this.asistirApi.inscribir(this.cedula, clase.id_clase).subscribe({
      next: () => {
        this.misInscripciones = new Set([...this.misInscripciones, clase.id_clase]);
        this.ok(`Inscrito en ${clase.deporte?.nombre ?? 'la clase'} correctamente.`);
      },
      error: (err) => {
        this.err(err?.error?.error ?? 'No se pudo inscribir. Verifica que haya cupos disponibles.');
      }
    });
  }

  desinscribir(clase: ClaseDto): void {
    if (!confirm('¿Deseas cancelar tu inscripción en esta clase?')) return;
    this.asistirApi.desinscribir(this.cedula, clase.id_clase).subscribe({
      next: () => {
        const s = new Set(this.misInscripciones);
        s.delete(clase.id_clase);
        this.misInscripciones = s;
        this.ok('Inscripción cancelada correctamente.');
      },
      error: () => { this.err('No se pudo cancelar la inscripción.'); }
    });
  }

  formatFecha(f: string): string {
    if (!f) return '—';
    try {
      const d = new Date(f + 'T00:00:00');
      if (isNaN(d.getTime())) return f;
      return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return f; }
  }

  formatHorario(c: ClaseDto): string {
    if (!c.horario) return '—';
    const dia = c.horario.dia_semana ?? '';
    return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${c.horario.hora_inicio}–${c.horario.hora_fin}`;
  }

  private ok(msg: string): void {
    this.mensajeOk    = msg;
    this.mensajeError = '';
    setTimeout(() => this.mensajeOk = '', 4000);
  }

  private err(msg: string): void {
    this.mensajeError = msg;
    this.mensajeOk    = '';
    setTimeout(() => this.mensajeError = '', 4000);
  }
}
