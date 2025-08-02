import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  signin(
    login: string,
    password: string,
  ): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.api}/signin`,
      { login, password },
    );
  }

  signup(dto: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    productKey: string;
  }): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.api}/signup`,
      dto,
    );
  }

  logout(): Observable<void> {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
      // no hay refresh guardado
      this.purge();
      return of(void 0);
    }

    return this.http
      .post<void>(`${this.api}/logout`, { refreshToken: refresh })
      .pipe(
        tap(() => this.purge()), // limpia al éxito
        catchError((err) => {
          this.purge(); // limpia también si da error
          return throwError(() => err);
        }),
      );
  }

  private purge() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
