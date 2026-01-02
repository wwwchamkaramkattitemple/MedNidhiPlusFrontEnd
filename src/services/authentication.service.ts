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



export interface UserData {
  AuthToken: string;
  UserName: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})

export class AuthenticationService {
  private apiUrl = `${environment.apiUrl}`;
  private userDataSubject = new BehaviorSubject<UserData | null>(this.getUserData());
  userData$ = this.userDataSubject.asObservable();
          

  constructor(private http: HttpClient, private router: Router, private location: Location) { }



  login(authenticationRequest: AuthenticationRequest): Observable<any> {
    return this.http.post(this.apiUrl + "/auth/Login", authenticationRequest);
  }

  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(this.apiUrl + "/auth/Register", registerRequest);
  }

 
  clearUserData() {
    localStorage.removeItem('userData');
    this.userDataSubject.next(null);
  }


 storeUserData(user: UserData): void {
    localStorage.setItem('userData', JSON.stringify(user));
    this.userDataSubject.next(user); 
  }

  getUserData(): UserData | null {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  }


 getUsernameFromToken(token: string): string | null {
    try {
      const decoded: any = jwtDecode(token);
      return decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      ] ?? null;
    } catch {
      return null;
    }
  }

  getRolesFromToken(token: string): string[] {
    try {
      const decoded: any = jwtDecode(token);

      const roles =
        decoded['role'] ||
        decoded['roles'] ||
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (!roles) return [];
      return Array.isArray(roles) ? roles : [roles];
    } catch {
      return [];
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
