import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { SessionService } from '../../../../core/services/session.service';
import { MaquinasApiService } from '../../../../core/services/api/maquinas-api.service';
import { MantenimientoApiService } from '../../../../core/services/api/mantenimiento-api.service';

@Component({
  selector: 'app-maquinas-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maquinas-page.component.html',
  styleUrl: './maquinas-page.component.css'
})
export class MaquinasPageComponent implements OnInit {

  private session = inject(SessionService);

  misMaquinas: any[] = [];
  disponibles: any[] = [];
  misMant: any[] = [];

  cargando = true;
  error = '';
  errorAccion = '';

  mostrarCambioEstado = false;
  maquinaEditando: any = null;
  nuevoEstado = '';

  private myCedula = '';

  readonly estados = ['en_mantenimiento', 'en_reparacion', 'fuera_de_servicio', 'operativa'];

  constructor(
    private maquinasApi: MaquinasApiService,
    private mantenimientoApi: MantenimientoApiService
  ) {}

  ngOnInit(): void {
    const op = this.session.getPerfilOperador();
    if (op) this.myCedula = op.cedula;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.errorAccion = '';

    const misMant$ = this.myCedula
      ? this.mantenimientoApi.listarPorOperador(this.myCedula)
      : of([]);

    forkJoin({
      todasMaquinas: this.maquinasApi.listarTodas(),
      todosMant: this.mantenimientoApi.listarTodos(),
      misMant: misMant$
    }).subscribe({
      next: ({ todasMaquinas, todosMant, misMant }) => {
        this.misMant = misMant as any[];

        const conOperador = new Set((todosMant as any[]).map(m => m.codigo_serie_maquina));
        const misCodigos = new Set((misMant as any[]).map(m => m.codigo_serie_maquina));

        this.misMaquinas = (todasMaquinas as any[]).filter(m => misCodigos.has(m.codigo_serie));
        this.disponibles  = (todasMaquinas as any[]).filter(m => !conOperador.has(m.codigo_serie));

        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los datos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  getMiMant(codigoSerie: number): any {
    return this.misMant.find(m => m.codigo_serie_maquina === codigoSerie) ?? null;
  }

  abrirCambioEstado(maquina: any): void {
    this.maquinaEditando = maquina;
    this.nuevoEstado = maquina.estado;
    this.errorAccion = '';
    this.mostrarCambioEstado = true;
  }

  guardarEstado(): void {
    if (!this.nuevoEstado || !this.maquinaEditando) return;
    this.maquinasApi.cambiarEstado(this.maquinaEditando.codigo_serie, this.nuevoEstado).subscribe({
      next: () => {
        this.mostrarCambioEstado = false;
        this.maquinaEditando = null;
        this.cargar();
      },
      error: () => { this.errorAccion = 'Error al cambiar el estado.'; }
    });
  }

  cerrarCambioEstado(): void {
    this.mostrarCambioEstado = false;
    this.maquinaEditando = null;
    this.errorAccion = '';
  }

  liberarMaquina(codigoSerie: number): void {
    if (!confirm('¿Deseas liberar esta máquina? Se eliminará tu asignación.')) return;
    this.mantenimientoApi.eliminar(this.myCedula, codigoSerie).subscribe({
      next: () => this.cargar(),
      error: () => { this.errorAccion = 'Error al liberar la máquina.'; }
    });
  }

  reclamarMaquina(maquina: any): void {
    if (!confirm(`¿Deseas tomar la máquina "${maquina.nombre_maquina}"?`)) return;
    const hoy = new Date().toISOString().split('T')[0];
    const payload = {
      operador_cedula: this.myCedula,
      codigo_serie_maquina: maquina.codigo_serie,
      tipo_mant: 'preventivo',
      fecha_mantenimiento: hoy,
      descripcion_mant: 'Asignado por operador'
    };
    this.mantenimientoApi.registrar(payload).subscribe({
      next: () => this.cargar(),
      error: () => { this.errorAccion = 'Error al reclamar la máquina.'; }
    });
  }

  labelEstado(estado: string): string {
    const map: Record<string, string> = {
      operativa: 'Operativa', en_mantenimiento: 'En Mantenimiento',
      en_reparacion: 'En Reparación', fuera_de_servicio: 'Fuera de Servicio'
    };
    return map[estado] || estado;
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      cardio: 'Cardio', fuerza: 'Fuerza', funcional: 'Funcional',
      rehabilitacion: 'Rehabilitación', pesas: 'Pesas', otra: 'Otra'
    };
    return map[tipo] || tipo;
  }

  labelTipoMant(tipo: string): string {
    const map: Record<string, string> = {
      preventivo: 'Preventivo', correctivo: 'Correctivo', locativo: 'Locativo'
    };
    return map[tipo] || tipo;
  }
}
