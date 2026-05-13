import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntrenadoresApiService } from '../../../../core/services/api/entrenadores-api.service';

interface Entrenador {
  cedula: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  tipo_entrenamiento: 'fuerza' | 'aerobico' | 'flexibilidad' | 'equilibrio';
  tiempo_experiencia: number;
  nivel_exigencia: 'bajo' | 'moderado' | 'medio' | 'alto' | 'extremo';
  fecha_ingreso_sis: string;
  deportes?: string[];
}

@Component({
  selector: 'app-entrenadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrenadores-page.component.html',
  styleUrl: './entrenadores-page.component.css'
})
export class EntrenadoresPageComponent implements OnInit {

  busqueda: string = '';
  filtroTipo: string = '';
  filtroExigencia: string = '';
  mostrarModal: boolean = false;
  entrenadorSeleccionado: Entrenador | null = null;
  modoEdicion: boolean = false;
  cargando: boolean = false;
  error: string = '';

  entrenadores: Entrenador[] = [];

  constructor(private entrenadoresApi: EntrenadoresApiService) {}

  ngOnInit(): void {
    this.cargarEntrenadores();
  }

  cargarEntrenadores(): void {
    this.cargando = true;
    this.error = '';
    this.entrenadoresApi.listarTodos().subscribe({
      next: (data: any[]) => {
        this.entrenadores = data.map(e => ({
          ...e,
          deportes: (e.deportes as any[] || []).map((d: any) =>
            typeof d === 'string' ? d : d.nombre
          )
        })) as Entrenador[];
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los entrenadores. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get entrenadoresFiltrados(): Entrenador[] {
    return this.entrenadores.filter(e => {
      const nombre = `${e.primer_nombre} ${e.primer_apellido} ${e.segundo_apellido}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || nombre.includes(this.busqueda.toLowerCase()) || e.cedula.includes(this.busqueda);
      const coincideTipo = !this.filtroTipo || e.tipo_entrenamiento === this.filtroTipo;
      const coincideExig = !this.filtroExigencia || e.nivel_exigencia === this.filtroExigencia;
      return coincideBusqueda && coincideTipo && coincideExig;
    });
  }

  abrirDetalle(entrenador: Entrenador) {
    this.entrenadorSeleccionado = { ...entrenador, deportes: [...(entrenador.deportes || [])] };
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  nuevoEntrenador() {
    this.entrenadorSeleccionado = {
      cedula: '', primer_nombre: '', primer_apellido: '', segundo_apellido: '',
      correo: '', telefono: '', fecha_nacimiento: '',
      tipo_entrenamiento: 'fuerza',
      tiempo_experiencia: 0,
      nivel_exigencia: 'bajo',
      fecha_ingreso_sis: new Date().toISOString().split('T')[0],
      deportes: []
    };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.entrenadorSeleccionado = null;
  }

  guardar() {
    if (!this.entrenadorSeleccionado) return;
    const existente = this.entrenadores.find(e => e.cedula === this.entrenadorSeleccionado!.cedula);
    const obs = existente
      ? this.entrenadoresApi.actualizar(this.entrenadorSeleccionado.cedula, this.entrenadorSeleccionado)
      : this.entrenadoresApi.crear(this.entrenadorSeleccionado);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarEntrenadores(); },
      error: () => { alert('Error al guardar el entrenador.'); }
    });
  }

  eliminar(cedula: string) {
    if (!confirm('¿Desea eliminar este entrenador?')) return;
    this.entrenadoresApi.eliminar(cedula).subscribe({
      next: () => { this.cerrarModal(); this.cargarEntrenadores(); },
      error: () => { alert('Error al eliminar el entrenador.'); }
    });
  }

  getNombreCompleto(e: Entrenador): string {
    return `${e.primer_nombre}${e.segundo_nombre ? ' ' + e.segundo_nombre : ''} ${e.primer_apellido} ${e.segundo_apellido}`;
  }

  getExperienciaTexto(meses: number): string {
    if (meses < 12) return `${meses} meses`;
    const años = Math.floor(meses / 12);
    const resto = meses % 12;
    return resto > 0 ? `${años} año${años > 1 ? 's' : ''} y ${resto} mes${resto > 1 ? 'es' : ''}` : `${años} año${años > 1 ? 's' : ''}`;
  }
}
