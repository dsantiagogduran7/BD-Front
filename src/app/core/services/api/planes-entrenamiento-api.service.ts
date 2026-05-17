import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlanesEntrenamientoApiService {

  private readonly base = `${environment.apiUrl}/planes-entrenamiento`;

  constructor(private http: HttpClient) {}

  listarPorEntrenador(cedula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/entrenador/${cedula}`);
  }

  listarPorMiembro(cedula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/miembro/${cedula}`);
  }

  buscarPorAsignacion(idAsignacion: number): Observable<any> {
    return this.http.get<any>(`${this.base}/asignacion/${idAsignacion}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post<any>(this.base, data);
  }

  actualizar(idAsignacion: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${idAsignacion}`, data);
  }

  eliminar(idAsignacion: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${idAsignacion}`);
  }
}
