import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DeporteDto } from '../../../models/dto/deporte.dto';

@Injectable({ providedIn: 'root' })
export class DeportesApiService {

  private readonly base = `${environment.apiUrl}/deportes`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<DeporteDto[]> {
    return this.http.get<DeporteDto[]>(this.base);
  }

  buscarPorId(id: number): Observable<DeporteDto> {
    return this.http.get<DeporteDto>(`${this.base}/${id}`);
  }

  crear(data: { nombre: string; descripcion: string }): Observable<DeporteDto> {
    return this.http.post<DeporteDto>(this.base, data);
  }

  actualizar(id: number, data: { nombre: string; descripcion: string }): Observable<DeporteDto> {
    return this.http.put<DeporteDto>(`${this.base}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
