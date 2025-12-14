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
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import 'moment/locale/en-gb';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-invoices',
  standalone: true,
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  imports: [MaterialModule, ReactiveFormsModule, RouterModule, FormsModule, CommonModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class InvoicesComponent implements OnInit {
  displayedColumns: string[] = ['invoiceNumber', 'date', 'patientName', 'amount', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = true;
  searchText: string = '';
  filterStatus: string = '';
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar, private invoiceService: InvoiceService) { }

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

        // 🔥 FIX: Sort by date DESCENDING
        invoices.sort((a, b) => b.date.getTime() - a.date.getTime());

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
    this.searchText = (event.target as HTMLInputElement).value?.trim().toLowerCase() || '';
    this.filterInvoices(); // re-evaluate predicate (will also trigger table refresh)
  }

  filterInvoices() {
  this.dataSource.filterPredicate = (data: any, _filter: string) => {
    // Use component state (this.searchText) for the textual search
    const searchStr = (this.searchText || '').toLowerCase();

    // --- STATUS FILTER ---
    const statusMatch = !this.filterStatus || !this.filterStatus.length || data.status === this.filterStatus;

    // --- DATE FILTER ---
    // Normalize invoice date safely without mutating original data
    const invoiceDate = data.date ? new Date(data.date) : null;
    const invDate = invoiceDate ? new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), invoiceDate.getDate()) : null;

    let dateMatch = true;
    if (this.filterDateFrom && invDate) {
      const f = new Date(this.filterDateFrom);
      const from = new Date(f.getFullYear(), f.getMonth(), f.getDate());
      dateMatch = dateMatch && (invDate.getTime() >= from.getTime());
    }
    if (this.filterDateTo && invDate) {
      const t = new Date(this.filterDateTo);
      const to = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 999);
      dateMatch = dateMatch && (invDate.getTime() <= to.getTime());
    }

    // --- SEARCH MATCH ---
    const invoiceNumber = (data.invoiceNumber || '').toString().toLowerCase();
    const patientName = (data.patientName || '').toString().toLowerCase();
    const status = (data.status || '').toString().toLowerCase();

    const textMatch = !searchStr ||
      invoiceNumber.includes(searchStr) ||
      patientName.includes(searchStr) ||
      status.includes(searchStr);

    return statusMatch && dateMatch && textMatch;
  };

  this.dataSource.filter = (Math.random()).toString();
  if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
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