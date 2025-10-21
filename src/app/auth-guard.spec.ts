import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth-service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRoute = new ActivatedRouteSnapshot();
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getCurrentUser']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('Debe permitir el acceso si el usuario está autenticado y tiene el rol correcto', () => {
    mockRoute.data = { roles: ['admin'] };
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentUser.and.returnValue({ username: 'admin', role: 'admin' });

    const result = guard.canActivate(mockRoute, mockState);
    expect(result).toBeTrue();
  });

  it('Debe redirigir a /sign_in si el usuario no está autenticado', () => {
    mockRoute.data = { roles: ['admin'] };
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.getCurrentUser.and.returnValue(null);

    const result = guard.canActivate(mockRoute, mockState);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/sign_in']);
  });

  it('Debe redirigir a /unauthorized si el usuario no tiene el rol requerido', () => {
    mockRoute.data = { roles: ['admin'] };
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate(mockRoute, mockState);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});