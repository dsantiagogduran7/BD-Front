import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-trainer-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-navbar.component.html',
  styleUrl: './trainer-navbar.component.css'
})
export class TrainerNavbarComponent {
  readonly session = inject(SessionService);
  constructor(private router: Router) {}
  cerrarSesion(): void {
    this.session.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
