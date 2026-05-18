import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { SessionService } from '../../../../core/services/session.service';
import { PagosApiService } from '../../../../core/services/api/pagos-api.service';
import { PagoDto } from '../../../../models/dto/pago.dto';

@Component({
  selector: 'app-pagos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos-page.component.html',
  styleUrl: './pagos-page.component.css'
})
export class PagosPageComponent implements OnInit {

  private session = inject(SessionService);
  private cedula = '';

  cargando = true;
  error = '';
  pagos: PagoDto[] = [];

  filtroMetodo = '';
  filtroPlan   = '';

  constructor(private pagosApi: PagosApiService) {}

  ngOnInit(): void {
    const miembro = this.session.getPerfilMiembro();
    if (miembro) this.cedula = miembro.cedula;

    this.pagosApi.historialPorMiembro(this.cedula).subscribe({
      next: (data) => {
        this.pagos   = data as PagoDto[];
        this.cargando = false;
      },
      error: () => {
        this.error    = 'Error al cargar los pagos. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  get pagosFiltrados(): PagoDto[] {
    return this.pagos.filter(p => {
      const okMetodo = !this.filtroMetodo || p.metodo_pago === this.filtroMetodo;
      const okPlan   = !this.filtroPlan   || p.plan_duracion === this.filtroPlan;
      return okMetodo && okPlan;
    });
  }

  descargarRecibo(p: PagoDto): void {
    const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
    const W    = 210;
    const verde = [27, 94, 32]  as [number, number, number];
    const verdeClaro = [232, 245, 233] as [number, number, number];

    // ── Cabecera ──────────────────────────────────────────
    doc.setFillColor(...verde);
    doc.rect(0, 0, W, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('UB-Deporte', 14, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Universidad El Bosque — GymBosque', 14, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Recibo #${String(p.id_pago).padStart(6, '0')}`, W - 14, 13, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('COMPROBANTE DE PAGO', W - 14, 20, { align: 'right' });

    // ── Banda verde claro (título) ─────────────────────────
    doc.setFillColor(...verdeClaro);
    doc.rect(0, 30, W, 10, 'F');
    doc.setTextColor(...verde);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('COMPROBANTE DE PAGO — UB-DEPORTE', W / 2, 37, { align: 'center' });

    // ── Función helper para secciones ─────────────────────
    let y = 50;
    const seccion = (titulo: string) => {
      doc.setTextColor(...verde);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(titulo.toUpperCase(), 14, y);
      doc.setDrawColor(...verde);
      doc.setLineWidth(0.3);
      doc.line(14, y + 1.5, W - 14, y + 1.5);
      y += 8;
    };
    const campo = (label: string, valor: string, x: number, colW: number) => {
      doc.setTextColor(160, 160, 160);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(label.toUpperCase(), x, y);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(valor || '—', x, y + 5);
    };

    // ── Datos del miembro ─────────────────────────────────
    seccion('Datos del miembro');
    campo('Nombre',   p.nombre_miembro  ?? '—', 14,  90);
    campo('Cédula',   p.miembro_cedula  ?? '—', 110, 86);
    y += 12;
    campo('Correo',   p.correo_miembro  ?? '—', 14,  90);
    campo('Teléfono', p.telefono_miembro ?? '—', 110, 86);
    y += 18;

    // ── Detalle del plan ──────────────────────────────────
    seccion('Detalle del plan');
    campo('Plan',              this.labelDuracion(p.plan_duracion), 14,  90);
    campo('Estado membresía',  p.estado_membresia ?? '—',           110, 86);
    y += 12;
    campo('Inicio membresía',  this.formatFecha(p.fecha_inicio_membresia), 14,  90);
    campo('Vencimiento',       this.formatFecha(p.fecha_fin_membresia),    110, 86);
    y += 18;

    // ── Detalle del pago ──────────────────────────────────
    seccion('Detalle del pago');
    campo('Fecha de pago',  this.formatFecha(p.fecha_pago),    14,  90);
    campo('Método de pago', this.labelMetodo(p.metodo_pago),   110, 86);
    y += 18;

    // ── Monto total ───────────────────────────────────────
    doc.setFillColor(...verdeClaro);
    doc.roundedRect(14, y, W - 28, 20, 3, 3, 'F');
    doc.setTextColor(...verde);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('TOTAL PAGADO', 22, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(this.formatPrecio(p.valor_pagado), W - 22, y + 13, { align: 'right' });
    y += 30;

    // ── Pie de página ─────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, y, W - 14, y);
    y += 6;
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const fechaHoy = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Documento generado el ${fechaHoy}`, W / 2, y, { align: 'center' });
    doc.text('UB-Deporte · Universidad El Bosque · Comprobante oficial de pago', W / 2, y + 5, { align: 'center' });

    doc.save(`recibo-${String(p.id_pago).padStart(6, '0')}.pdf`);
  }

  formatFecha(f: string): string {
    if (!f) return '—';
    try {
      return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch { return f; }
  }

  formatPrecio(v: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(v);
  }

  labelMetodo(m: string): string {
    const map: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta_credito: 'Tarjeta de crédito',
      tarjeta_debito:  'Tarjeta de débito',
      transferencia:   'Transferencia'
    };
    return map[m] ?? m;
  }

  labelDuracion(d: string): string {
    const map: Record<string, string> = {
      mensual: '1 Mes', trimestral: '3 Meses', semestral: '6 Meses', anual: '12 Meses'
    };
    return map[d] ?? d;
  }

}
