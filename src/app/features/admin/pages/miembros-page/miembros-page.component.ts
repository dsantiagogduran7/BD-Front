import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MiembrosApiService } from '../../../../core/services/api/miembros-api.service';
import { MiembroDto } from '../../../../models/dto/miembro.dto';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-miembros',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './miembros-page.component.html',
  styleUrl: './miembros-page.component.css'
})
export class MiembrosPageComponent implements OnInit {

  busqueda: string = '';
  filtroExperiencia: string = '';
  filtroMembresia: string = '';
  mostrarModal: boolean = false;
  miembroSeleccionado: MiembroDto | null = null;
  modoEdicion: boolean = false;
  esNuevo: boolean = false;
  cargando: boolean = false;
  error: string = '';
  errorValidacion: string = '';

  miembros: MiembroDto[] = [];
  paginaActual = 1;
  readonly itemsPorPagina = 10;

  constructor(private miembrosApi: MiembrosApiService) {}

  ngOnInit(): void {
    this.cargarMiembros();
  }

  cargarMiembros(): void {
    this.cargando = true;
    this.error = '';
    this.miembrosApi.listarTodos().subscribe({
      next: (data) => {
        this.miembros = data as MiembroDto[];
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los miembros. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.miembrosFiltrados.length / this.itemsPorPagina)); }
  get miembrosPaginados(): MiembroDto[] { const i = (this.paginaActual - 1) * this.itemsPorPagina; return this.miembrosFiltrados.slice(i, i + this.itemsPorPagina); }
  cambiarPagina(n: number): void { this.paginaActual = n; }
  resetPagina(): void { this.paginaActual = 1; }

  get miembrosFiltrados(): MiembroDto[] {
    return this.miembros.filter(m => {
      const nombreCompleto = `${m.primer_nombre} ${m.primer_apellido} ${m.segundo_apellido}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || nombreCompleto.includes(this.busqueda.toLowerCase()) || m.cedula.includes(this.busqueda);
      const coincideExp = !this.filtroExperiencia || m.nivel_experiencia === this.filtroExperiencia;
      const coincideMem = !this.filtroMembresia || m.membresia_estado === this.filtroMembresia;
      return coincideBusqueda && coincideExp && coincideMem;
    });
  }

  abrirDetalle(miembro: MiembroDto) {
    this.miembroSeleccionado = { ...miembro };
    this.modoEdicion = false;
    this.esNuevo = false;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  nuevoMiembro() {
    this.miembroSeleccionado = {
      cedula: '', primer_nombre: '', primer_apellido: '', segundo_apellido: '',
      correo: '', telefono: '', fecha_nacimiento: '', rol: 'miembro',
      password: '',
      altura: 0, peso_actual: 0, nivel_experiencia: 'novato',
      membresia_estado: 'inactiva'
    };
    this.modoEdicion = true;
    this.esNuevo = true;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.miembroSeleccionado = null;
    this.esNuevo = false;
    this.errorValidacion = '';
  }

  get hoy(): string { return new Date().toISOString().split('T')[0]; }
  get maxFechaNacimiento(): string {
    const d = new Date(); d.setFullYear(d.getFullYear() - 16); return d.toISOString().split('T')[0];
  }

  private calcularEdad(fecha: string): number {
    const hoy = new Date(), nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  private validar(): string {
    const m = this.miembroSeleccionado!;
    if (!m.cedula?.trim()) return 'La cédula es obligatoria.';
    if (m.cedula.trim().length > 15) return 'La cédula no puede tener más de 15 caracteres.';
    if (!/^[a-zA-Z0-9]+$/.test(m.cedula.trim())) return 'La cédula solo puede contener letras y números.';
    if (!m.primer_nombre?.trim()) return 'El primer nombre es obligatorio.';
    if (!m.primer_apellido?.trim()) return 'El primer apellido es obligatorio.';
    if (!m.segundo_apellido?.trim()) return 'El segundo apellido es obligatorio.';
    if (!m.correo?.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.correo)) return 'El correo no tiene un formato válido.';
    if (!m.telefono?.trim()) return 'El teléfono es obligatorio.';
    if (!/^\+?[0-9\s\-]{7,20}$/.test(m.telefono.trim())) return 'El teléfono solo puede contener dígitos, espacios, + o - (mínimo 7 dígitos).';
    if (!m.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (m.fecha_nacimiento > this.hoy) return 'La fecha de nacimiento no puede ser futura.';
    if (this.calcularEdad(m.fecha_nacimiento) < 16) return 'El miembro debe tener al menos 16 años.';
    if (!m.altura || m.altura < 50 || m.altura > 250) return 'La altura debe estar entre 50 y 250 cm.';
    if (!m.peso_actual || m.peso_actual < 20 || m.peso_actual > 300) return 'El peso debe estar entre 20 y 300 kg.';
    if (this.esNuevo && !m.password?.trim()) return 'La contraseña es obligatoria.';
    if (this.esNuevo && m.password!.trim().length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
  }

  guardar() {
    if (!this.miembroSeleccionado) return;
    const msg = this.validar();
    if (msg) { this.errorValidacion = msg; return; }
    this.errorValidacion = '';

    const payload = {
      cedula: this.miembroSeleccionado.cedula,
      primer_nombre: this.miembroSeleccionado.primer_nombre,
      segundo_nombre: this.miembroSeleccionado.segundo_nombre,
      primer_apellido: this.miembroSeleccionado.primer_apellido,
      segundo_apellido: this.miembroSeleccionado.segundo_apellido,
      correo: this.miembroSeleccionado.correo,
      telefono: this.miembroSeleccionado.telefono,
      fecha_nacimiento: this.miembroSeleccionado.fecha_nacimiento,
      password: this.miembroSeleccionado.password,
      altura: this.miembroSeleccionado.altura,
      peso_actual: this.miembroSeleccionado.peso_actual,
      nivel_experiencia: this.miembroSeleccionado.nivel_experiencia
    };

    const obs = this.esNuevo
      ? this.miembrosApi.crear(payload)
      : this.miembrosApi.actualizar(this.miembroSeleccionado.cedula, payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarMiembros(); },
      error: (err) => {
        this.errorValidacion = err?.error?.error || 'Error al guardar. Verifica que los datos sean correctos.';
      }
    });
  }

  eliminar(cedula: string) {
    if (!confirm('¿Desea eliminar este miembro?')) return;
    this.miembrosApi.eliminar(cedula).subscribe({
      next: () => { this.cerrarModal(); this.cargarMiembros(); },
      error: (err) => {
        this.errorValidacion = err?.error?.error || 'Error al eliminar el miembro.';
      }
    });
  }

  getNombreCompleto(m: MiembroDto): string {
    return `${m.primer_nombre}${m.segundo_nombre ? ' ' + m.segundo_nombre : ''} ${m.primer_apellido} ${m.segundo_apellido}`;
  }

  getEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }
}