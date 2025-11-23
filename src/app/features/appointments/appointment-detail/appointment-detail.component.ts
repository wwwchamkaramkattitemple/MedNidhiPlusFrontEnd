import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from "../../../material.module";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-detail',
  standalone:true,
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.scss'],
  imports: [MaterialModule,RouterModule,CommonModule]
})
export class AppointmentDetailComponent implements OnInit {
  appointmentId!: number;
  appointment: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.appointmentId = +id;
        this.loadAppointmentData(+id);
      }
    });
  }

  loadAppointmentData(id: number): void {
    // Simulate API call
    this.isLoading = true;
    setTimeout(() => {
      // Mock data - replace with actual API call
      this.appointment = {
        id: id,
        patientId: 2,
        patientName: 'Jane Smith',
        appointmentDate: new Date('2023-06-16'),
        appointmentTime: '10:30 AM',
        appointmentType: 'Consultation',
        doctorName: 'Dr. Johnson',
        status: 'Scheduled',
        fee: 150,
        notes: 'Initial consultation for knee pain. Patient reports experiencing pain for the last 2 weeks after jogging. Recommended X-ray and possible physical therapy depending on results.',
        isBilled: false,
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date('2023-06-10')
      };
      
      this.isLoading = false;
    }, 1000);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'primary';
      case 'scheduled':
      case 'confirmed':
        return 'accent';
      case 'in progress':
        return 'warn';
      case 'cancelled':
      case 'no show':
        return '';
      default:
        return '';
    }
  }

  createInvoice(): void {
    // Navigate to create invoice page with appointment ID
    this.router.navigate(['/billing/new'], { 
      queryParams: { 
        patientId: this.appointment.patientId,
        appointmentId: this.appointmentId 
      } 
    });
  }

  deleteAppointment(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { 
        title: 'Confirm Delete', 
        message: 'Are you sure you want to delete this appointment? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Simulate API call
        this.isLoading = true;
        setTimeout(() => {
          console.log(`Deleting appointment with ID: ${this.appointmentId}`);
          
          this.snackBar.open('Appointment deleted successfully!', 'Close', {
            duration: 3000
          });
          
          this.router.navigate(['/appointments']);
          this.isLoading = false;
        }, 1000);
      }
    });
  }
}