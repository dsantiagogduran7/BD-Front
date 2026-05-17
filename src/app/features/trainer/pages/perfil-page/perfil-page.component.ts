import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../../core/services/session.service';
import { EntrenadorDto } from '../../../../models/dto/entrenador.dto';

@Component({
  selector: 'app-trainer-perfil-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.css'
})
export class TrainerPerfilPageComponent {
  readonly session = inject(SessionService);

  get trainer(): EntrenadorDto | null {
    return this.session.getPerfilEntrenador();
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

  labelTipoEntrenamiento(t: string): string {
    const map: Record<string, string> = {
      fuerza: 'Fuerza', aerobico: 'Aeróbico',
      flexibilidad: 'Flexibilidad', equilibrio: 'Equilibrio'
    };
    return map[t] ?? t;
  }

  labelNivelExigencia(n: string): string {
    const map: Record<string, string> = {
      bajo: 'Bajo', moderado: 'Moderado', medio: 'Medio', alto: 'Alto', extremo: 'Extremo'
    };
    return map[n] ?? n;
  }
}
