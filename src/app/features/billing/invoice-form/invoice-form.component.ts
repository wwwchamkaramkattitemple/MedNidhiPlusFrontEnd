import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../../../services/patient.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import 'moment/locale/en-gb';
import { MedicineService } from '../../../../services/medicine.service';
import { ProcedureService } from '../../../../services/procedure.service';
import { InvoiceService } from '../../../../services/invoice.service';



export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm!: FormGroup;
  isEditMode = false;
  invoiceId: number | null = null;
  isLoading = false;
  patients: any[] = [];
  filteredPatients: any[] = [];
  appointments: any[] = [];
  billingItemTypes = ['Medicine', 'Procedure'];
  filteredBillingItems: any[] = [];
  medicineList: any[] = [];
  procedureList: any[] = [];

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


  serviceList = [
    { id: 1, name: "Consultation", price: 200, tax: 0 },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private patientService: PatientService,
    private medicineService: MedicineService,
    private procedureService: ProcedureService,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPatients();
    this.loadMedicines();
    this.loadProcedures();

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




  loadItemOptions(index: number) {
    const itemForm = this.invoiceItems.at(index);

    const type = itemForm.get('itemType')?.value;

    if (type === 'Medicine') this.filteredBillingItems = [...this.medicineList];
    else if (type === 'Procedure') this.filteredBillingItems = [...this.procedureList];

    // Reset all dependent values
    itemForm.patchValue({
      selectedItem: null,
      description: '',
      unitPrice: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0
    });

    this.calculateTotals();
  }


  // displayBillingItem(item: any): string {
  //   return item ? `${item.medicineName || item.procedureName} (₹${item.unitPrice || item.fee})` : '';
  // }

  // displayBillingItem(item: any): string {
  //   if (!item) return '';

  //   const name =
  //     item.name ||
  //     item.procedureName ||
  //     item.medicineName ||
  //     item.description ||
  //     'Unknown';

  //   const price =
  //     item.price ||
  //     item.unitPrice ||
  //     item.fee ||
  //     0;

  //   return `${name} (₹${price})`;
  // }


  displayBillingItem(item: any): string {
  if (!item) return "";

  const name =
    item.medicineName ||
    item.procedureName ||
    item.name ||
    item.description ||
    "Item";

  const price = item.unitPrice ?? item.fee ?? item.price ?? 0;

  return `${name} (₹${price})`;
}



  //   displayBillingItem(item: any): string {
  //   return item ? `${item.name} (₹${item.price ?? item.fee ?? 0})` : '';
  // }


  // searchBillingItems(event: any, index: number) {
  //   const input = event.target.value.toLowerCase();
  //   const type = this.invoiceItems.at(index).get('itemType')?.value;

  //   let list = type === 'Medicine'
  //     ? this.medicineList
  //     : type === 'Procedure'
  //       ? this.procedureList
  //       : this.serviceList;

  //   this.filteredBillingItems = list.filter(x =>
  //     x.name.toLowerCase().includes(input)
  //   );
  // }

  searchBillingItems(event: any, index: number) {
    const input = event.target.value.toLowerCase();
    const type = this.invoiceItems.at(index).get('itemType')?.value;

    let list = [];

    if (type === 'Medicine') {
      list = this.medicineList;
      this.filteredBillingItems = list.filter(x =>
        x.medicineName.toLowerCase().includes(input)
      );
    }
    else if (type === 'Procedure') {
      list = this.procedureList;
      this.filteredBillingItems = list.filter(x =>
        x.procedureName.toLowerCase().includes(input)
      );
    }
  }




  onBillingItemSelected(selectedItem: any, index: number) {
    const item = this.invoiceItems.at(index);

    const price = selectedItem.unitPrice || selectedItem.fee;
    const tax = selectedItem.taxRate;

    item.patchValue({
      description: selectedItem.medicineName || selectedItem.procedureName,
      unitPrice: price,
      quantity: 1,
      taxRate: tax,
      taxAmount: (price * tax) / 100,
      totalAmount: price + ((price * tax) / 100)
    });

    this.calculateTotals();
  }


  loadMedicines(): void {
    this.medicineService.getMedicines().subscribe(res => {
      this.medicineList = res;
    });
  }

  loadProcedures(): void {
    this.procedureService.getAll().subscribe(res => {
      this.procedureList = res;
    });
  }



  loadPatients(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.patientService.getAllPatients().subscribe({
        next: (patients) => {
          this.patients = patients;
          this.filteredPatients = patients;
        },
        error: (err) => console.error('Failed to load patients', err)
      });

      this.isLoading = false;
    }, 500);
  }

  onPatientSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value?.toLowerCase() || '';
    this.filteredPatients = this.patients.filter(patient =>
      `${patient.firstName} ${patient.lastName} ${patient.phoneNumber}`.toLowerCase().includes(input)
    );

    // Optional: clear stale selection if no matches
    if (this.filteredPatients.length === 0) {
      this.invoiceForm.patchValue({ patientId: null });
    }
  }

  onPatientSelected(patientId: number): void {
    this.invoiceForm.patchValue({ patientId });
  }

  getPatientNameById(id: number): string {
    const patient = this.patients.find(p => p.id === id);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
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

  // loadInvoiceData(id: number): void {
  //   // Simulate API call
  //   this.isLoading = true;
  //   setTimeout(() => {
  //     // Mock data - replace with actual API call
  //     const invoice = {
  //       id: id,
  //       patientId: 2,
  //       invoiceNumber: 'INV-2023-002',
  //       invoiceDate: new Date('2023-06-12'),
  //       dueDate: new Date('2023-06-27'),
  //       status: 'Pending',
  //       notes: 'Payment due within 15 days',
  //       subTotal: 200.00,
  //       taxRate: 5,
  //       taxAmount: 10.00,
  //       totalAmount: 210.00,
  //       paidAmount: 0,
  //       paymentDate: null,
  //       paymentMethod: '',
  //       invoiceItems: [
  //         {
  //           id: 1,
  //           description: 'Consultation with Dr. Johnson on Jun 10, 2023',
  //           unitPrice: 200.00,
  //           quantity: 1,
  //           discount: 0,
  //           taxRate: 5,
  //           taxAmount: 10.00,
  //           totalAmount: 210.00,
  //           appointmentId: 2
  //         }
  //       ]
  //     };

  //     // Load patient appointments
  //     this.onPatientChange(invoice.patientId);

  //     // Clear existing items
  //     const itemsArray = this.invoiceForm.get('invoiceItems') as FormArray;
  //     while (itemsArray.length) {
  //       itemsArray.removeAt(0);
  //     }

  //     // Add invoice items
  //     invoice.invoiceItems.forEach(item => {
  //       this.addInvoiceItem(item);
  //     });

  //     // Set form values
  //     this.invoiceForm.patchValue({
  //       patientId: invoice.patientId,
  //       invoiceDate: invoice.invoiceDate,
  //       dueDate: invoice.dueDate,
  //       status: invoice.status,
  //       notes: invoice.notes,
  //       subTotal: invoice.subTotal,
  //       taxRate: invoice.taxRate,
  //       taxAmount: invoice.taxAmount,
  //       totalAmount: invoice.totalAmount,
  //       paidAmount: invoice.paidAmount,
  //       paymentDate: invoice.paymentDate,
  //       paymentMethod: invoice.paymentMethod
  //     });

  //     this.isLoading = false;
  //   }, 1000);
  // }


  loadInvoiceData(id: number): void {
    this.isLoading = true;

    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice: any) => {

        // load patient appointments if required
        this.onPatientChange(invoice.patientId);

        const itemsArray = this.invoiceForm.get('invoiceItems') as FormArray;
        itemsArray.clear();

        invoice.items?.forEach((item: any) => {

          let detectedType = 'Manual';
          let selectedItemObj = null;

          // Detect type & retrieve matching object
          if (item.appointment != null) {
            detectedType = 'Consultation';
            selectedItemObj = {
              id: item.appointment?.id,
              name: "Consultation",       // or item.description
              fee: item.unitPrice,
              tax: item.taxRate
            };
          }
          else if (this.procedureList?.some(p => p.procedureName === item.description)) {
            detectedType = 'Procedure';
            const proc = this.procedureList.find(p => p.procedureName === item.description);
            selectedItemObj = {
              id: proc.id,
              name: proc.procedureName,
              fee: proc.fee,
              tax: proc.taxRate
            };
          }
          else if (this.medicineList?.some(m => m.medicineName === item.description)) {
            detectedType = 'Medicine';
            const med = this.medicineList.find(m => m.medicineName === item.description);
            selectedItemObj = {
              id: med.id,
              name: med.medicineName,
              price: med.price,
              tax: med.taxRate
            };
          }

          this.addInvoiceItem({
            id: item.id,
            itemType: detectedType,
            selectedItem: selectedItemObj,  // 👈 IMPORTANT
            description: item.description,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            discount: item.discount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            totalAmount: item.totalAmount,
            appointmentId: item.appointment?.id ?? null
          });
        });


        this.invoiceForm.patchValue({
          patientId: invoice.patientId,
          invoiceDate: new Date(invoice.invoiceDate),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
          status: invoice.status,
          notes: invoice.notes,
          subTotal: invoice.subTotal,
          taxAmount: invoice.taxAmount,
          totalAmount: invoice.totalAmount,
          paidAmount: invoice.paidAmount,
          paymentDate: invoice.paymentDate ? new Date(invoice.paymentDate) : null,
          paymentMethod: invoice.paymentMethod
        });

        this.isLoading = false;
      },
      error: err => {
        console.error("Failed to load invoice", err);
        this.snackBar.open("Error loading invoice", "Close", { duration: 3000 });
        this.isLoading = false;
      }
    });
  }




  get invoiceItems() {
    return this.invoiceForm.get('invoiceItems') as FormArray;
  }


  // addInvoiceItem(item: any = null): void {
  //   const itemForm = this.fb.group({
  //     id: [item?.id || 0],
  //     itemType: [item?.itemType || '', Validators.required],
  //     selectedItem: [item?.selectedItem || null, Validators.required],
  //     description: [item?.description || '', Validators.required],
  //     unitPrice: [item?.unitPrice || 0, Validators.required],
  //     quantity: [item?.quantity || 1, Validators.required],
  //     discount: [item?.discount || 0],
  //     taxRate: [item?.taxRate || 0],
  //     taxAmount: [item?.taxAmount || 0],
  //     totalAmount: [item?.totalAmount || 0],
  //     appointmentId: [item?.appointmentId || null]
  //   });

  //   this.invoiceItems.push(itemForm);
  // }


  addInvoiceItem(item: any = null): void {
    const itemForm = this.fb.group({
      id: [item?.id || 0],
      itemType: [item?.itemType || '', Validators.required],
      selectedItem: [null], // needed for autocomplete binding
      description: [item?.description || '', Validators.required],
      unitPrice: [item?.unitPrice || 0, Validators.required],
      quantity: [item?.quantity || 1, Validators.required],
      discount: [item?.discount || 0],
      taxRate: [item?.taxRate || 0],
      taxAmount: [item?.taxAmount || 0],
      totalAmount: [item?.totalAmount || 0],
      appointmentId: [item?.appointmentId || null]
    });

    this.invoiceItems.push(itemForm);

    this.setupItemFiltering(itemForm);  // 💡 FIX — attach filtering listener
  }



  setupItemFiltering(itemForm: FormGroup) {

    // Reset selected item when billing type changes
    itemForm.get('itemType')?.valueChanges.subscribe(type => {
      itemForm.get('selectedItem')?.reset();
      this.filteredBillingItems = []; // clear list on change
    });

    // Handle autocomplete filtering reset
    itemForm.get('selectedItem')?.valueChanges.subscribe(val => {
      const type = itemForm.get('itemType')?.value;

      if (!type) return;

      // FIX — refresh correct list
      this.filteredBillingItems = this.getFilteredData(type);
    });
  }


  getFilteredData(type: string) {
    if (type === 'Medicine') return [...this.medicineList];
    if (type === 'Procedure') return [...this.procedureList];
    return [];
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

    const formValue = this.invoiceForm.value;

    const payload = {
      id: this.invoiceId ?? 0, // required for update
      patientId: formValue.patientId,
      invoiceDate: formValue.invoiceDate.toISOString(),
      dueDate: formValue.dueDate.toISOString(),
      status: formValue.status,
      notes: formValue.notes,
      paidAmount: formValue.paidAmount,
      paymentMethod: formValue.paymentMethod,
      paymentDate: formValue.paymentDate ? formValue.paymentDate.toISOString() : null,

      // Child items
      items: formValue.invoiceItems.map((item: any) => ({
        id: item.id ?? 0,                           // ★ needed for update
        description: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discount: item.discount,
        taxRate: item.taxRate,
        appointmentId: item.appointmentId ?? null
      }))
    };

    this.isLoading = true;

    const request = this.isEditMode
      ? this.invoiceService.updateInvoice(this.invoiceId!, payload) // PUT call
      : this.invoiceService.createInvoice(payload);                // POST call

    request.subscribe({
      next: () => {
        this.snackBar.open(
          `Invoice ${this.isEditMode ? 'updated' : 'created'} successfully!`,
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/billing']);
      },
      error: (err) => {
        console.error('Invoice save failed:', err);
        this.snackBar.open('Error saving invoice', 'Close', { duration: 3000 });
      }
    });
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