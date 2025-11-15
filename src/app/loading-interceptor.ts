// loading-interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, delay } from 'rxjs';
import { LoadingService } from './services/loading-service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Arranca el spinner
  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
