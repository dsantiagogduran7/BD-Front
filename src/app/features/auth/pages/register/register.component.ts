import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MiembrosApiService } from '../../../../core/services/api/miembros-api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  form = {
    cedula: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    correo: '',
    telefono: '',
    fecha_nacimiento: '',
    password: '',
    confirmar_password: '',
    altura: null as number | null,
    peso_actual: null as number | null,
    nivel_experiencia: 'novato'
  };

  cargando = false;
  error    = '';

  constructor(private miembrosApi: MiembrosApiService, private router: Router) {}

  get maxFechaNacimiento(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 16);
    return d.toISOString().split('T')[0];
  }

  private validar(): string {
    const f = this.form;
    if (!f.cedula.trim()) return 'La cédula es obligatoria.';
    if (f.cedula.trim().length > 15) return 'La cédula no puede tener más de 15 caracteres.';
    if (!f.primer_nombre.trim()) return 'El primer nombre es obligatorio.';
    if (!f.primer_apellido.trim()) return 'El primer apellido es obligatorio.';
    if (!f.segundo_apellido.trim()) return 'El segundo apellido es obligatorio.';
    if (!f.correo.trim()) return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) return 'El correo no tiene un formato válido.';
    if (!f.telefono.trim()) return 'El teléfono es obligatorio.';
    if (!f.fecha_nacimiento) return 'La fecha de nacimiento es obligatoria.';
    if (f.fecha_nacimiento > new Date().toISOString().split('T')[0]) return 'La fecha de nacimiento no puede ser futura.';
    if (!f.password.trim()) return 'La contraseña es obligatoria.';
    if (f.password.trim().length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (f.password !== f.confirmar_password) return 'Las contraseñas no coinciden.';
    if (!f.altura || f.altura < 50 || f.altura > 250) return 'La altura debe estar entre 50 y 250 cm.';
    if (!f.peso_actual || f.peso_actual < 20 || f.peso_actual > 300) return 'El peso debe estar entre 20 y 300 kg.';
    return '';
  }

  registrar(): void {
    this.error = '';
    const msg = this.validar();
    if (msg) { this.error = msg; return; }

    this.cargando = true;
    const payload = {
      cedula:            this.form.cedula.trim(),
      primer_nombre:     this.form.primer_nombre.trim(),
      segundo_nombre:    this.form.segundo_nombre.trim() || undefined,
      primer_apellido:   this.form.primer_apellido.trim(),
      segundo_apellido:  this.form.segundo_apellido.trim(),
      correo:            this.form.correo.trim(),
      telefono:          this.form.telefono.trim(),
      fecha_nacimiento:  this.form.fecha_nacimiento,
      password:          this.form.password,
      altura:            this.form.altura,
      peso_actual:       this.form.peso_actual,
      nivel_experiencia: this.form.nivel_experiencia
    };

    this.miembrosApi.crear(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.error || 'Error al registrarse. Verifica que los datos sean correctos.';
      }
    });
  }

  irLogin(): void {
    this.router.navigate(['/login']);
  }
}
