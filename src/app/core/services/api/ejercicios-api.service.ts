import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EjerciciosApiService {

  private readonly base = `${environment.apiUrl}/ejercicios`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  listarPorAsignacion(idAsignacion: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/asignacion/${idAsignacion}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post<any>(this.base, data);
  }

  actualizar(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
