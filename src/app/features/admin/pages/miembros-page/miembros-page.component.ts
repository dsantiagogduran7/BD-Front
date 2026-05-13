import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MiembrosApiService } from '../../../../core/services/api/miembros-api.service';

interface Miembro {
  cedula: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  altura: number;
  peso_actual: number;
  nivel_experiencia: 'novato' | 'avanzado' | 'profesional';
  membresia_estado?: 'activa' | 'inactiva' | 'vencida' | 'suspendida';
  plan_nombre?: string;
}

@Component({
  selector: 'app-miembros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './miembros-page.component.html',
  styleUrl: './miembros-page.component.css'
})
export class MiembrosPageComponent implements OnInit {

  busqueda: string = '';
  filtroExperiencia: string = '';
  filtroMembresia: string = '';
  mostrarModal: boolean = false;
  miembroSeleccionado: Miembro | null = null;
  modoEdicion: boolean = false;
  cargando: boolean = false;
  error: string = '';

  miembros: Miembro[] = [];

  constructor(private miembrosApi: MiembrosApiService) {}

  ngOnInit(): void {
    this.cargarMiembros();
  }

  cargarMiembros(): void {
    this.cargando = true;
    this.error = '';
    this.miembrosApi.listarTodos().subscribe({
      next: (data) => {
        this.miembros = data as Miembro[];
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los miembros. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get miembrosFiltrados(): Miembro[] {
    return this.miembros.filter(m => {
      const nombreCompleto = `${m.primer_nombre} ${m.primer_apellido} ${m.segundo_apellido}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || nombreCompleto.includes(this.busqueda.toLowerCase()) || m.cedula.includes(this.busqueda);
      const coincideExp = !this.filtroExperiencia || m.nivel_experiencia === this.filtroExperiencia;
      const coincideMem = !this.filtroMembresia || m.membresia_estado === this.filtroMembresia;
      return coincideBusqueda && coincideExp && coincideMem;
    });
  }

  abrirDetalle(miembro: Miembro) {
    this.miembroSeleccionado = { ...miembro };
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  nuevoMiembro() {
    this.miembroSeleccionado = {
      cedula: '', primer_nombre: '', primer_apellido: '', segundo_apellido: '',
      correo: '', telefono: '', fecha_nacimiento: '',
      altura: 0, peso_actual: 0, nivel_experiencia: 'novato',
      membresia_estado: 'inactiva'
    };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.miembroSeleccionado = null;
  }

  guardar() {
    if (!this.miembroSeleccionado) return;
    const payload = {
      cedula: this.miembroSeleccionado.cedula,
      primer_nombre: this.miembroSeleccionado.primer_nombre,
      segundo_nombre: this.miembroSeleccionado.segundo_nombre,
      primer_apellido: this.miembroSeleccionado.primer_apellido,
      segundo_apellido: this.miembroSeleccionado.segundo_apellido,
      correo: this.miembroSeleccionado.correo,
      telefono: this.miembroSeleccionado.telefono,
      fecha_nacimiento: this.miembroSeleccionado.fecha_nacimiento,
      altura: this.miembroSeleccionado.altura,
      peso_actual: this.miembroSeleccionado.peso_actual,
      nivel_experiencia: this.miembroSeleccionado.nivel_experiencia
    };
    const existente = this.miembros.find(m => m.cedula === this.miembroSeleccionado!.cedula);
    const obs = existente
      ? this.miembrosApi.actualizar(this.miembroSeleccionado.cedula, payload)
      : this.miembrosApi.crear(payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarMiembros(); },
      error: () => { alert('Error al guardar el miembro.'); }
    });
  }

  eliminar(cedula: string) {
    if (!confirm('¿Desea eliminar este miembro?')) return;
    this.miembrosApi.eliminar(cedula).subscribe({
      next: () => { this.cerrarModal(); this.cargarMiembros(); },
      error: () => { alert('Error al eliminar el miembro.'); }
    });
  }

  getNombreCompleto(m: Miembro): string {
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
