import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PatientService } from '../../../../services/patient.service';
import { MedicineService } from '../../../../services/medicine.service';
import { ProcedureService } from '../../../../services/procedure.service';
import { InvoiceService } from '../../../../services/invoice.service';
import { AppointmentService } from '../../../../services/appointment.service';
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
  selector: 'app-invoice-form',
  standalone: true,
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
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

  // C2 labels
  billingItemTypes = [
    'Medicine',
    'Procedure',
    'Consultation (Appointment)',
    'Manual Entry'
  ];

  // lists loaded from backend
  medicineList: any[] = [];
  procedureList: any[] = [];

  invoiceStatuses = ['Pending', 'Paid', 'Overdue', 'Cancelled'];
  paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Insurance', 'Bank Transfer', 'Other'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private patientService: PatientService,
    private medicineService: MedicineService,
    private procedureService: ProcedureService,
    private invoiceService: InvoiceService,
    private appointmentService : AppointmentService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPatients();
    this.loadMedicines();
    this.loadProcedures();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.invoiceId = +id;
        this.loadInvoiceData(+id);
      } else {
        this.route.queryParamMap.subscribe(queryParams => {
          const patientId = queryParams.get('patientId');
          const appointmentId = queryParams.get('appointmentId');
          if (patientId) {
            this.invoiceForm.patchValue({ patientId: +patientId });
            this.onPatientChange(+patientId);
          }
          if (appointmentId) {
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
      taxAmount: [0, [Validators.required, Validators.min(0)]],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
      paymentDate: [null],
      paymentMethod: [''],
      invoiceItems: this.fb.array([])
    });

    // Ensure at least one row
    this.addInvoiceItem();
  }

  // API loaders
  loadMedicines(): void {
    this.medicineService.getMedicines().subscribe(res => {
      this.medicineList = res || [];
    }, err => console.error('Failed to load medicines', err));
  }

  loadProcedures(): void {
    this.procedureService.getAll().subscribe(res => {
      this.procedureList = res || [];
    }, err => console.error('Failed to load procedures', err));
  }

  loadPatients(): void {
    this.isLoading = true;
    this.patientService.getAllPatients().subscribe({
      next: patients => {
        this.patients = patients || [];
        this.filteredPatients = this.patients;
        this.isLoading = false;
      },
      error: err => { console.error('Failed to load patients', err); this.isLoading = false; }
    });
  }

  onPatientSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value?.toLowerCase() || '';
    this.filteredPatients = this.patients.filter(p =>
      `${p.firstName} ${p.lastName} ${p.phoneNumber}`.toLowerCase().includes(q)
    );
    if (this.filteredPatients.length === 0) this.invoiceForm.patchValue({ patientId: null });
  }

  onPatientSelected(patientId: number): void {
    this.invoiceForm.patchValue({ patientId });
  }

  getPatientNameById(id: number): string {
    const p = this.patients.find(x => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : '';
  }

  onPatientChange(patientId: number): void {
    this.loadPatientAppointments(patientId);
  }

  loadPatientAppointments(patientId: number): void {
  this.patientService.getAppointmentsByPatientId(patientId).subscribe({
    next: (res) => {
      this.appointments = res || [];
    },
    error: (err) => {
      console.error("Failed to load appointments", err);
      this.appointments = [];
    }
  });
}



  loadAppointmentDetails(appointmentId: number): void {
  this.isLoading = true;

  this.appointmentService.getAppointmentById(appointmentId).subscribe({
    next: (appointment: any) => {

      const description = `${appointment.appointmentTypeName || 'Consultation'} with ${appointment.doctorName} on ${new Date(appointment.appointmentDate).toLocaleDateString()}`;
      const fee = appointment.fee ?? 0;
      const tax = appointment.defaultTaxRate ?? 0;

      const itemData = {
        itemType: 'Consultation (Appointment)',
        selectedItem: {
          id: appointment.id,
          name: appointment.appointmentTypeName || 'Consultation',
          fee: fee,
          tax: tax
        },
        description: description,
        unitPrice: fee,
        quantity: 1,
        discount: 0,
        taxRate: tax,
        taxAmount: (fee * tax) / 100,
        totalAmount: fee + (fee * tax) / 100,
        appointmentId: appointment.id
      };

      // If first item is empty → replace it
      if (this.invoiceItems.length === 1 && !this.invoiceItems.at(0).get('description')?.value) {
        this.invoiceItems.at(0).patchValue(itemData);
      } else {
        this.addInvoiceItem(itemData);
      }

      this.calculateTotals();
      this.isLoading = false;
    },

    error: err => {
      console.error("Failed to load appointment", err);
      this.snackBar.open("Error loading appointment", "Close", { duration: 3000 });
      this.isLoading = false;
    }
  });
}


  // Load invoice for edit
  loadInvoiceData(id: number): void {
    this.isLoading = true;
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice: any) => {
        this.onPatientChange(invoice.patientId);

        const itemsArray = this.invoiceForm.get('invoiceItems') as FormArray;
        itemsArray.clear();

        (invoice.items || []).forEach((it: any) => {
          // detect type and prefill selectedItem so autocomplete has initial list
          let detectedType = 'Manual Entry';
          let selectedObj: any = null;

          if (it.appointment) {
            detectedType = 'Consultation (Appointment)';
            selectedObj = { id: it.appointment.id, name: it.description, fee: it.unitPrice, tax: it.taxRate };
          } else if (this.procedureList.some(p => p.procedureName === it.description)) {
            detectedType = 'Procedure';
            const proc = this.procedureList.find(p => p.procedureName === it.description);
            selectedObj = { id: proc.id, procedureName: proc.procedureName, fee: proc.fee, taxRate: proc.taxRate };
          } else if (this.medicineList.some(m => m.medicineName === it.description)) {
            detectedType = 'Medicine';
            const med = this.medicineList.find(m => m.medicineName === it.description);
            selectedObj = { id: med.id, medicineName: med.medicineName, price: med.price, taxRate: med.taxRate };
          }

          this.addInvoiceItem({
            id: it.id,
            itemType: detectedType,
            selectedItem: selectedObj,
            description: it.description,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            discount: it.discount,
            taxRate: it.taxRate,
            taxAmount: it.taxAmount,
            totalAmount: it.totalAmount,
            appointmentId: it.appointment?.id ?? null
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
        console.error('Failed to load invoice', err);
        this.snackBar.open('Error loading invoice', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  // Reactive array accessor
  get invoiceItems() {
    return this.invoiceForm.get('invoiceItems') as FormArray;
  }

  // Add single row. Each row holds its own filteredList control for per-row autocomplete list.
  addInvoiceItem(item: any = null): void {
    const itemForm = this.fb.group({
      id: [item?.id || 0],
      itemType: [item?.itemType || '', Validators.required],
      selectedItem: [item?.selectedItem || null],
      description: [item?.description || '', Validators.required],
      unitPrice: [item?.unitPrice || 0, Validators.required],
      quantity: [item?.quantity || 1, Validators.required],
      discount: [item?.discount || 0],
      taxRate: [item?.taxRate || 0],
      taxAmount: [item?.taxAmount || 0],
      totalAmount: [item?.totalAmount || 0],
      appointmentId: [item?.appointmentId || null],
      filteredList: this.fb.control<any[]>([]) // per-row autocomplete options
    });

    this.invoiceItems.push(itemForm);

    // if we loaded an item with itemType, prefill its filteredList
    if (item?.itemType) {
      const list = this.getFilteredData(item.itemType);
      itemForm.get('filteredList')?.setValue(list);
    }

    // attach listeners
    this.setupItemFiltering(itemForm);
  }

  removeInvoiceItem(index: number): void {
    this.invoiceItems.removeAt(index);
    this.calculateTotals();
  }



  setupItemFiltering(itemForm: FormGroup) {

  // When Billing Type changes → reset everything
  itemForm.get('itemType')?.valueChanges.subscribe(type => {
    const list = this.getFilteredData(type);
    itemForm.get('filteredList')?.setValue(list);

    itemForm.patchValue({
      selectedItem: null,
      description: '',
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0,
      appointmentId: null
    });

    this.calculateTotals();
  });

  // When user types/selects in autocomplete
  itemForm.get('selectedItem')?.valueChanges.subscribe(value => {

    // If value is a string => user is typing, do nothing.
    if (!value || typeof value !== 'object') return;

    const type = itemForm.get('itemType')?.value;

    let price = value.price ?? value.unitPrice ?? value.fee ?? 0;
    let tax = value.taxRate ?? value.tax ?? 0;

    const description =
      value.medicineName ||
      value.procedureName ||
      value.name ||
      value.description ||
      '';

    itemForm.patchValue({
      description,
      unitPrice: price,
      quantity: 1,
      taxRate: tax,
      taxAmount: (price * tax) / 100,
      totalAmount: price + (price * tax) / 100,
      appointmentId: type === 'Consultation (Appointment)' ? value.id : itemForm.get('appointmentId')?.value
    });

    this.calculateTotals();
  });

}


  // Called on input inside autocomplete input to update per-row filteredList
  searchBillingItems(event: any, index: number) {
    const q = (event.target.value || '').toLowerCase().trim();
    const row = this.invoiceItems.at(index);
    const type = row.get('itemType')?.value;

    const list = this.getFilteredData(type);

    const filtered = list.filter((item: any) => {
      const label = (item.medicineName || item.procedureName || item.name || item.description || "")
        .toString().toLowerCase();
      return label.includes(q);
    });

    row.get('filteredList')?.setValue(filtered);
  }

  // Called when user selects an option from the mat-autocomplete dropdown
  onBillingItemSelected(selectedItem: any, index: number) {
    const item = this.invoiceItems.at(index);

    // Selected item object is handled by valueChanges in setupItemFiltering,
    // but if you want immediate behaviour here too, do a quick patch:
    if (selectedItem && typeof selectedItem === 'object') {
      const price = selectedItem.price ?? selectedItem.unitPrice ?? selectedItem.fee ?? 0;
      const tax = selectedItem.taxRate ?? selectedItem.tax ?? 0;
      item.patchValue({
        description: selectedItem.medicineName || selectedItem.procedureName || selectedItem.name || selectedItem.description || '',
        unitPrice: price,
        quantity: 1,
        taxRate: tax,
        taxAmount: (price * tax) / 100,
        totalAmount: price + ((price * tax) / 100),
        appointmentId: selectedItem.id ?? item.get('appointmentId')?.value ?? null
      });
      this.calculateTotals();
    }
  }

  displayBillingItem(item: any): string {
    if (!item) return '';
    const name = item.medicineName || item.procedureName || item.name || item.description || 'Item';
    const price = item.price ?? item.unitPrice ?? item.fee ?? 0;
    return `${name} (₹${price})`;
  }





  loadItemOptions(index: number) {
  const row = this.invoiceItems.at(index);
  const type = row.get('itemType')?.value;

  const list = this.getFilteredData(type);

  // Safety fix for empty consultation list
  if (type === 'Consultation (Appointment)' && this.appointments.length === 0) {
    row.get('filteredList')?.setValue([]);
  } else {
    row.get('filteredList')?.setValue(list);
  }

  row.patchValue({
    selectedItem: null,
    description: '',
    unitPrice: 0,
    quantity: 1,
    discount: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 0,
    appointmentId: null
  });

  this.calculateTotals();
}




  onItemValueChange(index: number): void {
    const item = this.invoiceItems.at(index);
    const unitPrice = item.get('unitPrice')?.value || 0;
    const quantity = item.get('quantity')?.value || 0;
    const discount = item.get('discount')?.value || 0;
    const taxRate = item.get('taxRate')?.value || 0;

    const subtotal = (unitPrice * quantity) - discount;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    item.patchValue({ taxAmount, totalAmount }, { emitEvent: false });
    this.calculateTotals();
  }

  calculateTotals(): void {
    let subTotal = 0;
    let totalTax = 0;
    let total = 0;

    for (let i = 0; i < this.invoiceItems.length; i++) {
      const it = this.invoiceItems.at(i);
      const up = (it.get('unitPrice')?.value || 0) * (it.get('quantity')?.value || 0);
      const discount = it.get('discount')?.value || 0;
      const taxAmt = it.get('taxAmount')?.value || 0;
      const totalAmt = it.get('totalAmount')?.value || 0;

      subTotal += (up - discount);
      totalTax += taxAmt;
      total += totalAmt;
    }

    this.invoiceForm.patchValue({ subTotal, taxAmount: totalTax, totalAmount: total }, { emitEvent: false });
  }

  // Submit - create or update
  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.markFormGroupTouched(this.invoiceForm);
      return;
    }

    const fv = this.invoiceForm.value;

    const payload: any = {
      id: this.invoiceId ?? 0,
      patientId: fv.patientId,
      invoiceDate: fv.invoiceDate instanceof Date ? fv.invoiceDate.toISOString() : fv.invoiceDate,
      dueDate: fv.dueDate ? (fv.dueDate instanceof Date ? fv.dueDate.toISOString() : fv.dueDate) : null,
      status: fv.status,
      notes: fv.notes,
      paidAmount: fv.paidAmount,
      paymentMethod: fv.paymentMethod,
      paymentDate: fv.paymentDate ? (fv.paymentDate instanceof Date ? fv.paymentDate.toISOString() : fv.paymentDate) : null,
      items: fv.invoiceItems.map((it: any) => ({
        id: it.id ?? 0,
        description: it.description,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        discount: it.discount,
        taxRate: it.taxRate,
        appointmentId: it.itemType === 'Consultation (Appointment)' ? it.appointmentId : null
      }))
    };

    this.isLoading = true;
    const req = this.isEditMode ? this.invoiceService.updateInvoice(this.invoiceId!, payload) : this.invoiceService.createInvoice(payload);

    req.subscribe({
      next: () => {
        this.snackBar.open(`Invoice ${this.isEditMode ? 'updated' : 'created'} successfully!`, 'Close', { duration: 3000 });
        this.router.navigate(['/billing']);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Invoice save failed:', err);
        this.snackBar.open('Error saving invoice', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        if (control instanceof FormGroup) this.markFormGroupTouched(control);
        else if (control instanceof FormArray) {
          for (let i = 0; i < control.length; i++) this.markFormGroupTouched(control.at(i) as FormGroup);
        }
      }
    });
  }

 
  getFilteredData(type: string) {
  switch (type) {
    case 'Medicine': return [...this.medicineList];
    case 'Procedure': return [...this.procedureList];
    case 'Consultation (Appointment)': return [...this.appointments];
    default: return [];
  }
}


  cancel(): void {
    this.router.navigate(['/billing']);
  }
}
