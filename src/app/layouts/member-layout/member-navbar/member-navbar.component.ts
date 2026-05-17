import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-member-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-navbar.component.html',
  styleUrl: './member-navbar.component.css'
})
export class MemberNavbarComponent {
  readonly session = inject(SessionService);
  constructor(private router: Router) {}
  cerrarSesion(): void {
    this.session.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
