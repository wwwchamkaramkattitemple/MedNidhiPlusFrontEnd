import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthenticationService } from './authentication.service';



export interface DailyCollectionReport {
    date: string;
    totalCollection: number;
    cashCollection: number;
    cardCollection: number;
    upiCollection: number;
    otherCollection: number;
}

export interface DoctorRevenueReport {
  doctorId: number;
  doctorName: string;
  invoiceCount: number;
  totalRevenue: number;
}


@Injectable({
    providedIn: 'root',
})


export class ReportsService {
    private apiUrl = `${environment.apiUrl}`;
    token = '';

    constructor(private http: HttpClient, private authService: AuthenticationService) { }

    getDailyCollection(fromDate: string,toDate: string): Observable<DailyCollectionReport[]> {

        const params = new HttpParams()
            .set('fromDate', fromDate)
            .set('toDate', toDate);

        return this.http.get<DailyCollectionReport[]>(`${this.apiUrl}/reports/daily-collection`,
            { params, headers: this.getAuthHeaders() }
        );
    }

    getDoctorRevenue(fromDate: string,toDate: string): Observable<DoctorRevenueReport[]> {
        const params = new HttpParams()
            .set('fromDate', fromDate)
            .set('toDate', toDate);

        return this.http.get<DoctorRevenueReport[]>(`${this.apiUrl}/reports/doctor-revenue`,
              { params, headers: this.getAuthHeaders() }
        );
    }


    downloadDailyCollectionPdf(from: string, to: string) {
        return this.http.get(`${this.apiUrl}/reports/daily-collection/pdf`,
            {
                params: { fromDate: from, toDate: to },
                responseType: 'blob', headers: this.getAuthHeaders()
            }
        );
    }

    downloadDailyCollectionExcel(fromDate: string, toDate: string) {
        return this.http.get(
            `${this.apiUrl}/reports/daily-collection/excel`,
            {
                params: { fromDate, toDate },
                responseType: 'blob', headers: this.getAuthHeaders()
            }
        );
    }

    downloadDoctorRevenuePdf(from: string, to: string) {
        return this.http.get(`${this.apiUrl}/reports/doctor-revenue/pdf`,
            {
                params: { fromDate: from, toDate: to },
                responseType: 'blob', headers: this.getAuthHeaders()
            }
        );
    }

    downloadDoctorRevenueExcel(fromDate: string, toDate: string) {
        return this.http.get(
            `${this.apiUrl}/reports/doctor-revenue/excel`,
            {
                params: { fromDate, toDate },
                responseType: 'blob', headers: this.getAuthHeaders()
            }
        );
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
