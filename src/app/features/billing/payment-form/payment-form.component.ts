import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCard } from "@angular/material/card";
import { MaterialModule } from "../../../material.module";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import 'moment/locale/en-gb';
import { InvoiceService } from '../../../../services/invoice.service';

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
  selector: 'app-payment-form',
  standalone: true,
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
  imports: [MatProgressSpinnerModule, MatCard, MaterialModule, ReactiveFormsModule, CommonModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class PaymentFormComponent implements OnInit {
  invoiceId?: string | null;
  invoice: any;
  paymentForm!: FormGroup;
  isLoading = true;
  paymentMethods: string[] = ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer', 'Insurance', 'Other'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    this.initForm();
    this.loadInvoiceData();
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentDate: [new Date(), Validators.required],
      paymentMethod: ['', Validators.required],
      referenceNumber: [''],
      notes: ['']
    });
  }

  loadInvoiceData(): void {
    if (!this.invoiceId) return;

    this.isLoading = true;

    this.invoiceService.getInvoiceById(+this.invoiceId).subscribe({
      next: (res) => {
        this.invoice = res;

        this.paymentForm.patchValue({
          amount: this.calculateRemainingBalance(),
          paymentDate: new Date()
        });

        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load invoice', 'Close', { duration: 3000 });
        this.router.navigate(['/billing']);
      }
    });
  }


  calculateRemainingBalance(): number {
    return this.invoice?.totalAmount - (this.invoice?.paidAmount || 0);
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || !this.invoiceId) return;

    const remaining = this.calculateRemainingBalance();
    const amount = this.paymentForm.value.amount;

    if (amount > remaining) {
      this.snackBar.open('Payment amount exceeds balance', 'Close', { duration: 3000 });
      return;
    }

    this.invoiceService.recordPayment(+this.invoiceId, this.paymentForm.value)
      .subscribe({
        next: () => {
          this.snackBar.open('Payment recorded successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/billing', this.invoiceId]);
        },
        error: err => {
          this.snackBar.open(err.error || 'Payment failed', 'Close', { duration: 3000 });
        }
      });
  }


  cancel(): void {
    this.router.navigate(['/billing/detail', this.invoiceId]);
  }

  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}