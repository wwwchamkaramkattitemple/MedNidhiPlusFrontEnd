import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MaterialModule } from "../../material.module";
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [MaterialModule, CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  stats = {
    totalPatients: 0,
    appointmentsToday: 0,
    pendingInvoices: 0,
    revenueThisMonth: 0
  };

  recentAppointments: any[] = [];
  recentInvoices: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient, private router: Router,) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // In a real application, these would be API calls to the backend
    // For now, we'll simulate the data

    // Simulate API call delay
    setTimeout(() => {
      this.stats = {
        totalPatients: 156,
        appointmentsToday: 12,
        pendingInvoices: 8,
        revenueThisMonth: 15750.50
      };

      this.recentAppointments = [
        { id: 1, patientName: 'John Doe', date: new Date(), time: '09:00', status: 'Scheduled', type: 'Check-up' },
        { id: 2, patientName: 'Jane Smith', date: new Date(), time: '10:30', status: 'Completed', type: 'Consultation' },
        { id: 3, patientName: 'Robert Johnson', date: new Date(), time: '13:15', status: 'Scheduled', type: 'Follow-up' },
        { id: 4, patientName: 'Emily Davis', date: new Date(), time: '15:45', status: 'Cancelled', type: 'Procedure' }
      ];

      this.recentInvoices = [
        { id: 1, patientName: 'Jane Smith', amount: 125.00, date: new Date(), status: 'Paid' },
        { id: 2, patientName: 'Michael Brown', amount: 350.75, date: new Date(), status: 'Pending' },
        { id: 3, patientName: 'Sarah Wilson', amount: 210.50, date: new Date(), status: 'Overdue' },
        { id: 4, patientName: 'David Miller', amount: 175.25, date: new Date(), status: 'Pending' }
      ];

      this.isLoading = false;
    }, 1000);

    // In a real application, we would make HTTP requests to the backend API
    // Example:
    /*
    this.http.get<any>(`${environment.apiUrl}/dashboard/stats`).subscribe(data => {
      this.stats = data;
    });

    this.http.get<any[]>(`${environment.apiUrl}/appointments/recent`).subscribe(data => {
      this.recentAppointments = data;
    });

    this.http.get<any[]>(`${environment.apiUrl}/invoices/recent`).subscribe(data => {
      this.recentInvoices = data;
      this.isLoading = false;
    });
    */
  }

  
  // getStatusColor(status: string): string {
  //   switch (status.toLowerCase()) {
  //     case 'scheduled':
  //       return 'primary';
  //     case 'completed':
  //       return 'accent';
  //     case 'cancelled':
  //       return 'warn';
  //     case 'paid':
  //       return 'accent';
  //     case 'pending':
  //       return 'primary';
  //     case 'overdue':
  //       return 'warn';
  //     default:
  //       return '';
  //   }
  // }

  getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'scheduled': return '#1968adff';
    case 'completed': return '#118817ff';
    case 'cancelled': return '#e3120eff';
    case 'paid': return '#081566ff';
    case 'pending': return '#dc18b1ff';
    case 'overdue': return '#d78808ff';
    default: return '#333';
  }
}


}