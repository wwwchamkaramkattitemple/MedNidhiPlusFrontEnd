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
import { departmentService } from '../../../services/department.service';

interface Department {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: Date;
}

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [MaterialModule, RouterModule, CommonModule],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss'
})

export class DepartmentsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'revisitDays', 'consultationFee', 'active', 'actions'];
  dataSource = new MatTableDataSource<Department>([]);
  isLoading = true;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private departmentService: departmentService
  ) { }

  ngOnInit(): void {
    this.loadDepartments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (!filterValue) {
      this.departmentService.getAlldepartments().subscribe({
        next: (departments) => {
          this.dataSource.data = departments;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (err) => console.error('Failed to load departments', err)
      });
    } else {
      this.departmentService.searchdepartments(filterValue).subscribe({
        next: (departments) => {
          this.dataSource.data = departments;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (err) => console.error('Search failed', err)
      });
    }
  }

  loadDepartments() {
    setTimeout(() => {
      this.departmentService.getAlldepartments().subscribe(
        (data) => {
          console.log(data);
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
        }
      );
      this.isLoading = false;
    }, 1000);
  }

  deleteDepartment(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this department? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.departmentService.deletedepartment(id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(department => department.id !== id);
            this.snackBar.open('Department deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error deleting department:', err);

            if (err.status === 403) {
              this.snackBar.open('You do not have permission to delete this department.', 'Close', { duration: 5000 });
            } else if (err.status === 404) {
              this.snackBar.open('Department not found.', 'Close', { duration: 3000 });
            } else {
              this.snackBar.open('Error deleting department.', 'Close', { duration: 3000 });
            }
          }
        });
      }
    });
  }

 
}

