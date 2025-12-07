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

export class InvoiceService {
    private apiUrl = `${environment.apiUrl}`;
    token = '';

    constructor(private http: HttpClient, private authService: AuthenticationService) { }

    getInvoices(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/invoice`, { headers: this.getAuthHeaders() });
    }

    getInvoiceById(id: number) {
        return this.http.get<any>(`${this.apiUrl}/invoice/${id}`, { headers: this.getAuthHeaders() });
    }

    createInvoice(invoiceData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/invoice`, invoiceData, { headers: this.getAuthHeaders(), });
    }

    updateInvoice(id: number, invoiceData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/invoice/${id}`, invoiceData, { headers: this.getAuthHeaders(), });
    }

    deleteInvoice(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/invoice/${id}`, {headers: this.getAuthHeaders(),});
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
