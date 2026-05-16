import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaquinasApiService } from '../../../../core/services/api/maquinas-api.service';
import { MantenimientoApiService } from '../../../../core/services/api/mantenimiento-api.service';
import { OperadoresApiService } from '../../../../core/services/api/operadores-api.service';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

interface MaquinaForm {
  codigo_serie: number;
  nombre_maquina: string;
  modelo: string;
  marca: string;
  tipo_maquina: string;
  estado: string;
  capacidad: number;
}

interface MantenimientoForm {
  operador_cedula: string;
  tipo_mant: string;
  fecha_mantenimiento: string;
  descripcion_mant: string;
}

@Component({
  selector: 'app-maquinas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './maquinas-page.component.html',
  styleUrl: './maquinas-page.component.css'
})
export class MaquinasPageComponent implements OnInit {

  busqueda = '';
  filtroEstado = '';
  filtroTipo = '';

  maquinas: any[] = [];
  paginaActual = 1;
  readonly itemsPorPagina = 10;
  operadores: any[] = [];
  mantenimientos: any[] = [];

  cargando = false;
  error = '';
  errorValidacion = '';

  mostrarModal = false;
  modoEdicion = false;
  esNueva = false;
  mostrarFormMant = false;

  maquinaSeleccionada: MaquinaForm | null = null;

  formMant: MantenimientoForm = {
    operador_cedula: '',
    tipo_mant: 'preventivo',
    fecha_mantenimiento: '',
    descripcion_mant: ''
  };

  constructor(
    private maquinasApi: MaquinasApiService,
    private mantenimientoApi: MantenimientoApiService,
    private operadoresApi: OperadoresApiService
  ) {}

  ngOnInit(): void {
    this.cargarMaquinas();
    this.cargarOperadores();
  }

  cargarMaquinas(): void {
    this.cargando = true;
    this.error = '';
    this.maquinasApi.listarTodas().subscribe({
      next: data => { this.maquinas = data; this.cargando = false; },
      error: () => { this.error = 'Error al cargar las máquinas. Verifica la conexión con el servidor.'; this.cargando = false; }
    });
  }

  cargarOperadores(): void {
    this.operadoresApi.listarTodos().subscribe({
      next: data => this.operadores = data,
      error: () => {}
    });
  }

  cargarMantenimientos(codigoSerie: number): void {
    this.mantenimientoApi.listarPorMaquina(codigoSerie).subscribe({
      next: data => this.mantenimientos = data,
      error: () => this.mantenimientos = []
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.maquinasFiltradas.length / this.itemsPorPagina)); }
  get maquinasPaginadas(): any[] { const i = (this.paginaActual - 1) * this.itemsPorPagina; return this.maquinasFiltradas.slice(i, i + this.itemsPorPagina); }
  cambiarPagina(n: number): void { this.paginaActual = n; }
  resetPagina(): void { this.paginaActual = 1; }

