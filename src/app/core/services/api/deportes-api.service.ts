import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeportesApiService {

  private readonly base = `${environment.apiUrl}/deportes`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<{ id_deporte: number; nombre: string; descripcion: string }[]> {
    return this.http.get<{ id_deporte: number; nombre: string; descripcion: string }[]>(this.base);
  }
}