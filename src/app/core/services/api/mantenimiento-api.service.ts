import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MantenimientoApiService {

  private readonly base = `${environment.apiUrl}/mantenimiento`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  listarPorOperador(cedula: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/operador/${cedula}`);
  }

  listarPorMaquina(codigoSerie: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/maquina/${codigoSerie}`);
  }

  registrar(data: any): Observable<any> {
    return this.http.post<any>(this.base, data);
  }

  eliminar(cedula: string, codigoSerie: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${cedula}/${codigoSerie}`);
  }
}
