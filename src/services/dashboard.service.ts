import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})

export class DashboardService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }


    getAllStats(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + "/dashboard/stats");
    }

    getRecentlyAddedFiles(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + "/dashboard/recentfiles");
    }





}

