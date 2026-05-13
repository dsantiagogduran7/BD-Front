import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { MiembrosApiService } from '../../../../core/services/api/miembros-api.service';
import { EntrenadoresApiService } from '../../../../core/services/api/entrenadores-api.service';
import { MaquinasApiService } from '../../../../core/services/api/maquinas-api.service';
import { PagosApiService } from '../../../../core/services/api/pagos-api.service';

type TipoReporte = 'pagos' | 'miembros' | 'entrenadores' | 'maquinas';

interface ReporteItem {
  id: number;
  tipo: TipoReporte;
  nombre: string;
  detalle: string;
  estado: string;
  fecha: string;
  valor: number;
}

@Component({
  selector: 'app-reportes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-page.component.html',
  styleUrl: './reportes-page.component.css'
})
export class ReportesPageComponent implements OnInit {

  tipoReporte: TipoReporte = 'pagos';
  busqueda: string = '';
  filtroEstado: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  cargando: boolean = false;

  datos: ReporteItem[] = [];

  constructor(
    private miembrosApi: MiembrosApiService,
    private entrenadoresApi: EntrenadoresApiService,
    private maquinasApi: MaquinasApiService,
    private pagosApi: PagosApiService
  ) {}

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando = true;
    this.datos = [];
    this.paginaActual = 1;

    const cargar: Record<TipoReporte, () => void> = {
      pagos: () => this.pagosApi.listarTodos().subscribe({
        next: (data: any[]) => {
          this.datos = data.map((p, i) => ({
            id: p.id_pago ?? i,
            tipo: 'pagos',
            nombre: p.nombre_miembro ?? p.miembro_cedula ?? '',
            detalle: p.plan_duracion ?? '',
            estado: p.estado_membresia ?? '',
            fecha: p.fecha_pago ?? '',
            valor: p.valor_pagado ?? 0
          }));
          this.cargando = false;
        },
        error: () => { this.cargando = false; }
      }),
      miembros: () => this.miembrosApi.listarTodos().subscribe({
        next: (data: any[]) => {
          this.datos = data.map((m, i) => ({
            id: i,
            tipo: 'miembros',
            nombre: `${m.primer_nombre} ${m.primer_apellido}`,
            detalle: m.nivel_experiencia ?? '',
            estado: m.membresia_estado ?? '',
            fecha: m.fecha_nacimiento ?? '',
            valor: 0
          }));
          this.cargando = false;
        },
        error: () => { this.cargando = false; }
      }),
      entrenadores: () => this.entrenadoresApi.listarTodos().subscribe({
        next: (data: any[]) => {
          this.datos = data.map((e, i) => ({
            id: i,
            tipo: 'entrenadores',
            nombre: `${e.primer_nombre} ${e.primer_apellido}`,
            detalle: e.tipo_entrenamiento ?? '',
            estado: e.nivel_exigencia ?? '',
            fecha: e.fecha_ingreso_sis ?? '',
            valor: 0
          }));
          this.cargando = false;
        },
        error: () => { this.cargando = false; }
      }),
      maquinas: () => this.maquinasApi.listarTodas().subscribe({
        next: (data: any[]) => {
          this.datos = data.map((m, i) => ({
            id: m.codigo_serie ?? i,
            tipo: 'maquinas',
            nombre: m.nombre_maquina ?? '',
            detalle: m.tipo_maquina ?? '',
            estado: m.estado ?? '',
            fecha: '',
            valor: 0
          }));
          this.cargando = false;
        },
        error: () => { this.cargando = false; }
      })
    };

    cargar[this.tipoReporte]();
  }

  get datosFiltrados(): ReporteItem[] {
    return this.datos.filter(d => {
      const coincideBusqueda = !this.busqueda ||
        `${d.nombre} ${d.detalle} ${d.estado}`.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.filtroEstado || d.estado === this.filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }

  get datosPaginados(): ReporteItem[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.datosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.datosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  cambiarTipoReporte() {
    this.busqueda = '';
    this.filtroEstado = '';
    this.cargarReporte();
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Reporte de ${this.tipoReporte.toUpperCase()}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Nombre', 'Detalle', 'Estado', 'Fecha', 'Valor']],
      body: this.datosFiltrados.map(d => [
        d.id,
        d.nombre,
        d.detalle,
        d.estado,
        d.fecha,
        this.formatearPrecio(d.valor)
      ])
    });

    doc.save(`reporte-${this.tipoReporte}.pdf`);
  }
}
