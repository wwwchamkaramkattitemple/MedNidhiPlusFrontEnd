import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../../services/patient.service';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import 'moment/locale/en-gb';


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
  selector: 'app-patient-form',
  standalone: true,
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
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

export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  isEditMode = false;
  patientId: number | null = null;
  isLoading = false;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.patientId = +id;
        this.isEditMode = true;
        this.loadPatientData(this.patientId);
      }
    });
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      gender: ['', Validators.required],
      phoneNumber: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      dateOfBirth: [null, Validators.required],
      address: ['', Validators.maxLength(200)],
      city: ['', Validators.maxLength(100)],
      state: ['', Validators.maxLength(50)],
      zipCode: ['', Validators.maxLength(20)],
      medicalHistory: ['', Validators.maxLength(500)],
      insuranceProvider: ['', Validators.maxLength(200)],
      insurancePolicyNumber: ['', Validators.maxLength(50)]
    });
  }

  loadPatientData(id: number): void {
    this.isLoading = true;
    setTimeout(() => {
      this.patientService.getPatientById(id).subscribe(
        (data) => {
          this.patientForm.patchValue(data);
        },
        (error) => {
          console.error('Error fetching patient:', error);
          this.snackBar.open('Error loading patient data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/patients']);
        }
      );
      this.isLoading = false;
    }, 1000);

  }

  onSubmit(): void {
    if (this.patientForm.invalid) return;

    this.isLoading = true;

    const patientData = {
      FirstName: this.patientForm.value.firstName,
      LastName: this.patientForm.value.lastName,
      Gender: this.patientForm.value.gender,
      PhoneNumber: this.patientForm.value.phoneNumber || null,
      Email: this.patientForm.value.email || null,
      DateOfBirth: this.patientForm.value.dateOfBirth
        ? new Date(
          Date.UTC(
            new Date(this.patientForm.value.dateOfBirth).getFullYear(),
            new Date(this.patientForm.value.dateOfBirth).getMonth(),
            new Date(this.patientForm.value.dateOfBirth).getDate()
          )
        ).toISOString()
        : null,
      Address: this.patientForm.value.address || null,
      City: this.patientForm.value.city || null,
      State: this.patientForm.value.state || null,
      ZipCode: this.patientForm.value.zipCode || null,
      MedicalHistory: this.patientForm.value.medicalHistory || null,
      InsuranceProvider: this.patientForm.value.insuranceProvider || null,
      InsurancePolicyNumber: this.patientForm.value.insurancePolicyNumber || null,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    if (this.isEditMode && this.patientId) {
      this.patientService.updatePatient(this.patientId, patientData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Patient updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/patients']);
        },
        error: (err) => {
          console.error('Error updating patient:', err);
          this.snackBar.open('Error updating patient', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.patientService.createPatient(patientData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Patient created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/patients']);
        },
        error: (err) => {
          console.error('Error creating patient:', err);
          this.snackBar.open('Error creating patient', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }


  cancel(): void {
    this.router.navigate(['/patients']);
  }
}