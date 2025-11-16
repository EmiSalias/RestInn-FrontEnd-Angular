import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  private base = environment.API_BASE_URL ?? '';

  constructor(private http: HttpClient) {}

  getUrlsPorHabitacion(habitacionId: number): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.base}/api/imagenes/ver/${habitacionId}`)
      .pipe(
        map(arr =>
          arr.map(s => {
            const url = s.split('::')[1] ?? s; 
            return url.startsWith('http') ? url : `${this.base}${url}`;
          })
        )
      );
  }

  postImagen(habitacionId: number, archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('archivo', archivo, archivo.name);

    return this.http.post(`${this.base}/api/imagenes/${habitacionId}`, formData, {
      responseType: 'text'
    });
  }

  deleteImagen(habitacionId: number, imagenId: number): Observable<string> {
    return this.http.delete(
      `${this.base}/api/imagenes/borrar/${habitacionId}/${imagenId}`,
      { responseType: 'text' }
    );
  }
}