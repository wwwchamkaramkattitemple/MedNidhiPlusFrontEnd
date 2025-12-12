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
    private snackBar: MatSnackBar
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
          phone: '(555) 123-4567'
        },
        subTotal: 225,
        taxAmount: 15.75,
        totalAmount: 240.75,
        paidAmount: 0
      };

      // Set default amount to remaining balance
      this.paymentForm?.patchValue({
        amount: this.calculateRemainingBalance()
      });

      this.isLoading = false;
    }, 1000);
  }

  calculateRemainingBalance(): number {
    return this.invoice?.totalAmount - (this.invoice?.paidAmount || 0);
  }

  onSubmit(): void {
    if (this.paymentForm?.invalid) {
      return;
    }

    const paymentData = {
      ...this.paymentForm?.value,
      invoiceId: this.invoiceId
    };

    // Validate payment amount doesn't exceed remaining balance
    const remainingBalance = this.calculateRemainingBalance();
    if (paymentData.amount > remainingBalance) {
      this.snackBar.open('Payment amount cannot exceed the remaining balance', 'Close', {
        duration: 3000
      });
      return;
    }

    // Simulate API call to save payment
    setTimeout(() => {
      this.snackBar.open('Payment recorded successfully', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/billing/detail', this.invoiceId]);
    }, 1000);
  }

  cancel(): void {
    this.router.navigate(['/billing/detail', this.invoiceId]);
  }

  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}