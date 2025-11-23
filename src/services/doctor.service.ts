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

export class DoctorService {
  private apiUrl = `${environment.apiUrl}`;
  token = '';

  constructor(private http: HttpClient,private authService:AuthenticationService) { }

  getAllDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor`, { headers: this.getAuthHeaders() });
  }

  getdoctorById(doctorId: number) {
    return this.http.get<any[]>(this.apiUrl + `/doctor/${doctorId}`, { headers: this.getAuthHeaders() });
  }

  searchDoctors(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor/search?query=${query}`, { headers: this.getAuthHeaders() });
  }

  createDoctor(doctor: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/doctor`, doctor, { headers: this.getAuthHeaders() });
  }

  updateDoctor(doctorId: number, doctorData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/doctor/${doctorId}`, doctorData, { headers: this.getAuthHeaders() });
  }

  deleteDoctor(doctorId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/doctor/${doctorId}`, { headers: this.getAuthHeaders() });
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
