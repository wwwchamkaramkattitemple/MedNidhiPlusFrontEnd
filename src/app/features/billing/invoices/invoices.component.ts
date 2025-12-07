import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from "../../../material.module";
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvoiceService } from '../../../../services/invoice.service';

@Component({
  selector: 'app-invoices',
  standalone:true,
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  imports: [MaterialModule,ReactiveFormsModule,RouterModule,FormsModule,CommonModule]
})
export class InvoicesComponent implements OnInit {
  displayedColumns: string[] = ['invoiceNumber', 'date', 'patientName', 'amount', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = true;
  filterStatus: string = '';
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog,private snackBar:MatSnackBar,private invoiceService:InvoiceService) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadInvoices() {
  this.isLoading = true;

  this.invoiceService.getInvoices().subscribe({
    next: (response: any[]) => {
      // Transform backend invoice into UI-friendly list format
      const invoices = response.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: new Date(inv.invoiceDate),
        dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
        patientId: inv.patientId,
        patientName: inv.patient?.firstName + ' ' + inv.patient?.lastName,
        amount: inv.totalAmount,
        status: inv.status,
        paymentDate: inv.paymentDate ? new Date(inv.paymentDate) : null
      }));

      this.dataSource.data = invoices;
      this.isLoading = false;
    },
    error: err => {
      console.error('Failed to load invoices', err);
      this.isLoading = false;
      this.snackBar.open('Error loading invoices', 'Close', { duration: 3000 });
    }
  });
}


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterInvoices() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      // Custom filter function
      const searchStr = filter.toLowerCase();
      const statusMatch = !this.filterStatus || data.status === this.filterStatus;
      
      // Date range filter
      let dateMatch = true;
      if (this.filterDateFrom) {
        dateMatch = dateMatch && new Date(data.date) >= new Date(this.filterDateFrom);
      }
      if (this.filterDateTo) {
        dateMatch = dateMatch && new Date(data.date) <= new Date(this.filterDateTo);
      }
      
      return statusMatch && dateMatch && 
        (data.invoiceNumber.toLowerCase().includes(searchStr) ||
         data.patientName.toLowerCase().includes(searchStr) ||
         data.status.toLowerCase().includes(searchStr));
    };
    
    // Trigger filter
    this.dataSource.filter = this.dataSource.filter || ' ';
  }

  resetFilters() {
    this.filterStatus = '';
    this.filterDateFrom = null;
    this.filterDateTo = null;
    this.dataSource.filter = '';
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // getStatusColor(status: string): string {
  //   switch (status.toLowerCase()) {
  //     case 'paid':
  //       return 'primary';
  //     case 'pending':
  //       return 'accent';
  //     case 'overdue':
  //       return 'warn';
  //     case 'cancelled':
  //       return '';
  //     default:
  //       return '';
  //   }
  // }

  getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'scheduled': return '#1968adff';
    case 'completed': return '#118817ff';
    case 'cancelled': return '#e3120eff';
    case 'paid': return '#081566ff';
    case 'pending': return '#dc18b1ff';
    case 'overdue': return '#d78808ff';
    default: return '#333';
  }
}


  deleteInvoice(id: number) {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: { 
      title: 'Confirm Delete', 
      message: 'Are you sure you want to delete this invoice? This action cannot be undone.'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {

      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          // Remove from table UI
          this.dataSource.data = this.dataSource.data.filter(item => item.id !== id);

          this.snackBar.open('Invoice deleted successfully!', 'Close', { duration: 3000 });
        },
        error: err => {
          console.error('Delete failed', err);
          this.snackBar.open('Error deleting invoice', 'Close', { duration: 3000 });
        }
      });

    }
  });
}


  recordPayment(id: number) {
    // Navigate to payment form
    console.log(`Recording payment for invoice ID: ${id}`);
  }
}