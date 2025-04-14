import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Create spy object with a getter for isLoggedIn
    const spy = jasmine.createSpyObj('AuthService', ['canActivate'], {
      // This creates a getter property
      get isLoggedIn() { return false; }
    });
    
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: spy }
      ]
    });
    
    guard = TestBed.inject(AdminGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is logged in', () => {
    // Override the spy's isLoggedIn getter
    Object.defineProperty(authServiceSpy, 'isLoggedIn', {
      get: () => true
    });
    
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;
    
    expect(guard.canActivate(route, state)).toBe(true);
  });

  it('should redirect to login when user is not logged in', () => {
    // Ensure isLoggedIn returns false
    Object.defineProperty(authServiceSpy, 'isLoggedIn', {
      get: () => false
    });
    
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;
    
    expect(guard.canActivate(route, state)).toBe(false);
  });
});
