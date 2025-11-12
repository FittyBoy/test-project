import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user successfully', (done) => {
      service.register('testuser', 'password123').subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.message).toBe('Registration successful');
        expect(response.user?.username).toBe('testuser');
        expect(response.user?.createdAt).toBeDefined();
        done();
      });
    });

    it('should not register user with duplicate username', (done) => {
      service.register('testuser', 'password123').subscribe(() => {
        service.register('testuser', 'differentpass').subscribe(response => {
          expect(response.success).toBe(false);
          expect(response.message).toBe('Username already exists');
          done();
        });
      });
    });

    it('should set currentUser after successful registration', (done) => {
      service.register('testuser', 'password123').subscribe(() => {
        expect(service.currentUserValue).toBeTruthy();
        expect(service.currentUserValue?.username).toBe('testuser');
        done();
      });
    });
  });

  describe('login', () => {
    beforeEach((done) => {
      service.register('testuser', 'password123').subscribe(() => {
        service.logout();
        done();
      });
    });

    it('should login successfully with correct credentials', (done) => {
      service.login('testuser', 'password123').subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.message).toBe('Login successful');
        expect(response.user?.username).toBe('testuser');
        done();
      });
    });

    it('should fail login with incorrect password', (done) => {
      service.login('testuser', 'wrongpassword').subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.message).toBe('Invalid username or password');
        done();
      });
    });

    it('should fail login with non-existent username', (done) => {
      service.login('nonexistent', 'password123').subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.message).toBe('Invalid username or password');
        done();
      });
    });

    it('should update lastLoginTime on successful login', (done) => {
      const beforeLogin = new Date();
      service.login('testuser', 'password123').subscribe(response => {
        expect(response.user?.lastLoginTime).toBeDefined();
        const loginTime = new Date(response.user!.lastLoginTime!);
        expect(loginTime.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        done();
      });
    });

    it('should set currentUser after successful login', (done) => {
      service.login('testuser', 'password123').subscribe(() => {
        expect(service.currentUserValue).toBeTruthy();
        expect(service.currentUserValue?.username).toBe('testuser');
        done();
      });
    });
  });

  describe('logout', () => {
    beforeEach((done) => {
      service.register('testuser', 'password123').subscribe(() => {
        done();
      });
    });

    it('should clear currentUser on logout', () => {
      expect(service.currentUserValue).toBeTruthy();
      service.logout();
      expect(service.currentUserValue).toBeNull();
    });

    it('should remove user from localStorage on logout', () => {
      service.logout();
      const storedUser = localStorage.getItem('currentUser');
      expect(storedUser).toBeNull();
    });
  });

  describe('currentUser observable', () => {
    it('should emit current user value', (done) => {
      service.currentUser.subscribe(user => {
        if (user) {
          expect(user.username).toBe('testuser');
          done();
        }
      });
      service.register('testuser', 'password123').subscribe();
    });
  });
});
