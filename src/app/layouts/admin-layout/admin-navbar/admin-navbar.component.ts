import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
  readonly session = inject(SessionService);
  constructor(private router: Router) {}
  cerrarSesion(): void {
    this.session.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
