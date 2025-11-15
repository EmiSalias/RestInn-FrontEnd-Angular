import { Injectable } from '@angular/core';
import { BehaviorSubject, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = 0;
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  private showTimeoutId: any = null;

  show() {
    this.activeRequests++;

    if (this.activeRequests === 1) {
      // Solo cuando pasa de 0 → 1 empezamos el timer
      if (this.showTimeoutId) {
        clearTimeout(this.showTimeoutId);
      }
      this.showTimeoutId = setTimeout(() => {
        this._loading$.next(true);
        this.showTimeoutId = null;
      }, 0); // aparece solo si el request dura > 0ms
    }
  }

  hide() {
    if (this.activeRequests === 0) return;

    this.activeRequests--;

    if (this.activeRequests === 0) {
      // Si todavía no llegó a mostrarse, cancelamos el timer
      if (this.showTimeoutId) {
        clearTimeout(this.showTimeoutId);
        this.showTimeoutId = null;
      }
      this._loading$.next(false);
    }
  }
}
