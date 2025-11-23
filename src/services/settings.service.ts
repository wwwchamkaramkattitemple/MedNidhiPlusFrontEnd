import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthenticationService } from './authentication.service';


@Injectable({
  providedIn: 'root',
})

export class SettingsService {
  private apiUrl = `${environment.apiUrl}`;
  token = '';

  constructor(private http: HttpClient,private authService:AuthenticationService) { }

  getSettings() {
    return this.http.get<any[]>(this.apiUrl + `/systemSettings`, { headers: this.getAuthHeaders() });
  }

  saveSettings(settings: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/systemSettings`, settings, { headers: this.getAuthHeaders() });
  }

  getAuthHeaders(): HttpHeaders {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        this.token = parsed.AuthToken;
      } catch {
        this.token = '';
      }
    }
     if (this.authService.isTokenExpired(this.token)) {
      this.authService.onLogOut();
    }
    return new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
  }


}
