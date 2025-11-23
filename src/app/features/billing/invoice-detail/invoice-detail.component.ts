import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-invoice-detail',
  standalone:true,
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
  imports: [MaterialModule,CommonModule,RouterModule]
})
export class InvoiceDetailComponent implements OnInit {
  invoiceId?: string | null;
  invoice: any;
  isLoading = true;
  displayedColumns: string[] = ['description', 'quantity', 'unitPrice', 'discount', 'taxRate', 'taxAmount', 'totalAmount'];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    this.loadInvoiceData();
  }

  loadInvoiceData(): void {
    // Simulate API call to get invoice data
    setTimeout(() => {
      this.invoice = {
        id: this.invoiceId,
        invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        invoiceDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        status: 'Pending',
        patientId: '12345',
        patient: {
          id: '12345',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '(555) 123-4567',
          address: '123 Main St, Anytown, CA 12345'
        },
        items: [
          {
            id: '1',
            description: 'Initial Consultation',
            quantity: 1,
            unitPrice: 150,
            discount: 0,
            taxRate: 7,
            taxAmount: 10.5,
            totalAmount: 160.5
          },
          {
            id: '2',
            description: 'Blood Test',
            quantity: 1,
            unitPrice: 75,
            discount: 0,
            taxRate: 7,
            taxAmount: 5.25,
            totalAmount: 80.25
          }
        ],
        subTotal: 225,
        taxAmount: 15.75,
        totalAmount: 240.75,
        paidAmount: 0,
        paymentDate: null,
        paymentMethod: null,
        notes: 'Please pay within 30 days.',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
        updatedAt: new Date()
      };
      this.isLoading = false;
    }, 1000);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Paid':
        return 'green';
      case 'Overdue':
        return 'red';
      case 'Pending':
        return 'orange';
      case 'Cancelled':
        return 'gray';
      default:
        return 'black';
    }
  }

  calculateBalance(): number {
    return this.invoice.totalAmount - this.invoice.paidAmount;
  }

  recordPayment(): void {
    this.router.navigate(['/billing/payment', this.invoiceId]);
  }

  editInvoice(): void {
    this.router.navigate(['/billing/edit', this.invoiceId]);
  }

  deleteInvoice(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { 
        title: 'Confirm Delete', 
        message: 'Are you sure you want to delete this invoice? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Simulate API call to delete invoice
        setTimeout(() => {
          this.snackBar.open('Invoice deleted successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/billing']);
        }, 1000);
      }
    });
  }

  printInvoice(): void {
    // Implement print functionality
    window.print();
  }

  sendInvoice(): void {
    // Simulate sending invoice by email
    this.snackBar.open(`Invoice sent to ${this.invoice.patient.email}`, 'Close', {
      duration: 3000
    });
  }

  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}