import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="paginacion" *ngIf="totalPaginas > 1">
      <button class="pag-btn" [disabled]="paginaActual === 1" (click)="ir(paginaActual - 1)">&#8249;</button>
      <ng-container *ngFor="let p of paginas">
        <span *ngIf="p === -1" class="pag-ellipsis">…</span>
        <button *ngIf="p !== -1" class="pag-btn" [class.activo]="p === paginaActual" (click)="ir(p)">{{ p }}</button>
      </ng-container>
      <button class="pag-btn" [disabled]="paginaActual === totalPaginas" (click)="ir(paginaActual + 1)">&#8250;</button>
    </div>
  `,
  styles: [`
    .paginacion { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 16px 0 8px; }
    .pag-btn { min-width: 34px; height: 34px; padding: 0 8px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; color: #444; transition: all 0.15s; }
    .pag-btn:hover:not(:disabled) { background: #f0f0f0; border-color: #bbb; }
    .pag-btn.activo { background: #1a73e8; color: #fff; border-color: #1a73e8; font-weight: 600; }
    .pag-btn:disabled { opacity: 0.4; cursor: default; }
    .pag-ellipsis { padding: 0 4px; color: #999; font-size: 14px; line-height: 34px; }
  `]
})
export class PaginacionComponent implements OnChanges {
  @Input() totalPaginas = 1;
  @Input() paginaActual = 1;
  @Output() cambiarPagina = new EventEmitter<number>();

  paginas: number[] = [];

  ngOnChanges(): void {
    this.paginas = this.calcularPaginas();
  }

  ir(n: number): void {
    if (n >= 1 && n <= this.totalPaginas) this.cambiarPagina.emit(n);
  }

  private calcularPaginas(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (actual > 3) pages.push(-1);
    const inicio = Math.max(2, actual - 1);
    const fin = Math.min(total - 1, actual + 1);
    for (let i = inicio; i <= fin; i++) pages.push(i);
    if (actual < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }
}
