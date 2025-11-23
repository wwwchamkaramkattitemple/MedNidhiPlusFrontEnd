import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

export interface AuthenticationRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName?: string;  
  lastName?: string;  
}

interface DecodedToken {
  sub?: string;
  username?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export interface UserData {
  AuthToken: string;
  UserName: string;
}

@Injectable({
  providedIn: 'root',
})

export class AuthenticationService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private router: Router, private location: Location) { }

  private usernameSubject = new BehaviorSubject<string | null>(null);
  username$ = this.usernameSubject.asObservable();

  login(authenticationRequest: AuthenticationRequest): Observable<any> {
    return this.http.post(this.apiUrl + "/auth/Login", authenticationRequest);
  }

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(this.apiUrl + "/auth/Register", registerRequest);
  }

  storeUserData(user: UserData) {
    localStorage.setItem('userData', JSON.stringify(user));
    this.usernameSubject.next(user.UserName);
  }

  clearUserData() {
    localStorage.removeItem('userData');
    this.usernameSubject.next(null);
  }

  getUserData() {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  }

  getUsernameFromToken(token: string): string | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || null;
    } catch (err) {
      console.error('Invalid token', err);
      return null;
    }
  }

  getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
}

  onLogOut() {
    this.clearUserData();
    this.router.navigate(['/authentication/login']).then(() => {
      this.location.replaceState('/authentication/login');
    });
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

}
