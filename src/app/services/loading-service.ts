import { Injectable }       from '@angular/core';
import { BehaviorSubject}   from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests      = 0;
  private readonly _loading$  = new BehaviorSubject<boolean>(false);
  readonly loading$           = this._loading$.asObservable();
  private showTimeoutId: any  = null;

  show() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      if (this.showTimeoutId) {
        clearTimeout(this.showTimeoutId);
      }
      this.showTimeoutId = setTimeout(() => {
        this._loading$.next(true);
        this.showTimeoutId = null;
      }, 0);
    }
  }

  hide() {
    if (this.activeRequests === 0) return;
    this.activeRequests--;
    if (this.activeRequests === 0) {
      if (this.showTimeoutId) {
        clearTimeout(this.showTimeoutId);
        this.showTimeoutId = null;
      }
      this._loading$.next(false);
    }
  }
}
