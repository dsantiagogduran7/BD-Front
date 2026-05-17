import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../../core/services/session.service';
import { PersonaDto } from '../../../../models/dto/persona.dto';

@Component({
  selector: 'app-admin-perfil-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.css'
})
export class AdminPerfilPageComponent {
  readonly session = inject(SessionService);

  get admin(): PersonaDto | null {
    return this.session.perfil() as PersonaDto | null;
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
}
