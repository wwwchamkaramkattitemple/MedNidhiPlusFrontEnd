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

export class PatientService {
  private apiUrl = `${environment.apiUrl}`;
  token = '';

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patient`, { headers: this.getAuthHeaders() });
  }

  getPatientById(patientId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/patient/${patientId}`, { headers: this.getAuthHeaders() });
  }

  searchPatients(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patient/search?query=${query}`, { headers: this.getAuthHeaders() });
  }

  createPatient(patient: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/patient`, patient, { headers: this.getAuthHeaders() });
  }

  updatePatient(patientId: number, patientData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/patient/${patientId}`, patientData, { headers: this.getAuthHeaders() });
  }

  deletePatient(patientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/patient/${patientId}`, { headers: this.getAuthHeaders() });
  }

  getAppointmentsByPatientId(patientId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/appointment/patient/${patientId}`, { headers: this.getAuthHeaders() });
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
