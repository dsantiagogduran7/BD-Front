import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PlanDto } from '../../../models/dto/plan.dto';

@Injectable({ providedIn: 'root' })
export class PlanesApiService {

  private readonly base = `${environment.apiUrl}/planes`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<PlanDto[]> {
    return this.http.get<PlanDto[]>(this.base);
  }
}
