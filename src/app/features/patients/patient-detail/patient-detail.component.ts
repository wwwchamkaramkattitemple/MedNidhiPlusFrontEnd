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
import { PatientService } from '../../../../services/patient.service';
import { InvoiceService } from '../../../../services/invoice.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
  imports: [MaterialModule, CommonModule, RouterModule]
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
    private dialog: MatDialog,
    private patientService: PatientService,
    private invoiceService: InvoiceService
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

  this.patientService.getPatientById(id).subscribe({
    next: (patientRes) => {
      this.patient = patientRes;
      this.loadPatientAppointments(id);
      this.loadPatientInvoices(id);
    },
    error: (err) => {
      console.error("Error fetching patient:", err);
      this.snackBar.open("Error loading patient data", "Close", { duration: 3000 });
      this.isLoading = false;
      this.router.navigate(['/patients']);
    }
  });
}


  loadPatientAppointments(patientId: number): void {
  this.patientService.getAppointmentsByPatientId(patientId).subscribe({
    next: (appointmentsRes) => {
      this.appointments = appointmentsRes.map(a => ({
        id: a.id,
        date: new Date(a.appointmentDate),
        time: a.appointmentTime,
        status: a.statusName,
        type: a.appointmentType,
        doctorName: a.doctorName,
        fee: a.fee,
        isBilled: a.isBilled
      }));
    },
    error: (err) => {
      console.error("Failed to load appointments:", err);
      this.appointments = [];
    }
  });
}



 loadPatientInvoices(patientId: number): void {
  this.invoiceService.getPatientInvoicesByPatientId(patientId).subscribe({
    next: (res: any[]) => {
      this.invoices = res.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: new Date(inv.invoiceDate),  
        amount: inv.amount,
        status: inv.status
      }));

      this.isLoading = false;
    },
    error: (err) => {
      console.error("Failed to load invoices", err);
      this.invoices = [];
      this.isLoading = false;
    }
  });
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


   deletePatient(id: number) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this patient? This action cannot be undone.'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.snackBar.open('Patient deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/patients']);
        },
        error: (err) => {
          console.error('Error deleting patient:', err);

          if (err.status === 403) {
            this.snackBar.open('You do not have permission to delete this patient.', 'Close', { duration: 5000 });
          } else if (err.status === 404) {
            this.snackBar.open('Patient not found.', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Error deleting patient.', 'Close', { duration: 3000 });
          }
        }
      });
    }
  });
}

 
}