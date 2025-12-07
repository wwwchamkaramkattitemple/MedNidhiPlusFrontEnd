import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from '../../material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MedicineCategoryService } from '../../../services/medicine-category.service';


@Component({
  selector: 'app-medicine-category',
  templateUrl: './medicine-category.component.html',
  styleUrls: ['./medicine-category.component.scss'],
   standalone: true,
  imports: [MaterialModule, RouterModule, CommonModule],
})
export class MedicineCategoryComponent implements OnInit {

 displayedColumns = ['id', 'categoryName', 'description','isActive', 'actions'];

  dataSource = new MatTableDataSource<any>([]);
  isLoading = true;
  searchText = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private medicineCategoryService: MedicineCategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMedicineCategorys();
  }

  loadMedicineCategorys() {
    this.isLoading = true;
    
    this.medicineCategoryService.getMedicineCategorys().subscribe({
      next: (data) => {
        console.log(data);
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open("Failed to load medicines!", "Close", { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value || '';
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteMedicineCategory(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this medicine?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.medicineCategoryService.deleteMedicineCategory(id).subscribe({
          next: () => {
            this.snackBar.open('Deleted successfully!', 'Close', { duration: 3000 });
            this.dataSource.data = this.dataSource.data.filter((m: any) => m.id !== id);
          },
          error: () => {
            this.snackBar.open('Delete failed!', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
