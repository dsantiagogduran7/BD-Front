import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { MiembrosApiService } from '../../../../core/services/api/miembros-api.service';
import { EntrenadoresApiService } from '../../../../core/services/api/entrenadores-api.service';
import { MaquinasApiService } from '../../../../core/services/api/maquinas-api.service';
import { PagosApiService } from '../../../../core/services/api/pagos-api.service';
import { ClasesApiService } from '../../../../core/services/api/clases-api.service';
import { OperadoresApiService } from '../../../../core/services/api/operadores-api.service';

@Component({
  selector: 'app-reportes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-page.component.html',
  styleUrl: './reportes-page.component.css'
})
export class ReportesPageComponent implements OnInit {

  cargando = true;
  error = '';

  // Datos crudos
  todosMiembros: any[] = [];
  todosEntrenadores: any[] = [];
  todasMaquinas: any[] = [];
  todasClases: any[] = [];
  todosOperadores: any[] = [];
  todosPagos: any[] = [];

  // Filtros por sección
  busquedaMiembros = '';
  busquedaEntrenadores = '';
  busquedaMaquinas = ''; filtroEstadoMaquinas = '';
  busquedaClases = ''; filtroEstadoClases = '';
  busquedaOperadores = ''; filtroTipoOperadores = '';
  busquedaPagos = ''; filtroMetodoPagos = '';

  constructor(
    private miembrosApi: MiembrosApiService,
    private entrenadoresApi: EntrenadoresApiService,
    private maquinasApi: MaquinasApiService,
    private clasesApi: ClasesApiService,
    private operadoresApi: OperadoresApiService,
    private pagosApi: PagosApiService
  ) {}

  ngOnInit(): void {
    forkJoin({
      miembros: this.miembrosApi.listarTodos(),
      entrenadores: this.entrenadoresApi.listarTodos(),
      maquinas: this.maquinasApi.listarTodas(),
      clases: this.clasesApi.listarTodas(),
      operadores: this.operadoresApi.listarTodos(),
      pagos: this.pagosApi.listarTodos()
    }).subscribe({
      next: ({ miembros, entrenadores, maquinas, clases, operadores, pagos }) => {
        this.todosMiembros = miembros as any[];
        this.todosEntrenadores = entrenadores as any[];
        this.todasMaquinas = maquinas as any[];
        this.todasClases = clases as any[];
        this.todosOperadores = operadores as any[];
        this.todosPagos = pagos as any[];
        this.cargando = false;
      },
      error: () => { this.error = 'Error al cargar los datos. Verifica la conexión.'; this.cargando = false; }
    });
  }

  // ---- Getters filtrados ----

  get miembrosFiltrados(): any[] {
    const q = this.busquedaMiembros.toLowerCase();
    return this.todosMiembros.filter(m =>
      !q || `${m.primer_nombre} ${m.primer_apellido} ${m.cedula} ${m.correo}`.toLowerCase().includes(q)
    );
  }

  get entrenadoresFiltrados(): any[] {
    const q = this.busquedaEntrenadores.toLowerCase();
    return this.todosEntrenadores.filter(e =>
      !q || `${e.primer_nombre} ${e.primer_apellido} ${e.cedula}`.toLowerCase().includes(q)
    );
  }

  get maquinasFiltradas(): any[] {
    const q = this.busquedaMaquinas.toLowerCase();
    return this.todasMaquinas.filter(m => {
      const txt = !q || `${m.nombre_maquina} ${m.marca} ${m.modelo}`.toLowerCase().includes(q);
      const est = !this.filtroEstadoMaquinas || m.estado === this.filtroEstadoMaquinas;
      return txt && est;
    });
  }

  get clasesFiltradas(): any[] {
    const q = this.busquedaClases.toLowerCase();
    return this.todasClases.filter(c => {
      const txt = !q || `${c.deporte?.nombre ?? ''} ${c.nombre_entrenador}`.toLowerCase().includes(q);
      const est = !this.filtroEstadoClases || c.estado === this.filtroEstadoClases;
      return txt && est;
    });
  }

  get operadoresFiltrados(): any[] {
    const q = this.busquedaOperadores.toLowerCase();
    return this.todosOperadores.filter(o => {
      const txt = !q || `${o.primer_nombre} ${o.primer_apellido} ${o.cedula}`.toLowerCase().includes(q);
      const tipo = !this.filtroTipoOperadores || o.tipo_operador === this.filtroTipoOperadores;
      return txt && tipo;
    });
  }

