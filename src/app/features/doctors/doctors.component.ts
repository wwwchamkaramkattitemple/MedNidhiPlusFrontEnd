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
import { DoctorService } from '../../../services/doctor.service';


interface doctor {
  id: number;
  doctorName: string;
  departmentName: string;
  qualification: string;
  revisitDays: string;
  consultationFee: string;
  specialization: string;
  isActive:boolean;
}

@Component({
  selector: 'app-doctors',
   standalone: true,
  imports: [MaterialModule, RouterModule, CommonModule],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.scss'
})

export class DoctorsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name','departmentName', 'revisitDays', 'consultationFee', 'active', 'actions'];
  dataSource = new MatTableDataSource<doctor>([]);
  isLoading = true;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private doctorService: DoctorService
  ) { }

  ngOnInit(): void {
    this.loaddoctors();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (!filterValue) {
      this.doctorService.getAllDoctors().subscribe({
        next: (doctors) => {
          this.dataSource.data = doctors;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (err) => console.error('Failed to load doctors', err)
      });
    } else {
      this.doctorService.searchDoctors(filterValue).subscribe({
        next: (doctors) => {
          this.dataSource.data = doctors;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (err) => console.error('Search failed', err)
      });
    }
  }

  loaddoctors() {
    setTimeout(() => {
      this.doctorService.getAllDoctors().subscribe(
        (data) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
        }
      );
      this.isLoading = false;
    }, 1000);
  }

  deletedoctor(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this doctor? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.doctorService.deleteDoctor(id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(doctor => doctor.id !== id);
            this.snackBar.open('Doctor deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error deleting doctor:', err);

            if (err.status === 403) {
              this.snackBar.open('You do not have permission to delete this doctor.', 'Close', { duration: 5000 });
            } else if (err.status === 404) {
              this.snackBar.open('Doctor not found.', 'Close', { duration: 3000 });
            } else {
              this.snackBar.open('Error deleting doctor.', 'Close', { duration: 3000 });
            }
          }
        });
      }
    });
  }

 
}

