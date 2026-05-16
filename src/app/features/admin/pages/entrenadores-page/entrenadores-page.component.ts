import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntrenadoresApiService } from '../../../../core/services/api/entrenadores-api.service';
import { DeportesApiService } from '../../../../core/services/api/deportes-api.service';
import { EntrenadorDto } from '../../../../models/dto/entrenador.dto';
import { PaginacionComponent } from '../../../../shared/components/paginacion/paginacion.component';

type DeporteItem = { id_deporte: number; nombre: string };

@Component({
  selector: 'app-entrenadores',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent],
  templateUrl: './entrenadores-page.component.html',
  styleUrl: './entrenadores-page.component.css'
})
export class EntrenadoresPageComponent implements OnInit {

  busqueda: string = '';
  filtroTipo: string = '';
  filtroExigencia: string = '';
  mostrarModal: boolean = false;
  entrenadorSeleccionado: EntrenadorDto | null = null;
  modoEdicion: boolean = false;
  esNuevo: boolean = false;
  cargando: boolean = false;
  error: string = '';
  errorValidacion: string = '';

  entrenadores: EntrenadorDto[] = [];
  deportesDisponibles: DeporteItem[] = [];
  paginaActual = 1;
  readonly itemsPorPagina = 10;

  constructor(
    private entrenadoresApi: EntrenadoresApiService,
    private deportesApi: DeportesApiService
  ) {}

  ngOnInit(): void {
    this.cargarEntrenadores();
    this.deportesApi.listarTodos().subscribe({
      next: (data) => { this.deportesDisponibles = data.map(d => ({ id_deporte: d.id_deporte, nombre: d.nombre })); }
    });
  }

