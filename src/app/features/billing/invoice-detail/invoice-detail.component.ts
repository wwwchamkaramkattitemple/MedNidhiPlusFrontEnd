import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InvoiceService } from '../../../../services/invoice.service';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
  imports: [MaterialModule, CommonModule, RouterModule]
})
export class InvoiceDetailComponent implements OnInit {
  invoiceId!: number;

  invoice: any;
  isLoading = true;
  displayedColumns: string[] = ['description', 'quantity', 'unitPrice', 'discount', 'taxRate', 'taxAmount', 'totalAmount'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.invoiceId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadInvoiceData();
  }



  loadInvoiceData(): void {
    this.isLoading = true;

    this.invoiceService.getInvoiceDetail(this.invoiceId).subscribe({

      next: (res) => {
        this.invoice = {
          ...res,
          invoiceDate: new Date(res.invoiceDate),
          dueDate: res.dueDate ? new Date(res.dueDate) : null,
          paymentDate: res.paymentDate ? new Date(res.paymentDate) : null,
          createdAt: new Date(res.createdAt),
          updatedAt: res.updatedAt ? new Date(res.updatedAt) : null
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load invoice', err);
        this.snackBar.open('Error loading invoice', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/billing']);
      }
    });
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
    this.router.navigate(['/billing', this.invoiceId, 'payment']);
  }

  editInvoice(): void {
    this.router.navigate(['/billing', this.invoiceId, 'edit']);
  }

  deleteInvoice() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this invoice? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.invoiceService.deleteInvoice(this.invoiceId).subscribe({
          next: () => {
            this.snackBar.open('Invoice deleted successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/billing']);
          },
          error: err => {
            console.error('Delete failed', err);
            this.snackBar.open('Error deleting invoice', 'Close', { duration: 3000 });
          }
        });

      }
    });
  }

  printInvoice(): void {
    this.invoiceService.downloadInvoicePdf(this.invoiceId)
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);

          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          iframe.src = url;

          document.body.appendChild(iframe);

          iframe.onload = () => {
            setTimeout(() => {
              const win = iframe.contentWindow;
              if (!win) {
                alert('Print window blocked');
                return;
              }
              win.focus();
              win.print();

              URL.revokeObjectURL(url);
            }, 500);
          };
        },
        error: (err) => {
          console.error(err);
          alert('Unable to load invoice PDF');
        }
      });
  }




  // sendInvoice(): void {
  //   // Simulate sending invoice by email
  //   this.snackBar.open(`Invoice sent to ${this.invoice.patient.email}`, 'Close', {
  //     duration: 3000
  //   });
  // }

  sendInvoiceEmail() {
    this.invoiceService.emailInvoice(this.invoice.id).subscribe({
      next: () => {
        this.snackBar.open(
          'Invoice emailed successfully',
          'Close',
          { duration: 3000 }
        );
      },
      error: err => {
        console.error(err);
        this.snackBar.open(
          'Failed to send invoice email',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }



  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}