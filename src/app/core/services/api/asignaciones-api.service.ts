import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AsignacionesApiService {

  private readonly base = `${environment.apiUrl}/asignaciones`;

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  listarPorEntrenador(cedula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/entrenador/${cedula}`);
  }

  listarPorMiembro(cedula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/miembro/${cedula}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post<any>(this.base, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
