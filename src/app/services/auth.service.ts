import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginResponse, RegisterResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly STORAGE_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor() {
    const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return new Observable(observer => {
      const users = this.getStoredUsers();
      const user = users.find(
        u => u.username === username && u.password === password
      );

      if (user) {
        user.lastLoginTime = new Date();
        this.updateUserInStorage(user);
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        
        observer.next({
          success: true,
          message: 'Login successful',
          user: user
        });
      } else {
        observer.next({
          success: false,
          message: 'Invalid username or password'
        });
      }
      observer.complete();
    });
  }

  register(username: string, password: string): Observable<RegisterResponse> {
    return new Observable(observer => {
      const users = this.getStoredUsers();
      
      // ตรวจสอบว่า username ซ้ำหรือไม่
      if (users.some(u => u.username === username)) {
        observer.next({
          success: false,
          message: 'Username already exists'
        });
        observer.complete();
        return;
      }

      // สร้าง user ใหม่
      const newUser: User = {
        id: this.generateId(),
        username: username,
        password: password,
        createdAt: new Date(),
        lastLoginTime: new Date()
      };

      users.push(newUser);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
      this.currentUserSubject.next(newUser);

      observer.next({
        success: true,
        message: 'Registration successful',
        user: newUser
      });
      observer.complete();
    });
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  private getStoredUsers(): User[] {
    const usersJson = localStorage.getItem(this.STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private updateUserInStorage(updatedUser: User): void {
    const users = this.getStoredUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}