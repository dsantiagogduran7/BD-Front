import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HorariosApiService {

  private readonly base = `${environment.apiUrl}/horarios`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  listarPorDia(dia: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/dia/${dia}`);
  }
}
