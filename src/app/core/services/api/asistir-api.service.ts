import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AsistirApiService {

  private readonly base = `${environment.apiUrl}/asistencias`;

  constructor(private http: HttpClient) {}

  consultarPorMiembro(cedula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/miembro/${cedula}`);
  }

  consultarPorClase(idClase: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/clase/${idClase}`);
  }

  inscribir(cedula: string, idClase: number): Observable<any> {
    return this.http.post<any>(this.base, { miembro_cedula: cedula, clase_id_clase: idClase });
  }

  desinscribir(cedula: string, idClase: number): Observable<void> {
    return this.http.delete<void>(this.base, {
      body: { miembro_cedula: cedula, clase_id_clase: idClase }
    });
  }
}
