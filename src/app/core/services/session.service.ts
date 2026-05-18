import { Injectable, signal, computed } from '@angular/core';
import { PersonaDto } from '../../models/dto/persona.dto';
import { MiembroDto } from '../../models/dto/miembro.dto';
import { EntrenadorDto } from '../../models/dto/entrenador.dto';
import { OperadorDto } from '../../models/dto/operador.dto';

export type PerfilSesion = PersonaDto | MiembroDto | EntrenadorDto | OperadorDto;

const SESSION_KEY = 'ub_sesion';
const TOKEN_KEY   = 'ub_token';

@Injectable({ providedIn: 'root' })
export class SessionService {

  // ── Signals (estado reactivo en memoria) ──────────────────
  private _perfil = signal<PerfilSesion | null>(this.cargarPerfilGuardado());
  private _token  = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));

  // ── Acceso público de solo lectura ────────────────────────
  readonly perfil          = this._perfil.asReadonly();
  readonly token           = this._token.asReadonly();
  readonly estaAutenticado = computed(() => this._perfil() !== null);
  readonly rol             = computed(() => this._perfil()?.rol ?? null);

  readonly nombreCompleto = computed(() => {
    const p = this._perfil();
    if (!p) return '';
    return [p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido]
      .filter(Boolean).join(' ');
  });

  readonly iniciales = computed(() => {
    const p = this._perfil();
    if (!p) return '';
    return (p.primer_nombre[0] + p.primer_apellido[0]).toUpperCase();
  });

  // ── Métodos públicos ──────────────────────────────────────

  /**
   * Guarda perfil y token en memoria (Signal) y en sessionStorage.
   * sessionStorage persiste mientras la pestaña esté abierta.
   * Al cerrar la pestaña/navegador se borra automáticamente.
   */
  iniciarSesion(perfil: PerfilSesion, token: string): void {
    this._perfil.set(perfil);
    this._token.set(token);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(perfil));
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Limpia memoria y sessionStorage.
   */
  cerrarSesion(): void {
    this._perfil.set(null);
    this._token.set(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }

  actualizarPerfil(cambios: object): void {
    const actual = this._perfil();
    if (!actual) return;
    const actualizado = { ...actual, ...cambios } as PerfilSesion;
    this._perfil.set(actualizado);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(actualizado));
  }

  // ── Helpers de tipo por rol ───────────────────────────────
  getPerfilMiembro():    MiembroDto    | null { const p = this._perfil(); return p?.rol === 'miembro'    ? p as MiembroDto    : null; }
  getPerfilEntrenador(): EntrenadorDto | null { const p = this._perfil(); return p?.rol === 'entrenador' ? p as EntrenadorDto : null; }
  getPerfilOperador():   OperadorDto   | null { const p = this._perfil(); return p?.rol === 'operador'   ? p as OperadorDto   : null; }

  // ── Privado ───────────────────────────────────────────────

  /**
   * Al iniciar el servicio intenta recuperar el perfil desde sessionStorage
   * (por si el usuario recargó la página sin cerrar la pestaña).
   */
  private cargarPerfilGuardado(): PerfilSesion | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as PerfilSesion) : null;
    } catch {
      return null;
    }
  }
}
