import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../../core/services/session.service';
import { MiembrosApiService } from '../../../../core/services/api/miembros-api.service';
import { EntrenadoresApiService } from '../../../../core/services/api/entrenadores-api.service';
import { ClasesApiService } from '../../../../core/services/api/clases-api.service';
import { MaquinasApiService } from '../../../../core/services/api/maquinas-api.service';
import { forkJoin } from 'rxjs';

interface Alerta {
  tipo: 'membresia' | 'maquina' | 'clase';
  descripcion: string;
  fecha: string;
  estado: 'activa' | 'pendiente' | 'critica';
}

interface Actividad {
  usuario: string;
  rol: string;
  accion: string;
  fecha: string;
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit {

  readonly session = inject(SessionService);

  totalMiembros         = 0;
  totalEntrenadores     = 0;
  clasesProgramadas     = 0;
  maquinasFueraServicio = 0;

  cargando = true;

  alertas: Alerta[] = [];
  actividades: Actividad[] = [];

  constructor(
    private miembrosApi: MiembrosApiService,
    private entrenadoresApi: EntrenadoresApiService,
    private clasesApi: ClasesApiService,
    private maquinasApi: MaquinasApiService
  ) {}

  ngOnInit(): void {
    forkJoin({
      miembros: this.miembrosApi.listarTodos(),
      entrenadores: this.entrenadoresApi.listarTodos(),
      clases: this.clasesApi.listarTodas(),
      maquinas: this.maquinasApi.listarTodas()
    }).subscribe({
      next: ({ miembros, entrenadores, clases, maquinas }) => {
        this.totalMiembros     = miembros.length;
        this.totalEntrenadores = entrenadores.length;
        this.clasesProgramadas = clases.filter((c: any) => c.estado === 'programada').length;
        this.maquinasFueraServicio = maquinas.filter(
          (m: any) => m.estado === 'fuera_de_servicio' || m.estado === 'en_mantenimiento'
        ).length;

        const hoy = new Date().toISOString().split('T')[0];
        if (this.maquinasFueraServicio > 0) {
          this.alertas.push({
            tipo: 'maquina',
            descripcion: `${this.maquinasFueraServicio} máquina(s) fuera de servicio o en mantenimiento`,
            fecha: hoy,
            estado: 'critica'
          });
        }
        const clasesProgCount = this.clasesProgramadas;
        if (clasesProgCount > 0) {
          this.alertas.push({
            tipo: 'clase',
            descripcion: `${clasesProgCount} clase(s) programadas actualmente`,
            fecha: hoy,
            estado: 'activa'
          });
        }

        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}
