import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-operator-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operator-navbar.component.html',
  styleUrl: './operator-navbar.component.css'
})
export class OperadorNavbarComponent {
  readonly session = inject(SessionService);
  constructor(private router: Router) {}
  cerrarSesion(): void {
    this.session.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
