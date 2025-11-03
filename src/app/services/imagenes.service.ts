import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImagenesService {
  private base = environment.API_BASE_URL ?? '';

  constructor(private http: HttpClient) {}

  // Devuelve solo URLs absolutas listas para <img src="...">
  getUrlsPorHabitacion(habitacionId: number): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.base}/api/imagenes/ver/${habitacionId}`)
      .pipe(
        map(arr =>
          arr.map(s => {
            const url = s.split('::')[1] ?? s;          // "/api/imagenes/ver/una/{id}"
            return url.startsWith('http') ? url : `${this.base}${url}`;
          })
        )
      );
  }
}
