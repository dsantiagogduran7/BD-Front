import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequestDto } from '../../models/auth/login-request.dto';
import { LoginResponseDto } from '../../models/auth/login-response.dto';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly loginUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(this.loginUrl, request);
  }
}
