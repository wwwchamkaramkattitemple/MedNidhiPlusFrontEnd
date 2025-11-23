import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from "../../material.module";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { Subscription } from 'rxjs';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import 'moment/locale/en-gb';
import { MatSnackBar } from '@angular/material/snack-bar';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-appointments',
  standalone: true,
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss'],
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class AppointmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Use doctorName column (matches mapped data)
  displayedColumns: string[] = ['id', 'date', 'time', 'patientName', 'type', 'doctorName', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = true;
  filterDate: Date | null = null;
  filterStatus: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private subs: Subscription[] = [];

  constructor(private dialog: MatDialog, private appointmentService: AppointmentService,private snackBar: MatSnackBar,) { }

  ngOnInit(): void {
    this.loadAppointments();
    // configure default filter predicate (used by applyFilter)
    this.dataSource.filterPredicate = this.defaultFilterPredicate();
  }

  ngAfterViewInit() {
    // assign paginator & sort AFTER view init
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  loadAppointments() {
    this.isLoading = true;
    const s = this.appointmentService.getAppointments().subscribe({
      next: (res) => {
        this.dataSource.data = res.map((a: any) => {
          // Split the time string "HH:mm:ss"
          const [hourStr, minuteStr] = a.appointmentTime.split(':');
          let hour = parseInt(hourStr, 10);
          const minute = minuteStr;
          const ampm = hour >= 12 ? 'PM' : 'AM';
          hour = hour % 12 || 12; // convert 0 to 12

          return {
            id: a.id,
            patientId: a.patientId,
            patientName: a.patientName,
            doctorName: a.doctorName,
            department: a.departmentName,
            date: new Date(a.appointmentDate),
            time: `${hour}:${minute} ${ampm}`,   // now formatted with AM/PM
            type: a.appointmentTypeName ?? 'N/A',
            status: a.statusName ?? 'Pending',
            notes: a.notes ?? ''
          };
        });



        // ensure paginator resets
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading appointments", err);
        this.isLoading = false;
      }
    });

    this.subs.push(s);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // We use a lowercased filter string
    this.dataSource.filter = (filterValue || '').trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Apply date/status filtering in combination with text filter
  filterAppointments() {
    // set a custom predicate that considers date & status + text
    this.dataSource.filterPredicate = this.combinedFilterPredicate(this.filterDate, this.filterStatus);
    // Trigger filter (mat table requires a change in filter value to re-evaluate)
    // We append a space to force recalculation if same filter unchanged
    this.dataSource.filter = (this.dataSource.filter || '') + ' ';
  }

  resetFilters() {
    this.filterDate = null;
    this.filterStatus = '';
    // reset predicate to default
    this.dataSource.filterPredicate = this.defaultFilterPredicate();
    this.dataSource.filter = '';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Default predicate: checks patientName, type, doctorName, status (text search)
  private defaultFilterPredicate() {
    return (data: any, filter: string) => {
      const searchStr = (filter || '').toLowerCase();
      return (
        (data.patientName || '').toString().toLowerCase().includes(searchStr) ||
        (data.type || '').toString().toLowerCase().includes(searchStr) ||
        (data.doctorName || '').toString().toLowerCase().includes(searchStr) ||
        (data.status || '').toString().toLowerCase().includes(searchStr) ||
        (data.department || '').toString().toLowerCase().includes(searchStr)
      );
    };
  }

  // Combined predicate that respects date and status as well as search text
  private combinedFilterPredicate(filterDate: Date | null, filterStatus: string) {
    return (data: any, filter: string) => {
      const searchStr = (filter || '').toLowerCase().trim();

      const dateMatch = !filterDate || new Date(data.date).toDateString() === new Date(filterDate).toDateString();
      const statusMatch = !filterStatus || (data.status || '').toLowerCase() === filterStatus.toLowerCase();

      const textMatch =
        (data.patientName || '').toString().toLowerCase().includes(searchStr) ||
        (data.type || '').toString().toLowerCase().includes(searchStr) ||
        (data.doctorName || '').toString().toLowerCase().includes(searchStr) ||
        (data.status || '').toString().toLowerCase().includes(searchStr) ||
        (data.department || '').toString().toLowerCase().includes(searchStr);

      return dateMatch && statusMatch && textMatch;
    };
  }

  // returns color hex (used inline style) for status label
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

//   deleteAppointment(id: number) {
//     const dialogRef = this.dialog.open(ConfirmDialogComponent, {
//       width: '350px',
//       data: {
//         title: 'Confirm Delete',
//         message: 'Are you sure you want to delete this appointment? This action cannot be undone.'
//       }
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       if (result) {
//         // Option A: call API to delete (recommended)
//         // const s = this.appointmentService.deleteAppointment(id).subscribe({
//         //   next: () => {
//         //     this.dataSource.data = this.dataSource.data.filter(item => item.id !== id);
//         //   },
//         //   error: (err) => console.error('Delete failed', err)
//         // });
//         // this.subs.push(s);

//         // Option B: if API not yet available, remove locally
//         this.dataSource.data = this.dataSource.data.filter(item => item.id !== id);
//       }
//     });
//   }

deleteAppointment(id: number) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this appointment? This action cannot be undone.'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      const sub = this.appointmentService.deleteAppointment(id).subscribe({
        next: () => {
          // Remove from table
          this.dataSource.data = this.dataSource.data.filter(item => item.id !== id);

          // Show success notification
          this.snackBar.open('Appointment deleted successfully.', 'Close', {
            duration: 3000
          });
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

      this.subs.push(sub);
    }
  });
}


 }

