import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../../core/services/session.service';
import { OperadorDto } from '../../../../models/dto/operador.dto';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.css'
})
export class PerfilPageComponent {
  readonly session = inject(SessionService);

  get op(): OperadorDto | null {
    return this.session.getPerfilOperador();
  }

  getEdad(fecha: string): number {
    if (!fecha) return 0;
    const hoy = new Date();
    const nac = new Date(fecha);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  labelNivel(n: string): string {
    const map: Record<string, string> = {
      basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado', experto: 'Experto'
    };
    return map[n] || n;
  }

  labelEspecialidad(e: string): string {
    const map: Record<string, string> = {
      mecanico: 'Mecánico', electrico: 'Eléctrico',
      inspeccion: 'Inspección', gestion_instalaciones: 'Gestión de Instalaciones'
    };
    return map[e] || e;
  }

  labelTipoOperador(t: string): string {
    const map: Record<string, string> = {
      preventivo: 'Preventivo', correctivo: 'Correctivo', locativo: 'Locativo'
    };
    return map[t] || t;
  }
}
