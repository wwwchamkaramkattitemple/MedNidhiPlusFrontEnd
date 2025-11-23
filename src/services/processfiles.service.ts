
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class ProcessfilesService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }


  getAllFiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + "/file/files");
  }

  getFileRows(fileId: number) {
    return this.http.get<any[]>(this.apiUrl +`/file/files/${fileId}/rows`);
  }

  uploadFile(file: File, token: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    const req = new HttpRequest('POST', `${this.apiUrl}/file/upload`, formData, {
      headers: headers,
      reportProgress: true,
      responseType: 'json'
    });

    console.log('Uploading with token:', token);
    console.log('Headers:', headers.keys());

    return this.http.request(req);
  }


}

