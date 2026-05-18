import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MembresiasApiService {

  private readonly base = `${environment.apiUrl}/membresias`;

  constructor(private http: HttpClient) {}

  buscarVigente(cedula: string): Observable<any> {
    return this.http.get<any>(`${this.base}/vigente/${cedula}`);
  }

  crear(data: any): Observable<any> {
    return this.http.post<any>(this.base, data);
  }

  actualizar(cedula: string, idPlan: number, fechaInicio: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${cedula}/${idPlan}/${fechaInicio}`, data);
  }
}
