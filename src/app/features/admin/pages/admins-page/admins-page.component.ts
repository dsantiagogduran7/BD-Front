import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonasApiService } from '../../../../core/services/api/personas-api.service';

interface AdminDto {
  cedula: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: string;
  password?: string;
}

@Component({
  selector: 'app-admins-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admins-page.component.html',
  styleUrl: './admins-page.component.css'
})
export class AdminsPageComponent implements OnInit {

  busqueda      = '';
  mostrarModal  = false;
  adminSeleccionado: AdminDto | null = null;
  modoEdicion   = false;
  esNuevo       = false;
  cargando      = false;
  error         = '';
  errorValidacion = '';

  admins: AdminDto[] = [];

  constructor(private personasApi: PersonasApiService) {}

  ngOnInit(): void {
    this.cargarAdmins();
  }

  cargarAdmins(): void {
    this.cargando = true;
    this.error = '';
    this.personasApi.listarPorRol('administrador').subscribe({
      next: (data) => {
        this.admins = data as AdminDto[];
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los administradores. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get adminsFiltrados(): AdminDto[] {
    if (!this.busqueda) return this.admins;
    const q = this.busqueda.toLowerCase();
    return this.admins.filter(a =>
      `${a.primer_nombre} ${a.primer_apellido} ${a.segundo_apellido}`.toLowerCase().includes(q) ||
      a.cedula.includes(q) ||
      a.correo.toLowerCase().includes(q)
    );
  }

  abrirDetalle(admin: AdminDto): void {
    this.adminSeleccionado = { ...admin };
    this.modoEdicion = false;
    this.esNuevo = false;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  nuevoAdmin(): void {
    this.adminSeleccionado = {
      cedula: '', primer_nombre: '', segundo_nombre: '',
      primer_apellido: '', segundo_apellido: '',
      correo: '', telefono: '', fecha_nacimiento: '',
      rol: 'administrador', password: ''
    };
    this.modoEdicion = true;
    this.esNuevo = true;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.adminSeleccionado = null;
    this.esNuevo = false;
    this.errorValidacion = '';
  }

  get maxFechaNacimiento(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }

  private validar(): string {
    const a = this.adminSeleccionado!;
    if (!a.cedula?.trim()) return 'La cédula es obligatoria.';
    if (a.cedula.trim().length > 15) return 'La cédula no puede tener más de 15 caracteres.';
    if (!a.primer_nombre?.trim()) return 'El primer nombre es obligatorio.';
    if (!a.primer_apellido?.trim()) return 'El primer apellido es obligatorio.';
    if (!a.segundo_apellido?.trim()) return 'El segundo apellido es obligatorio.';
    if (!a.correo?.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.correo)) return 'El correo no tiene un formato válido.';
    if (!a.telefono?.trim()) return 'El teléfono es obligatorio.';
    if (!a.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (this.esNuevo && !a.password?.trim()) return 'La contraseña es obligatoria.';
    if (this.esNuevo && a.password!.trim().length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
  }

  guardar(): void {
    if (!this.adminSeleccionado) return;
    const msg = this.validar();
    if (msg) { this.errorValidacion = msg; return; }
    this.errorValidacion = '';

    const a = this.adminSeleccionado;
    const payload: any = {
      cedula:          a.cedula.trim(),
      primer_nombre:   a.primer_nombre.trim(),
      segundo_nombre:  a.segundo_nombre?.trim() || undefined,
      primer_apellido: a.primer_apellido.trim(),
      segundo_apellido: a.segundo_apellido.trim(),
      correo:          a.correo.trim(),
      telefono:        a.telefono.trim(),
      fecha_nacimiento: a.fecha_nacimiento,
      rol:             'administrador',
      password:        a.password
    };

    const obs = this.esNuevo
      ? this.personasApi.crear(payload)
      : this.personasApi.actualizar(a.cedula, payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarAdmins(); },
      error: (err) => {
        this.errorValidacion = err?.error?.error || 'Error al guardar. Verifica que los datos sean correctos.';
      }
    });
  }

  eliminar(cedula: string): void {
    if (!confirm('¿Desea eliminar este administrador?')) return;
    this.personasApi.eliminar(cedula).subscribe({
      next: () => { this.cerrarModal(); this.cargarAdmins(); },
      error: (err) => {
        this.errorValidacion = err?.error?.error || 'Error al eliminar el administrador.';
      }
    });
  }

  getNombreCompleto(a: AdminDto): string {
    return `${a.primer_nombre}${a.segundo_nombre ? ' ' + a.segundo_nombre : ''} ${a.primer_apellido} ${a.segundo_apellido}`;
  }

  getEdad(fecha: string): number {
    if (!fecha) return 0;
    const hoy = new Date(), nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }
}
