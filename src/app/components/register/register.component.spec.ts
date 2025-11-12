import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
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
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should show error when any field is empty', () => {
      component.username = '';
      component.password = 'password123';
      component.confirmPassword = 'password123';
      component.onSubmit();
      expect(component.errorMessage).toBe('Please fill in all fields');
    });

    it('should show error when passwords do not match', () => {
      component.username = 'testuser';
      component.password = 'password123';
      component.confirmPassword = 'differentpassword';
      component.onSubmit();
      expect(component.errorMessage).toBe('Passwords do not match');
    });

    it('should show error when password is too short', () => {
      component.username = 'testuser';
      component.password = '12345';
      component.confirmPassword = '12345';
      component.onSubmit();
      expect(component.errorMessage).toBe('Password must be at least 6 characters');
    });

    it('should not show error when all validations pass', () => {
      component.username = 'testuser';
      component.password = 'password123';
      component.confirmPassword = 'password123';
      authService.register.and.returnValue(of({ 
        success: true, 
        message: 'Registration successful' 
      }));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Registration Functionality', () => {
    beforeEach(() => {
      component.username = 'testuser';
      component.password = 'password123';
      component.confirmPassword = 'password123';
    });

    it('should call authService.register with correct credentials', () => {
      authService.register.and.returnValue(of({ 
        success: true, 
        message: 'Registration successful' 
      }));
      
      component.onSubmit();
      
      expect(authService.register).toHaveBeenCalledWith('testuser', 'password123');
    });

    it('should navigate to dashboard on successful registration', () => {
      authService.register.and.returnValue(of({ 
        success: true, 
        message: 'Registration successful' 
      }));
      
      component.onSubmit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error message when username already exists', () => {
      authService.register.and.returnValue(of({ 
        success: false, 
        message: 'Username already exists' 
      }));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('Username already exists');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should handle registration error gracefully', () => {
      authService.register.and.returnValue(throwError(() => new Error('Network error')));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('An error occurred during registration');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when goToLogin is called', () => {
      component.goToLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