  get pagosFiltrados(): any[] {
    const q = this.busquedaPagos.toLowerCase();
    return this.todosPagos.filter(p => {
      const txt = !q || `${p.nombre_miembro ?? ''} ${p.miembro_cedula ?? ''}`.toLowerCase().includes(q);
      const met = !this.filtroMetodoPagos || p.metodo_pago === this.filtroMetodoPagos;
      return txt && met;
    });
  }

  // ---- Helpers ----

  formatearPrecio(v: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v ?? 0);
  }

  labelDuracion(d: string): string {
    return ({ mensual: 'Mensual', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual' } as any)[d] ?? d;
  }

  labelMetodo(m: string): string {
    return ({ efectivo: 'Efectivo', tarjeta_credito: 'T. Crédito', tarjeta_debito: 'T. Débito', transferencia: 'Transferencia' } as any)[m] ?? m;
  }

  // ---- PDF export ----

  private crearDoc(titulo: string): jsPDF {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text(`Reporte: ${titulo}`, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 25);
    return doc;
  }

  exportarMiembros(): void {
    const doc = this.crearDoc('Miembros');
    autoTable(doc, {
      startY: 32,
      head: [['Cédula', 'Nombre', 'Correo', 'Teléfono', 'Experiencia', 'Membresía']],
      body: this.miembrosFiltrados.map(m => [
        m.cedula, `${m.primer_nombre} ${m.primer_apellido}`,
        m.correo, m.telefono, m.nivel_experiencia, m.membresia_estado ?? '—'
      ])
    });
    doc.save('reporte-miembros.pdf');
  }

  exportarEntrenadores(): void {
    const doc = this.crearDoc('Entrenadores');
    autoTable(doc, {
      startY: 32,
      head: [['Cédula', 'Nombre', 'Correo', 'Tipo', 'Exigencia', 'Experiencia (años)']],
      body: this.entrenadoresFiltrados.map(e => [
        e.cedula, `${e.primer_nombre} ${e.primer_apellido}`,
        e.correo, e.tipo_entrenamiento, e.nivel_exigencia, e.tiempo_experiencia ?? '—'
      ])
    });
    doc.save('reporte-entrenadores.pdf');
  }

  exportarMaquinas(): void {
    const doc = this.crearDoc('Máquinas');
    autoTable(doc, {
      startY: 32,
      head: [['Serie', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'Capacidad (kg)', 'Estado']],
      body: this.maquinasFiltradas.map(m => [
        m.codigo_serie, m.nombre_maquina, m.tipo_maquina,
        m.marca, m.modelo, m.capacidad, m.estado
      ])
    });
    doc.save('reporte-maquinas.pdf');
  }

  exportarClases(): void {
    const doc = this.crearDoc('Clases');
    autoTable(doc, {
      startY: 32,
      head: [['ID', 'Deporte', 'Entrenador', 'Fecha', 'Horario', 'Cupos', 'Estado']],
      body: this.clasesFiltradas.map(c => [
        c.id_clase, c.deporte?.nombre ?? '—', c.nombre_entrenador, c.fecha,
        c.horario ? `${c.horario.dia_semana} ${c.horario.hora_inicio}-${c.horario.hora_fin}` : '—',
        c.cupos, c.estado
      ])
    });
    doc.save('reporte-clases.pdf');
  }

  exportarOperadores(): void {
    const doc = this.crearDoc('Operadores');
    autoTable(doc, {
      startY: 32,
      head: [['Cédula', 'Nombre', 'Correo', 'Tipo', 'Especialidad', 'Nivel Técnico']],
      body: this.operadoresFiltrados.map(o => [
        o.cedula, `${o.primer_nombre} ${o.primer_apellido}`,
        o.correo, o.tipo_operador, o.especialidad, o.nivel_tecnico
      ])
    });
    doc.save('reporte-operadores.pdf');
  }

  exportarPagos(): void {
    const doc = this.crearDoc('Pagos');
    autoTable(doc, {
      startY: 32,
      head: [['ID', 'Miembro', 'Cédula', 'Plan', 'Método', 'Valor', 'Fecha Pago', 'Estado Membresía']],
      body: this.pagosFiltrados.map(p => [
        p.id_pago, p.nombre_miembro, p.miembro_cedula,
        this.labelDuracion(p.plan_duracion), this.labelMetodo(p.metodo_pago),
        this.formatearPrecio(p.valor_pagado), p.fecha_pago, p.estado_membresia
      ])
    });
    doc.save('reporte-pagos.pdf');
  }
}