  cargarEntrenadores(): void {
    this.cargando = true;
    this.error = '';
    this.entrenadoresApi.listarTodos().subscribe({
      next: (data: any[]) => {
        this.entrenadores = data.map(e => ({
          ...e,
          deportes: (e.deportes as any[] || []).map((d: any) => ({
            id_deporte: d.id_deporte,
            nombre: d.nombre
          }))
        })) as EntrenadorDto[];
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los entrenadores. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.entrenadoresFiltrados.length / this.itemsPorPagina)); }
  get entrenadoresPaginados(): EntrenadorDto[] { const i = (this.paginaActual - 1) * this.itemsPorPagina; return this.entrenadoresFiltrados.slice(i, i + this.itemsPorPagina); }
  cambiarPagina(n: number): void { this.paginaActual = n; }
  resetPagina(): void { this.paginaActual = 1; }

  get entrenadoresFiltrados(): EntrenadorDto[] {
    return this.entrenadores.filter(e => {
      const nombre = `${e.primer_nombre} ${e.primer_apellido} ${e.segundo_apellido}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || nombre.includes(this.busqueda.toLowerCase()) || e.cedula.includes(this.busqueda);
      const coincideTipo = !this.filtroTipo || e.tipo_entrenamiento === this.filtroTipo;
      const coincideExig = !this.filtroExigencia || e.nivel_exigencia === this.filtroExigencia;
      return coincideBusqueda && coincideTipo && coincideExig;
    });
  }

  abrirDetalle(entrenador: EntrenadorDto) {
    this.entrenadorSeleccionado = { ...entrenador, deportes: [...(entrenador.deportes || [])] };
    this.modoEdicion = false;
    this.esNuevo = false;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  nuevoEntrenador() {
    this.entrenadorSeleccionado = {
      cedula: '', primer_nombre: '', primer_apellido: '', segundo_apellido: '',
      correo: '', telefono: '', fecha_nacimiento: '', rol: 'entrenador',
      password: '',
      tipo_entrenamiento: 'fuerza',
      tiempo_experiencia: 0,
      nivel_exigencia: 'bajo',
      fecha_ingreso_sis: new Date().toISOString().split('T')[0],
      deportes: []
    };
    this.modoEdicion = true;
    this.esNuevo = true;
    this.errorValidacion = '';
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.entrenadorSeleccionado = null;
    this.esNuevo = false;
    this.errorValidacion = '';
  }

  isDeporteSeleccionado(id: number): boolean {
    return (this.entrenadorSeleccionado?.deportes || []).some(d => d.id_deporte === id);
  }

  toggleDeporte(deporte: DeporteItem): void {
    if (!this.entrenadorSeleccionado) return;
    const deportes = this.entrenadorSeleccionado.deportes || [];
    const idx = deportes.findIndex(d => d.id_deporte === deporte.id_deporte);
    if (idx >= 0) {
      this.entrenadorSeleccionado.deportes = deportes.filter(d => d.id_deporte !== deporte.id_deporte);
    } else {
      this.entrenadorSeleccionado.deportes = [...deportes, deporte];
    }
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
    const e = this.entrenadorSeleccionado!;
    if (!e.cedula?.trim()) return 'La cédula es obligatoria.';
    if (e.cedula.trim().length > 15) return 'La cédula no puede tener más de 15 caracteres.';
    if (!/^[a-zA-Z0-9]+$/.test(e.cedula.trim())) return 'La cédula solo puede contener letras y números.';
    if (!e.primer_nombre?.trim()) return 'El primer nombre es obligatorio.';
    if (!e.primer_apellido?.trim()) return 'El primer apellido es obligatorio.';
    if (!e.segundo_apellido?.trim()) return 'El segundo apellido es obligatorio.';
    if (!e.correo?.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.correo)) return 'El correo no tiene un formato válido.';
    if (!e.telefono?.trim()) return 'El teléfono es obligatorio.';
    if (!/^\+?[0-9\s\-]{7,20}$/.test(e.telefono.trim())) return 'El teléfono solo puede contener dígitos, espacios, + o - (mínimo 7 dígitos).';
    if (!e.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (e.fecha_nacimiento > this.hoy) return 'La fecha de nacimiento no puede ser futura.';
    if (this.calcularEdad(e.fecha_nacimiento) < 18) return 'El entrenador debe tener al menos 18 años.';
    if (!e.fecha_ingreso_sis) return 'La fecha de ingreso es obligatoria.';
    if (e.fecha_ingreso_sis > this.hoy) return 'La fecha de ingreso no puede ser futura.';
    if (e.fecha_ingreso_sis < e.fecha_nacimiento) return 'La fecha de ingreso no puede ser anterior al nacimiento.';
    if (!e.tiempo_experiencia || e.tiempo_experiencia <= 0) return 'La experiencia debe ser mayor a 0 meses.';
    if (e.tiempo_experiencia > 600) return 'La experiencia no puede superar 600 meses (50 años).';
    if (this.esNuevo && !e.password?.trim()) return 'La contraseña es obligatoria.';
    if (this.esNuevo && e.password!.trim().length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
  }

  guardar() {
    if (!this.entrenadorSeleccionado) return;
    const msg = this.validar();
    if (msg) { this.errorValidacion = msg; return; }
    this.errorValidacion = '';

    const payload: any = {
      cedula: this.entrenadorSeleccionado.cedula,
      primer_nombre: this.entrenadorSeleccionado.primer_nombre,
      segundo_nombre: this.entrenadorSeleccionado.segundo_nombre,
      primer_apellido: this.entrenadorSeleccionado.primer_apellido,
      segundo_apellido: this.entrenadorSeleccionado.segundo_apellido,
      correo: this.entrenadorSeleccionado.correo,
      telefono: this.entrenadorSeleccionado.telefono,
      fecha_nacimiento: this.entrenadorSeleccionado.fecha_nacimiento,
      tipo_entrenamiento: this.entrenadorSeleccionado.tipo_entrenamiento,
      tiempo_experiencia: this.entrenadorSeleccionado.tiempo_experiencia,
      nivel_exigencia: this.entrenadorSeleccionado.nivel_exigencia,
      fecha_ingreso_sis: this.entrenadorSeleccionado.fecha_ingreso_sis,
      deportes_ids: (this.entrenadorSeleccionado.deportes || []).map(d => d.id_deporte)
    };
    if (this.esNuevo) payload.password = this.entrenadorSeleccionado.password;

    const obs = this.esNuevo
      ? this.entrenadoresApi.crear(payload)
      : this.entrenadoresApi.actualizar(this.entrenadorSeleccionado.cedula, payload);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarEntrenadores(); },
      error: (err) => {
        this.errorValidacion = err?.error?.error || 'Error al guardar. Verifica que los datos sean correctos.';
      }
    });
  }

  eliminar(cedula: string) {
    if (!confirm('¿Desea eliminar este entrenador?')) return;
    this.entrenadoresApi.eliminar(cedula).subscribe({
      next: () => { this.cerrarModal(); this.cargarEntrenadores(); },
      error: () => { this.errorValidacion = 'Error al eliminar el entrenador.'; }
    });
  }

  getNombreCompleto(e: EntrenadorDto): string {
    return `${e.primer_nombre}${e.segundo_nombre ? ' ' + e.segundo_nombre : ''} ${e.primer_apellido} ${e.segundo_apellido}`;
  }

  getExperienciaTexto(meses: number): string {
    if (meses < 12) return `${meses} meses`;
    const anios = Math.floor(meses / 12);
    const resto = meses % 12;
    return resto > 0 ? `${anios} año${anios > 1 ? 's' : ''} y ${resto} mes${resto > 1 ? 'es' : ''}` : `${anios} año${anios > 1 ? 's' : ''}`;
  }
}
