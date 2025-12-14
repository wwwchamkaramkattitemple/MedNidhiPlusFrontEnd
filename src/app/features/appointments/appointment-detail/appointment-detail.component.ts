import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from "../../../material.module";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../services/appointment.service';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.scss'],
  imports: [MaterialModule, RouterModule, CommonModule]
})
export class AppointmentDetailComponent implements OnInit {
  appointmentId!: number;
  appointment: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.appointmentId = +id;
        this.loadAppointmentData();
      }
    });
  }

  loadAppointmentData(): void {
    this.isLoading = true;

    this.appointmentService.getAppointmentById(this.appointmentId).subscribe({
      next: (res) => {
        const [hourStr, minuteStr] = res.appointmentTime.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = minuteStr;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // convert 0 to 12

        this.appointment = {
          id: res.id,
          patientId: res.patientId,
          patientName: res.patientName,
          appointmentDate: new Date(res.appointmentDate),
          appointmentTime: `${hour}:${minute} ${ampm}`,//res.appointmentTime,
          appointmentType: res.appointmentType?.typeName ?? res.appointmentTypeName,
          doctorName: res.doctorName,
          status: res.status?.statusName ?? res.statusName,
          fee: res.fee ?? 0,
          notes: res.notes,
          isBilled: res.isBilled,
          createdAt: res.createdAt,
          updatedAt: res.updatedAt
        };
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load appointment', 'Close', { duration: 3000 });
        this.router.navigate(['/appointments']);
      }
    });
  }

  // getStatusColor(status: string): string {
  //   switch (status.toLowerCase()) {
  //     case 'completed':
  //       return 'primary';
  //     case 'scheduled':
  //     case 'confirmed':
  //       return 'accent';
  //     case 'in progress':
  //       return 'warn';
  //     case 'cancelled':
  //     case 'no show':
  //       return '';
  //     default:
  //       return '';
  //   }
  // }

  getStatusColor(status: string): string {
    if (!status) return '#333';
    switch (status.toLowerCase()) {
      case 'scheduled': return '#1968adff';
      case 'completed': return '#118817ff';
      case 'cancelled': return '#e3120eff';
      case 'in progress': return '#081566ff';
      case 'pending': return '#dc18b1ff';
      case 'overdue': return '#d78808ff';
      default: return '#333';
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

  deleteAppointment() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this appointment? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const sub = this.appointmentService.deleteAppointment(this.appointmentId).subscribe({
          next: () => {
            this.snackBar.open('Appointment deleted successfully.', 'Close', {
              duration: 3000
            });
            this.router.navigate(['/appointments']);
          },
          error: (err) => {
            console.error('Delete failed:', err);

            this.snackBar.open(
              err.status === 403
                ? 'Only admins can delete appointments.'
                : 'Failed to delete appointment.',
              'Close',
              { duration: 3000 }
            );
          }
        });
      }
    });
  }

  // deleteAppointment(): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirm Delete',
  //       message: 'Are you sure you want to delete this appointment? This action cannot be undone.'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       // Simulate API call
  //       this.isLoading = true;
  //       setTimeout(() => {
  //         console.log(`Deleting appointment with ID: ${this.appointmentId}`);

  //         this.snackBar.open('Appointment deleted successfully!', 'Close', {
  //           duration: 3000
  //         });

  //         this.router.navigate(['/appointments']);
  //         this.isLoading = false;
  //       }, 1000);
  //     }
  //   });
  // }
}