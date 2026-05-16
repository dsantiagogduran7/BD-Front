import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SessionService } from '../../../../core/services/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  correo   = '';
  password = '';
  rol      = 'miembro';

  errorMensaje    = '';
  cargando        = false;
  mostrarPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService
  ) {}

  iniciarSesion(): void {
    this.errorMensaje = '';
    if (!this.correo.trim() || !this.password.trim()) {
      this.errorMensaje = 'Por favor completa todos los campos.';
      return;
    }
    this.cargando = true;
    this.authService.login({ correo: this.correo.trim(), password: this.password })
      .subscribe({
        next: (respuesta) => {
          this.cargando = false;
          if (respuesta.rol !== this.rol) {
            this.errorMensaje = `Rol incorrecto. Tus credenciales corresponden al rol "${respuesta.rol}".`;
            return;
          }
          this.sessionService.iniciarSesion(respuesta.perfil_completo, respuesta.token);
          switch (respuesta.rol) {
            case 'administrador': this.router.navigate(['/admin/home']);           break;
            case 'entrenador':    this.router.navigate(['/trainer/mis-alumnos']); break;
            case 'miembro':       this.router.navigate(['/member/clases']);        break;
            case 'operador':      this.router.navigate(['/operator/home']);        break;
          }
        },
        error: () => {
          this.cargando = false;
          this.errorMensaje = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        }
      });
  }
}
