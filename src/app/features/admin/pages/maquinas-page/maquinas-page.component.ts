import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaquinasApiService } from '../../../../core/services/api/maquinas-api.service';

interface Maquina {
  codigo_serie: number;
  nombre_maquina: string;
  modelo: string;
  marca: string;
  tipo_maquina: 'cardio' | 'fuerza' | 'funcional' | 'rehabilitacion' | 'pesas' | 'otra';
  estado: 'operativa' | 'en_mantenimiento' | 'fuera_de_servicio' | 'en_reparacion';
  capacidad: number;
}

@Component({
  selector: 'app-maquinas-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maquinas-page.component.html',
  styleUrl: './maquinas-page.component.css'
})
export class MaquinasPageComponent implements OnInit {

  busqueda: string = '';
  filtroEstado: string = '';
  filtroTipo: string = '';
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  maquinaSeleccionada: Maquina | null = null;
  cargando: boolean = false;
  error: string = '';

  maquinas: Maquina[] = [];

  constructor(private maquinasApi: MaquinasApiService) {}

  ngOnInit(): void {
    this.cargarMaquinas();
  }

  cargarMaquinas(): void {
    this.cargando = true;
    this.error = '';
    this.maquinasApi.listarTodas().subscribe({
      next: (data) => {
        this.maquinas = data as Maquina[];
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar las máquinas. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get maquinasFiltradas(): Maquina[] {
    return this.maquinas.filter(m => {
      const texto = `${m.nombre_maquina} ${m.marca} ${m.modelo}`.toLowerCase();
      const coincideBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.filtroEstado || m.estado === this.filtroEstado;
      const coincideTipo = !this.filtroTipo || m.tipo_maquina === this.filtroTipo;
      return coincideBusqueda && coincideEstado && coincideTipo;
    });
  }

  abrirDetalle(maquina: Maquina) {
    this.maquinaSeleccionada = { ...maquina };
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  nuevaMaquina() {
    this.maquinaSeleccionada = {
      codigo_serie: 0,
      nombre_maquina: '',
      modelo: '',
      marca: '',
      tipo_maquina: 'cardio',
      estado: 'operativa',
      capacidad: 0
    };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardar() {
    if (!this.maquinaSeleccionada) return;
    const esNueva = this.maquinaSeleccionada.codigo_serie === 0;
    const obs = esNueva
      ? this.maquinasApi.crear(this.maquinaSeleccionada)
      : this.maquinasApi.actualizar(this.maquinaSeleccionada.codigo_serie, this.maquinaSeleccionada);

    obs.subscribe({
      next: () => { this.cerrarModal(); this.cargarMaquinas(); },
      error: () => { alert('Error al guardar la máquina.'); }
    });
  }

  eliminarMaquina(codigo: number) {
    if (!confirm('¿Desea eliminar esta máquina?')) return;
    this.maquinasApi.eliminar(codigo).subscribe({
      next: () => { this.cerrarModal(); this.cargarMaquinas(); },
      error: () => { alert('Error al eliminar la máquina.'); }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.maquinaSeleccionada = null;
  }
}