  get maquinasFiltradas(): any[] {
    return this.maquinas.filter(m => {
      const texto = `${m.nombre_maquina} ${m.marca} ${m.modelo}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.filtroEstado || m.estado === this.filtroEstado;
      const coincideTipo = !this.filtroTipo || m.tipo_maquina === this.filtroTipo;
      return coincideBusqueda && coincideEstado && coincideTipo;
    });
  }

  abrirDetalle(maquina: any): void {
    this.maquinaSeleccionada = { ...maquina };
    this.modoEdicion = false;
    this.esNueva = false;
    this.mostrarFormMant = false;
    this.errorValidacion = '';
    this.resetFormMant();
    this.cargarMantenimientos(maquina.codigo_serie);
    this.mostrarModal = true;
  }

  nuevaMaquina(): void {
    this.maquinaSeleccionada = {
      codigo_serie: 0,
      nombre_maquina: '',
      modelo: '',
      marca: '',
      tipo_maquina: 'cardio',
      estado: 'operativa',
      capacidad: 0
    };
    this.mantenimientos = [];
    this.modoEdicion = true;
    this.esNueva = true;
    this.mostrarFormMant = false;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  activarEdicion(): void {
    this.modoEdicion = true;
    this.mostrarFormMant = false;
    this.errorValidacion = '';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.maquinaSeleccionada = null;
    this.mantenimientos = [];
    this.errorValidacion = '';
    this.mostrarFormMant = false;
  }

  validarMaquina(): string | null {
    const m = this.maquinaSeleccionada!;
    if (!m.nombre_maquina?.trim()) return 'El nombre de la máquina es obligatorio.';
    if (!m.modelo?.trim()) return 'El modelo es obligatorio.';
    if (!m.marca?.trim()) return 'La marca es obligatoria.';
    if (!m.tipo_maquina) return 'El tipo de máquina es obligatorio.';
    if (!m.estado) return 'El estado es obligatorio.';
    if (m.capacidad == null || m.capacidad < 0) return 'La capacidad debe ser un valor positivo.';
    return null;
  }

  guardar(): void {
    if (!this.maquinaSeleccionada) return;
    const err = this.validarMaquina();
    if (err) { this.errorValidacion = err; return; }
    this.errorValidacion = '';

    const payload = {
      nombre_maquina: this.maquinaSeleccionada.nombre_maquina.trim(),
      modelo: this.maquinaSeleccionada.modelo.trim(),
      marca: this.maquinaSeleccionada.marca.trim(),
      tipo_maquina: this.maquinaSeleccionada.tipo_maquina,
      estado: this.maquinaSeleccionada.estado,
      capacidad: this.maquinaSeleccionada.capacidad
    };

    const obs = this.esNueva
      ? this.maquinasApi.crear(payload)
      : this.maquinasApi.actualizar(this.maquinaSeleccionada.codigo_serie, payload);

    obs.subscribe({
      next: saved => {
        this.cargarMaquinas();
        if (this.esNueva) {
          this.cerrarModal();
        } else {
          this.maquinaSeleccionada = { ...saved };
          this.modoEdicion = false;
        }
      },
      error: e => {
        this.errorValidacion = e?.error?.error || 'Error al guardar la máquina.';
      }
    });
  }

  eliminarMaquina(): void {
    if (!this.maquinaSeleccionada) return;
    if (!confirm('¿Desea eliminar esta máquina? Esta acción no se puede deshacer.')) return;
    this.maquinasApi.eliminar(this.maquinaSeleccionada.codigo_serie).subscribe({
      next: () => { this.cerrarModal(); this.cargarMaquinas(); },
      error: e => { this.errorValidacion = e?.error?.error || 'Error al eliminar la máquina.'; }
    });
  }

  // ---- Mantenimiento ----

  resetFormMant(): void {
    this.formMant = {
      operador_cedula: '',
      tipo_mant: 'preventivo',
      fecha_mantenimiento: '',
      descripcion_mant: ''
    };
  }

  abrirFormMant(): void {
    this.resetFormMant();
    this.errorValidacion = '';
    this.mostrarFormMant = true;
  }

  cancelarFormMant(): void {
    this.mostrarFormMant = false;
    this.resetFormMant();
    this.errorValidacion = '';
  }

  validarMant(): string | null {
    if (!this.formMant.operador_cedula) return 'Selecciona un operador.';
    if (!this.formMant.tipo_mant) return 'Selecciona el tipo de mantenimiento.';
    if (!this.formMant.fecha_mantenimiento) return 'La fecha de mantenimiento es obligatoria.';
    if (!this.formMant.descripcion_mant?.trim()) return 'La descripción es obligatoria.';
    return null;
  }

  registrarMant(): void {
    if (!this.maquinaSeleccionada) return;
    const err = this.validarMant();
    if (err) { this.errorValidacion = err; return; }
    this.errorValidacion = '';

    const payload = {
      operador_cedula: this.formMant.operador_cedula,
      codigo_serie_maquina: this.maquinaSeleccionada.codigo_serie,
      tipo_mant: this.formMant.tipo_mant,
      fecha_mantenimiento: this.formMant.fecha_mantenimiento,
      descripcion_mant: this.formMant.descripcion_mant.trim()
    };

    this.mantenimientoApi.registrar(payload).subscribe({
      next: () => {
        this.cancelarFormMant();
        this.cargarMantenimientos(this.maquinaSeleccionada!.codigo_serie);
      },
      error: e => {
        this.errorValidacion = e?.error?.error || 'Error al registrar el mantenimiento.';
      }
    });
  }

  eliminarMant(cedula: string): void {
    if (!this.maquinaSeleccionada) return;
    if (!confirm('¿Eliminar este registro de mantenimiento?')) return;
    this.mantenimientoApi.eliminar(cedula, this.maquinaSeleccionada.codigo_serie).subscribe({
      next: () => this.cargarMantenimientos(this.maquinaSeleccionada!.codigo_serie),
      error: e => { this.errorValidacion = e?.error?.error || 'Error al eliminar el mantenimiento.'; }
    });
  }

  // ---- Labels ----

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      cardio: 'Cardio', fuerza: 'Fuerza', funcional: 'Funcional',
      rehabilitacion: 'Rehabilitación', pesas: 'Pesas', otra: 'Otra'
    };
    return map[tipo] || tipo;
  }

  labelEstado(estado: string): string {
    const map: Record<string, string> = {
      operativa: 'Operativa', en_mantenimiento: 'En mantenimiento',
      en_reparacion: 'En reparación', fuera_de_servicio: 'Fuera de servicio'
    };
    return map[estado] || estado;
  }

  labelTipoMant(tipo: string): string {
    const map: Record<string, string> = {
      preventivo: 'Preventivo', correctivo: 'Correctivo', locativo: 'Locativo'
    };
    return map[tipo] || tipo;
  }

  getNombreCompleto(op: any): string {
    return `${op.primer_nombre} ${op.primer_apellido}`;
  }
}
