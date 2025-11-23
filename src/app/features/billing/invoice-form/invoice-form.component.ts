import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-invoice-form',
  standalone:true,
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  imports: [MaterialModule,CommonModule,FormsModule,ReactiveFormsModule]
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm!: FormGroup;
  isEditMode = false;
  invoiceId: number | null = null;
  isLoading = false;
  patients: any[] = [];
  appointments: any[] = [];
  invoiceStatuses = [
    'Pending',
    'Paid',
    'Overdue',
    'Cancelled'
  ];
  paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Check',
    'Insurance',
    'Bank Transfer',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPatients();
    
    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.invoiceId = +id;
        this.loadInvoiceData(+id);
      } else {
        // Check if patientId is provided in query params (for creating from patient detail)
        this.route.queryParamMap.subscribe(queryParams => {
          const patientId = queryParams.get('patientId');
          const appointmentId = queryParams.get('appointmentId');
          
          if (patientId) {
            this.invoiceForm.patchValue({ patientId: +patientId });
            this.onPatientChange(+patientId);
          }
          
          if (appointmentId) {
            // Load appointment details and add as invoice item
            this.loadAppointmentDetails(+appointmentId);
          }
        });
      }
    });
  }

  initializeForm(): void {
    this.invoiceForm = this.fb.group({
      patientId: ['', Validators.required],
      invoiceDate: [new Date(), Validators.required],
      dueDate: [new Date(new Date().setDate(new Date().getDate() + 15)), Validators.required],
      status: ['Pending', Validators.required],
      notes: [''],
      subTotal: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      taxAmount: [0, [Validators.required, Validators.min(0)]],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
      paymentDate: [null],
      paymentMethod: [''],
      invoiceItems: this.fb.array([])
    });

    // Add at least one empty item
    this.addInvoiceItem();
  }

  loadPatients(): void {
    // Simulate API call
    this.isLoading = true;
    setTimeout(() => {
      // Mock data - replace with actual API call
      this.patients = [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' },
        { id: 3, firstName: 'Robert', lastName: 'Brown' },
        { id: 4, firstName: 'Emily', lastName: 'Davis' },
        { id: 5, firstName: 'Michael', lastName: 'Wilson' }
      ];
      this.isLoading = false;
    }, 500);
  }

  onPatientChange(patientId: number): void {
    // Load patient's appointments
    this.loadPatientAppointments(patientId);
  }

  loadPatientAppointments(patientId: number): void {
    // Simulate API call
    this.isLoading = true;
    setTimeout(() => {
      // Mock data - replace with actual API call
      this.appointments = [
        {
          id: 1,
          patientId: patientId,
          date: new Date('2023-06-15'),
          time: '09:00 AM',
          type: 'Check-up',
          doctor: 'Dr. Smith',
          fee: 150,
          isBilled: false
        },
        {
          id: 2,
          patientId: patientId,
          date: new Date('2023-06-20'),
          time: '10:30 AM',
          type: 'Consultation',
          doctor: 'Dr. Johnson',
          fee: 200,
          isBilled: false
        }
      ];
      this.isLoading = false;
    }, 500);
  }

  loadAppointmentDetails(appointmentId: number): void {
    // Simulate API call
    this.isLoading = true;
    setTimeout(() => {
      // Mock data - replace with actual API call
      const appointment = {
        id: appointmentId,
        patientId: 2,
        date: new Date('2023-06-20'),
        time: '10:30 AM',
        type: 'Consultation',
        doctor: 'Dr. Johnson',
        fee: 200,
        isBilled: false
      };

      // Add appointment as invoice item
      const items = this.invoiceForm.get('invoiceItems') as FormArray;
      if (items.length === 1 && !items.at(0).get('description')?.value) {
        // Replace the empty item
        items.at(0).patchValue({
          description: `${appointment.type} with ${appointment.doctor} on ${appointment.date.toLocaleDateString()}`,
          unitPrice: appointment.fee,
          quantity: 1,
          discount: 0,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: appointment.fee,
          appointmentId: appointment.id
        });
      } else {
        // Add as new item
        this.addInvoiceItem({
          description: `${appointment.type} with ${appointment.doctor} on ${appointment.date.toLocaleDateString()}`,
          unitPrice: appointment.fee,
          quantity: 1,
          discount: 0,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: appointment.fee,
          appointmentId: appointment.id
        });
      }

      this.calculateTotals();
      this.isLoading = false;
    }, 500);
  }

  loadInvoiceData(id: number): void {
    // Simulate API call
    this.isLoading = true;
    setTimeout(() => {
      // Mock data - replace with actual API call
      const invoice = {
        id: id,
        patientId: 2,
        invoiceNumber: 'INV-2023-002',
        invoiceDate: new Date('2023-06-12'),
        dueDate: new Date('2023-06-27'),
        status: 'Pending',
        notes: 'Payment due within 15 days',
        subTotal: 200.00,
        taxRate: 5,
        taxAmount: 10.00,
        totalAmount: 210.00,
        paidAmount: 0,
        paymentDate: null,
        paymentMethod: '',
        invoiceItems: [
          {
            id: 1,
            description: 'Consultation with Dr. Johnson on Jun 10, 2023',
            unitPrice: 200.00,
            quantity: 1,
            discount: 0,
            taxRate: 5,
            taxAmount: 10.00,
            totalAmount: 210.00,
            appointmentId: 2
          }
        ]
      };

      // Load patient appointments
      this.onPatientChange(invoice.patientId);

      // Clear existing items
      const itemsArray = this.invoiceForm.get('invoiceItems') as FormArray;
      while (itemsArray.length) {
        itemsArray.removeAt(0);
      }

      // Add invoice items
      invoice.invoiceItems.forEach(item => {
        this.addInvoiceItem(item);
      });

      // Set form values
      this.invoiceForm.patchValue({
        patientId: invoice.patientId,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        notes: invoice.notes,
        subTotal: invoice.subTotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        paymentDate: invoice.paymentDate,
        paymentMethod: invoice.paymentMethod
      });
      
      this.isLoading = false;
    }, 1000);
  }

  get invoiceItems() {
    return this.invoiceForm.get('invoiceItems') as FormArray;
  }

  addInvoiceItem(item: any = null): void {
    const itemForm = this.fb.group({
      description: [item?.description || '', Validators.required],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      discount: [item?.discount || 0, [Validators.required, Validators.min(0)]],
      taxRate: [item?.taxRate || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      taxAmount: [item?.taxAmount || 0, [Validators.required, Validators.min(0)]],
      totalAmount: [item?.totalAmount || 0, [Validators.required, Validators.min(0)]],
      appointmentId: [item?.appointmentId || null]
    });

    this.invoiceItems.push(itemForm);
  }

  removeInvoiceItem(index: number): void {
    this.invoiceItems.removeAt(index);
    this.calculateTotals();
  }

  onItemValueChange(index: number): void {
    const item = this.invoiceItems.at(index);
    const unitPrice = item.get('unitPrice')?.value || 0;
    const quantity = item.get('quantity')?.value || 0;
    const discount = item.get('discount')?.value || 0;
    const taxRate = item.get('taxRate')?.value || 0;

    // Calculate item total
    const subtotal = (unitPrice * quantity) - discount;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    item.patchValue({
      taxAmount: taxAmount,
      totalAmount: totalAmount
    }, { emitEvent: false });

    this.calculateTotals();
  }

  calculateTotals(): void {
    let subTotal = 0;
    let totalTax = 0;
    let total = 0;

    for (let i = 0; i < this.invoiceItems.length; i++) {
      const item = this.invoiceItems.at(i);
      subTotal += (item.get('unitPrice')?.value || 0) * (item.get('quantity')?.value || 0) - (item.get('discount')?.value || 0);
      totalTax += item.get('taxAmount')?.value || 0;
      total += item.get('totalAmount')?.value || 0;
    }

    // Update form values
    this.invoiceForm.patchValue({
      subTotal: subTotal,
      taxAmount: totalTax,
      totalAmount: total
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.markFormGroupTouched(this.invoiceForm);
      return;
    }

    const invoiceData = this.invoiceForm.value;
    
    // Simulate API call
    this.isLoading = true;
    setTimeout(() => {
      console.log('Saving invoice:', invoiceData);
      
      this.snackBar.open(
        `Invoice ${this.isEditMode ? 'updated' : 'created'} successfully!`,
        'Close',
        { duration: 3000 }
      );
      
      this.router.navigate(['/billing']);
      this.isLoading = false;
    }, 1000);
  }

  // Helper to mark all form controls as touched for validation
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        } else if (control instanceof FormArray) {
          for (let i = 0; i < control.length; i++) {
            this.markFormGroupTouched(control.at(i) as FormGroup);
          }
        }
      }
    });
  }

  getPatientFullName(patientId: number): string {
    const patient = this.patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  }

  addAppointmentToInvoice(appointmentId: number): void {
    this.loadAppointmentDetails(appointmentId);
  }

  cancel(): void {
    this.router.navigate(['/billing']);
  }
}