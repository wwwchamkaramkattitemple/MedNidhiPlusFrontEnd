import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-detail',
  standalone:true,
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
  imports: [MaterialModule,CommonModule,RouterModule]
})
export class PatientDetailComponent implements OnInit {
  patient: any = null;
  patientId: number = 0;
  isLoading = true;
  appointments: any[] = [];
  invoices: any[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.patientId = +id;
        this.loadPatientData(this.patientId);
      } else {
        this.router.navigate(['/patients']);
      }
    });
  }

  loadPatientData(id: number): void {
    this.isLoading = true;

    // In a real application, this would be an API call to the backend
    // For now, we'll simulate the data

    // Simulate API call delay
    setTimeout(() => {
      this.patient = {
        id: id,
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '555-123-4567',
        email: 'john.doe@example.com',
        dateOfBirth: new Date(1980, 5, 15),
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        medicalHistory: 'No significant medical history',
        insuranceProvider: 'Health Insurance Co',
        insurancePolicyNumber: 'HI12345678',
        createdAt: new Date(2023, 0, 15)
      };

      this.appointments = [
        { id: 1, date: new Date(), time: '09:00', status: 'Scheduled', type: 'Check-up', doctorName: 'Dr. Smith' },
        { id: 2, date: new Date(2023, 4, 10), time: '14:30', status: 'Completed', type: 'Consultation', doctorName: 'Dr. Johnson' },
        { id: 3, date: new Date(2023, 3, 5), time: '11:15', status: 'Cancelled', type: 'Follow-up', doctorName: 'Dr. Smith' }
      ];

      this.invoices = [
        { id: 1, invoiceNumber: 'INV-20230515-0001', date: new Date(2023, 4, 15), amount: 125.00, status: 'Paid' },
        { id: 2, invoiceNumber: 'INV-20230410-0003', date: new Date(2023, 3, 10), amount: 350.75, status: 'Paid' },
        { id: 3, invoiceNumber: 'INV-20230305-0002', date: new Date(2023, 2, 5), amount: 210.50, status: 'Pending' }
      ];

      this.isLoading = false;
    }, 1000);

    // In a real application, we would make HTTP requests to the backend API
    // Example:
    /*
    this.http.get<any>(`${environment.apiUrl}/patients/${id}`).subscribe(
      (data) => {
        this.patient = data;
        this.loadPatientAppointments(id);
      },
      (error) => {
        console.error('Error fetching patient:', error);
        this.snackBar.open('Error loading patient data', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/patients']);
      }
    );
    */
  }

  loadPatientAppointments(patientId: number): void {
    // In a real application, we would make HTTP requests to the backend API
    // Example:
    /*
    this.http.get<any[]>(`${environment.apiUrl}/appointments/patient/${patientId}`).subscribe(
      (data) => {
        this.appointments = data;
        this.loadPatientInvoices(patientId);
      },
      (error) => {
        console.error('Error fetching appointments:', error);
        this.appointments = [];
        this.loadPatientInvoices(patientId);
      }
    );
    */
  }

  loadPatientInvoices(patientId: number): void {
    // In a real application, we would make HTTP requests to the backend API
    // Example:
    /*
    this.http.get<any[]>(`${environment.apiUrl}/invoices/patient/${patientId}`).subscribe(
      (data) => {
        this.invoices = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching invoices:', error);
        this.invoices = [];
        this.isLoading = false;
      }
    );
    */
  }

  getFullName(): string {
    return `${this.patient.firstName} ${this.patient.lastName}`;
  }

  getAge(): number {
    const today = new Date();
    const birthDate = new Date(this.patient.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'accent';
      case 'cancelled':
        return 'warn';
      case 'paid':
        return 'accent';
      case 'pending':
        return 'primary';
      case 'overdue':
        return 'warn';
      default:
        return '';
    }
  }

  deletePatient(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { 
        title: 'Confirm Delete', 
        message: 'Are you sure you want to delete this patient? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // In a real application, this would be an API call to the backend
        // For now, we'll simulate the deletion

        // Simulate API call delay
        setTimeout(() => {
          this.snackBar.open('Patient deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/patients']);
        }, 1000);

        // In a real application, we would make an HTTP request to the backend API
        // Example:
        /*
        this.http.delete(`${environment.apiUrl}/patients/${this.patientId}`).subscribe(
          () => {
            this.snackBar.open('Patient deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/patients']);
          },
          (error) => {
            console.error('Error deleting patient:', error);
            this.snackBar.open('Error deleting patient', 'Close', { duration: 3000 });
          }
        );
        */
      }
    });
  }
}