import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { SessionService } from '../../../../core/services/session.service';
import { MaquinasApiService } from '../../../../core/services/api/maquinas-api.service';
import { MantenimientoApiService } from '../../../../core/services/api/mantenimiento-api.service';

@Component({
  selector: 'app-operador-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operador-home-page.component.html',
  styleUrl: './operador-home-page.component.css'
})
export class OperadorHomePageComponent implements OnInit {

  readonly session = inject(SessionService);

  totalMaquinas = 0;
  misMaquinas = 0;
  enReparacion = 0;
  disponibles = 0;
  cargando = true;

  constructor(
    private maquinasApi: MaquinasApiService,
    private mantenimientoApi: MantenimientoApiService
  ) {}

  ngOnInit(): void {
    const op = this.session.getPerfilOperador();
    const cedula = op?.cedula ?? '';

    forkJoin({
      maquinas: this.maquinasApi.listarTodas(),
      todosMant: this.mantenimientoApi.listarTodos(),
      misMant: cedula ? this.mantenimientoApi.listarPorOperador(cedula) : of([])
    }).subscribe({
      next: ({ maquinas, todosMant, misMant }) => {
        const conOperador = new Set((todosMant as any[]).map(m => m.codigo_serie_maquina));
        this.totalMaquinas = maquinas.length;
        this.misMaquinas = (misMant as any[]).length;
        this.enReparacion = maquinas.filter(
          (m: any) => m.estado === 'en_reparacion' || m.estado === 'fuera_de_servicio'
        ).length;
        this.disponibles = maquinas.filter((m: any) => !conOperador.has(m.codigo_serie)).length;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }
}
