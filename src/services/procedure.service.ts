import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcedureService {
    private apiUrl = `${environment.apiUrl}`;
    token = '';

    constructor(private http: HttpClient, private authService: AuthenticationService) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/procedure`, { headers: this.getAuthHeaders() });
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/procedure/${id}`, { headers: this.getAuthHeaders() });
    }

    searchProcedures(query: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/procedure/search?query=${query}`, { headers: this.getAuthHeaders() });
    }

    createProcedure(procedureData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/procedure`, procedureData, { headers: this.getAuthHeaders() });
    }

    updateProcedure(id: number, procedureData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/procedure/${id}`, procedureData, { headers: this.getAuthHeaders() });
    }

    deleteProcedure(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/procedure/${id}`, { headers: this.getAuthHeaders() });
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
