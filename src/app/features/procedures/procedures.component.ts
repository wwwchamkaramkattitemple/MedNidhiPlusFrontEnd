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
import { ProcedureService } from '../../../services/procedure.service';

interface Department {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: Date;
}

@Component({
  selector: 'app-procedures',
  standalone: true,
  imports: [MaterialModule, RouterModule, CommonModule],
  templateUrl: './procedures.component.html',
  styleUrl: './procedures.component.scss'
})


export class ProceduresComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name','description', 'fee', 'taxRate', 'active', 'actions'];
  dataSource = new MatTableDataSource<Department>([]);
  isLoading = true;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private procedureService: ProcedureService
  ) { }

  ngOnInit(): void {
    this.loadProcedures();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (!filterValue) {
      this.procedureService.getAll().subscribe({
        next: (procedures) => {
          this.dataSource.data = procedures;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (err) => console.error('Failed to load departments', err)
      });
    } else {
      this.procedureService.searchProcedures(filterValue).subscribe({
        next: (procedures) => {
          this.dataSource.data = procedures;
          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }
        },
        error: (err) => console.error('Search failed', err)
      });
    }
  }

  loadProcedures() {
    setTimeout(() => {
      this.procedureService.getAll().subscribe(
        (data) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
        }
      );
      this.isLoading = false;
    }, 1000);
  }

  deleteProcedure(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this procedure? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.procedureService.deleteProcedure(id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(department => department.id !== id);
            this.snackBar.open('Procedure deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error deleting procedure:', err);

            if (err.status === 403) {
              this.snackBar.open('You do not have permission to delete this procedure.', 'Close', { duration: 5000 });
            } else if (err.status === 404) {
              this.snackBar.open('Procedure not found.', 'Close', { duration: 3000 });
            } else {
              this.snackBar.open('Error deleting procedure.', 'Close', { duration: 3000 });
            }
          }
        });
      }
    });
  }


}

