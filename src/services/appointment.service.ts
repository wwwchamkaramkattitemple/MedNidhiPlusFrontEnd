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

export class AppointmentService {
    private apiUrl = `${environment.apiUrl}`;
    token = '';

    constructor(private http: HttpClient, private authService: AuthenticationService) { }

    getAppointmentTypes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/appointment/types`, { headers: this.getAuthHeaders() });
    }

    getAppointmentStatuses(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/appointment/statuses`, { headers: this.getAuthHeaders() });
    }

    getAppointments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/appointment`, { headers: this.getAuthHeaders() });
    }

    getAppointmentById(id: number) {
        return this.http.get<any>(`${this.apiUrl}/appointment/${id}`, { headers: this.getAuthHeaders() });
    }

    createAppointment(appointmentData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/appointment`, appointmentData, { headers: this.getAuthHeaders(), });
    }

    updateAppointment(id: number, appointmentData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/appointment/${id}`, appointmentData, { headers: this.getAuthHeaders(), });
    }

    deleteAppointment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/appointment/${id}`, {headers: this.getAuthHeaders(),});
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
