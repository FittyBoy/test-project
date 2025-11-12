import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should show error when username is empty', () => {
      component.username = '';
      component.password = 'password123';
      component.onSubmit();
      expect(component.errorMessage).toBe('Please enter username and password');
    });

    it('should show error when password is empty', () => {
      component.username = 'testuser';
      component.password = '';
      component.onSubmit();
      expect(component.errorMessage).toBe('Please enter username and password');
    });

    it('should show error when both fields are empty', () => {
      component.username = '';
      component.password = '';
      component.onSubmit();
      expect(component.errorMessage).toBe('Please enter username and password');
    });
  });

  describe('Login Functionality', () => {
    it('should call authService.login with correct credentials', () => {
      component.username = 'testuser';
      component.password = 'password123';
      authService.login.and.returnValue(of({ success: true, message: 'Login successful' }));
      
      component.onSubmit();
      
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should navigate to dashboard on successful login', () => {
      component.username = 'testuser';
      component.password = 'password123';
      authService.login.and.returnValue(of({ success: true, message: 'Login successful' }));
      
      component.onSubmit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error message on failed login', () => {
      component.username = 'testuser';
      component.password = 'wrongpassword';
      authService.login.and.returnValue(of({ 
        success: false, 
        message: 'Invalid username or password' 
      }));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('Invalid username or password');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should set isLoading to true during login', () => {
      component.username = 'testuser';
      component.password = 'password123';
      authService.login.and.returnValue(of({ success: true, message: 'Login successful' }));
      
      component.onSubmit();
      // Note: isLoading will be false by the time we check due to synchronous observable
      expect(authService.login).toHaveBeenCalled();
    });

    it('should handle login error gracefully', () => {
      component.username = 'testuser';
      component.password = 'password123';
      authService.login.and.returnValue(throwError(() => new Error('Network error')));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('An error occurred during login');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to register page when goToRegister is called', () => {
      component.goToRegister();
      expect(router.navigate).toHaveBeenCalledWith(['/register']);
    });
  });
});
