import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OperadoresApiService {

  private readonly base = `${environment.apiUrl}/operadores`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  buscarPorCedula(cedula: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${cedula}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post<any>(this.base, data);
  }

  actualizar(cedula: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${cedula}`, data);
  }

  eliminar(cedula: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${cedula}`);
  }
}
