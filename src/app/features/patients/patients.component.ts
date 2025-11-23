import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from "../../material.module";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../services/patient.service';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: Date;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
  imports: [MaterialModule, RouterModule, CommonModule]
})
export class PatientsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name','gender', 'phoneNumber', 'email', 'dateOfBirth', 'actions'];
  dataSource = new MatTableDataSource<Patient>([]);
  isLoading = true;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.loadPatients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (!filterValue) {
      this.patientService.getAllPatients().subscribe({
        next: (patients) => {
          this.dataSource.data = patients;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (err) => console.error('Failed to load patients', err)
      });
    } else {
      this.patientService.searchPatients(filterValue).subscribe({
        next: (patients) => {
          this.dataSource.data = patients;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (err) => console.error('Search failed', err)
      });
    }
  }

  loadPatients() {
    setTimeout(() => {
      this.patientService.getAllPatients().subscribe(
        (data) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
        }
      );
      this.isLoading = false;
    }, 1000);
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
          this.dataSource.data = this.dataSource.data.filter(patient => patient.id !== id);
          this.snackBar.open('Patient deleted successfully', 'Close', { duration: 3000 });
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

  getFullName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }
}
