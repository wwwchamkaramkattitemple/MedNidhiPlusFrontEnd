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

export class departmentService {
  private apiUrl = `${environment.apiUrl}`;
  token = '';

  constructor(private http: HttpClient,private authService:AuthenticationService) { }

  getAlldepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/department`, { headers: this.getAuthHeaders() });
  }

  getdepartmentById(departmentId: number) {
    return this.http.get<any[]>(this.apiUrl + `/department/${departmentId}`, { headers: this.getAuthHeaders() });
  }

  searchdepartments(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/department/search?query=${query}`, { headers: this.getAuthHeaders() });
  }

  createdepartment(department: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/department`, department, { headers: this.getAuthHeaders() });
  }

  updatedepartment(departmentId: number, departmentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/department/${departmentId}`, departmentData, { headers: this.getAuthHeaders() });
  }

  deletedepartment(departmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/department/${departmentId}`, { headers: this.getAuthHeaders() });
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
