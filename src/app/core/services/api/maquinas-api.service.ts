import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MaquinasApiService {

  private readonly base = `${environment.apiUrl}/maquinas`;

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  buscarPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
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

  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.base}/${id}/estado`, null, { params: { valor: estado } });
  }
}
