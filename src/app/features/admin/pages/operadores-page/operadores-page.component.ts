import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperadoresApiService } from '../../../../core/services/api/operadores-api.service';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';
import { OperadorDto } from '../../../../models/dto/operador.dto';

@Component({
  selector: 'app-operadores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './operadores-page.component.html',
  styleUrl: './operadores-page.component.css'
})
export class OperadoresPageComponent implements OnInit {

  busqueda = '';
  filtroTipo = '';
  filtroEspecialidad = '';
  mostrarModal = false;
  modoEdicion = false;
  esNuevo = false;
  cargando = false;
  error = '';
  errorValidacion = '';

  operadores: OperadorDto[] = [];
  paginaActual = 1;
  readonly itemsPorPagina = 10;
  operadorSeleccionado: (OperadorDto & { password?: string }) | null = null;

  constructor(private operadoresApi: OperadoresApiService) {}

  ngOnInit(): void {
    this.cargarOperadores();
  }

  cargarOperadores(): void {
    this.cargando = true;
    this.error = '';
    this.operadoresApi.listarTodos().subscribe({
      next: (data: any[]) => {
        this.operadores = data as OperadorDto[];
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los operadores. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.operadoresFiltrados.length / this.itemsPorPagina)); }
  get operadoresPaginados(): OperadorDto[] { const i = (this.paginaActual - 1) * this.itemsPorPagina; return this.operadoresFiltrados.slice(i, i + this.itemsPorPagina); }
  cambiarPagina(n: number): void { this.paginaActual = n; }
  resetPagina(): void { this.paginaActual = 1; }

  get operadoresFiltrados(): OperadorDto[] {
    return this.operadores.filter(o => {
      const nombre = `${o.primer_nombre} ${o.primer_apellido} ${o.segundo_apellido}`.toLowerCase();
      const coincideBusqueda = !this.busqueda ||
        nombre.includes(this.busqueda.toLowerCase()) ||
        o.cedula.includes(this.busqueda);
      const coincideTipo = !this.filtroTipo || o.tipo_operador === this.filtroTipo;
      const coincideEsp = !this.filtroEspecialidad || o.especialidad === this.filtroEspecialidad;
      return coincideBusqueda && coincideTipo && coincideEsp;
    });
  }

  abrirDetalle(operador: OperadorDto): void {
    this.operadorSeleccionado = { ...operador };
    this.modoEdicion = false;
    this.esNuevo = false;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  nuevoOperador(): void {
    this.operadorSeleccionado = {
      cedula: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      correo: '',
      telefono: '',
      fecha_nacimiento: '',
      rol: 'operador',
      nivel_tecnico: 'basico',
      especialidad: 'mecanico',
      tipo_operador: 'preventivo',
      password: ''
    };
    this.modoEdicion = true;
    this.esNuevo = true;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  activarEdicion(): void {
    this.modoEdicion = true;
    if (this.operadorSeleccionado) {
      this.operadorSeleccionado = { ...this.operadorSeleccionado, password: '' };
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.operadorSeleccionado = null;
    this.esNuevo = false;
    this.modoEdicion = false;
    this.errorValidacion = '';
  }

  get hoy(): string { return new Date().toISOString().split('T')[0]; }
  get maxFechaNacimiento(): string {
    const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0];
  }

  private calcularEdad(fecha: string): number {
    const hoy = new Date(), nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  private validar(): string {
    const o = this.operadorSeleccionado!;
    if (!o.cedula?.trim()) return 'La cédula es obligatoria.';
    if (o.cedula.trim().length > 15) return 'La cédula no puede tener más de 15 caracteres.';
    if (!/^[a-zA-Z0-9]+$/.test(o.cedula.trim())) return 'La cédula solo puede contener letras y números.';
    if (!o.primer_nombre?.trim()) return 'El primer nombre es obligatorio.';
    if (!o.primer_apellido?.trim()) return 'El primer apellido es obligatorio.';
    if (!o.segundo_apellido?.trim()) return 'El segundo apellido es obligatorio.';
    if (!o.correo?.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.correo)) return 'El correo no tiene un formato válido.';
    if (!o.telefono?.trim()) return 'El teléfono es obligatorio.';
    if (!/^\+?[0-9\s\-]{7,20}$/.test(o.telefono.trim())) return 'El teléfono solo puede contener dígitos, espacios, + o - (mínimo 7 dígitos).';
    if (!o.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (o.fecha_nacimiento > this.hoy) return 'La fecha de nacimiento no puede ser futura.';
    if (this.calcularEdad(o.fecha_nacimiento) < 18) return 'El operador debe tener al menos 18 años.';
    if (!o.nivel_tecnico) return 'El nivel técnico es obligatorio.';
    if (!o.especialidad) return 'La especialidad es obligatoria.';
    if (!o.tipo_operador) return 'El tipo de operador es obligatorio.';
    if (this.esNuevo && !o.password?.trim()) return 'La contraseña es obligatoria.';
    if (o.password?.trim() && o.password.trim().length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
  }

  guardar(): void {
    if (!this.operadorSeleccionado) return;
    const msg = this.validar();
    if (msg) { this.errorValidacion = msg; return; }
    this.errorValidacion = '';

    const payload = {
      cedula: this.operadorSeleccionado.cedula,
      primer_nombre: this.operadorSeleccionado.primer_nombre,
      segundo_nombre: this.operadorSeleccionado.segundo_nombre || '',
      primer_apellido: this.operadorSeleccionado.primer_apellido,
      segundo_apellido: this.operadorSeleccionado.segundo_apellido,
      correo: this.operadorSeleccionado.correo,
      telefono: this.operadorSeleccionado.telefono,
      fecha_nacimiento: this.operadorSeleccionado.fecha_nacimiento,
      nivel_tecnico: this.operadorSeleccionado.nivel_tecnico,
      especialidad: this.operadorSeleccionado.especialidad,
      tipo_operador: this.operadorSeleccionado.tipo_operador,
      password: this.operadorSeleccionado.password
    };

    const obs = this.esNuevo
      ? this.operadoresApi.crear(payload)
      : this.operadoresApi.actualizar(this.operadorSeleccionado.cedula, payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarOperadores(); },
      error: (err) => {
        this.errorValidacion = err?.error?.error || 'Error al guardar. Verifica que los datos sean correctos.';
      }
    });
  }

  eliminar(cedula: string): void {
    if (!confirm('¿Desea eliminar este operador?')) return;
    this.operadoresApi.eliminar(cedula).subscribe({
      next: () => { this.cerrarModal(); this.cargarOperadores(); },
      error: () => { this.errorValidacion = 'Error al eliminar el operador.'; }
    });
  }

  getNombreCompleto(o: OperadorDto): string {
    return `${o.primer_nombre}${o.segundo_nombre ? ' ' + o.segundo_nombre : ''} ${o.primer_apellido} ${o.segundo_apellido}`;
  }

  labelNivel(n: string): string {
    const map: Record<string, string> = {
      basico: 'Básico', intermedio: 'Intermedio',
      avanzado: 'Avanzado', experto: 'Experto'
    };
    return map[n] ?? n;
  }

  labelEspecialidad(e: string): string {
    const map: Record<string, string> = {
      mecanico: 'Mecánico', electrico: 'Eléctrico',
      inspeccion: 'Inspección', gestion_instalaciones: 'Gestión de Instalaciones'
    };
    return map[e] ?? e;
  }

  labelTipo(t: string): string {
    const map: Record<string, string> = {
      preventivo: 'Preventivo', correctivo: 'Correctivo', locativo: 'Locativo'
    };
    return map[t] ?? t;
  }
}
