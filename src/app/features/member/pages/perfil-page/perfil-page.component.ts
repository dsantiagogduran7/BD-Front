import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../../core/services/session.service';
import { MiembroDto } from '../../../../models/dto/miembro.dto';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.css'
})
export class PerfilPageComponent {
  readonly session = inject(SessionService);

  get miembro(): MiembroDto | null {
    return this.session.getPerfilMiembro();
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
