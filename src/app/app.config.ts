import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection }  from '@angular/core';
import { provideRouter, withInMemoryScrolling }                                               from '@angular/router'; 
import { routes }                                                                             from './app.routes';
import { provideHttpClient, withInterceptors }                                                from '@angular/common/http';
import { authInterceptor }                                                                    from './auth-interceptor';
import { loadingInterceptor }                                                                 from './loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor,]))
  ]
};