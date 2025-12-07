
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

export class MedicineCategoryService {
    private apiUrl = `${environment.apiUrl}`;
    token = '';

    constructor(private http: HttpClient, private authService: AuthenticationService) { }
    getMedicineCategorys() {
        return this.http.get<any[]>(`${this.apiUrl}/medicineCategory`, { headers: this.getAuthHeaders() });
    }

    getMedicineCategoryById(id: number) {
        return this.http.get<any>(`${this.apiUrl}/medicineCategory/${id}`, { headers: this.getAuthHeaders() });
    }

    addMedicineCategory(data: any) {
        return this.http.post(`${this.apiUrl}/medicineCategory`, data, { headers: this.getAuthHeaders() });
    }

    updateMedicineCategory(id: number, data: any) {
        return this.http.put(`${this.apiUrl}/medicineCategory/${id}`, data, { headers: this.getAuthHeaders() });
    }

    deleteMedicineCategory(id: number) {
        return this.http.delete(`${this.apiUrl}/medicineCategory/${id}`, { headers: this.getAuthHeaders() });
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