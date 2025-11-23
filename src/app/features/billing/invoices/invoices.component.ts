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

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadInvoices() {
    // Simulate API call with delay
    this.isLoading = true;
    setTimeout(() => {
      // Mock data - replace with actual API call
      const invoices = [
        {
          id: 1,
          invoiceNumber: 'INV-2023-001',
          date: new Date('2023-06-10'),
          dueDate: new Date('2023-06-25'),
          patientId: 1,
          patientName: 'John Doe',
          amount: 150.00,
          status: 'Paid',
          paymentDate: new Date('2023-06-15')
        },
        {
          id: 2,
          invoiceNumber: 'INV-2023-002',
          date: new Date('2023-06-12'),
          dueDate: new Date('2023-06-27'),
          patientId: 2,
          patientName: 'Jane Smith',
          amount: 200.00,
          status: 'Pending',
          paymentDate: null
        },
        {
          id: 3,
          invoiceNumber: 'INV-2023-003',
          date: new Date('2023-06-14'),
          dueDate: new Date('2023-06-29'),
          patientId: 3,
          patientName: 'Robert Brown',
          amount: 75.50,
          status: 'Overdue',
          paymentDate: null
        },
        {
          id: 4,
          invoiceNumber: 'INV-2023-004',
          date: new Date('2023-06-15'),
          dueDate: new Date('2023-06-30'),
          patientId: 4,
          patientName: 'Emily Davis',
          amount: 320.00,
          status: 'Pending',
          paymentDate: null
        },
        {
          id: 5,
          invoiceNumber: 'INV-2023-005',
          date: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
          patientId: 5,
          patientName: 'Michael Wilson',
          amount: 450.75,
          status: 'Pending',
          paymentDate: null
        }
      ];
      
      this.dataSource.data = invoices;
      this.isLoading = false;
    }, 1000);
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
        // Simulate API call
        console.log(`Deleting invoice with ID: ${id}`);
        // Remove from data source
        this.dataSource.data = this.dataSource.data.filter(item => item.id !== id);
      }
    });
  }

  recordPayment(id: number) {
    // Navigate to payment form
    console.log(`Recording payment for invoice ID: ${id}`);
  }
}