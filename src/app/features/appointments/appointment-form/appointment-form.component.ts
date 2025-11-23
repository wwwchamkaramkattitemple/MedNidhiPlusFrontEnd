import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { PatientService } from '../../../../services/patient.service';
import { DoctorService } from '../../../../services/doctor.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import 'moment/locale/en-gb';
import { SettingsService } from '../../../../services/settings.service';




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
  selector: 'app-appointment-form',
  standalone: true,
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
  imports: [MaterialModule, FormsModule, CommonModule, ReactiveFormsModule, NgxMatTimepickerModule, MatAutocompleteModule],
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
export class AppointmentFormComponent implements OnInit {
  appointmentForm!: FormGroup;
  isEditMode = false;
  appointmentId: number | null = null;
  isLoading = false;
  patients: any[] = [];
  filteredPatients: any[] = [];
  doctors: any[] = [];
  filteredDoctors: any[] = [];
  appointmentTypes: any[] = [];
  appointmentStatuses: any[] = [];
  selectedDoctor: any = null;
  systemSettings: any = null;



  // appointmentTypes = [
  //   'Check-up',
  //   'Consultation',
  //   'Follow-up',
  //   'Procedure',
  //   'Emergency',
  //   'Vaccination',
  //   'Physical Therapy',
  //   'Lab Work'
  // ];
  // appointmentStatuses = [
  //   'Scheduled',
  //   'Confirmed',
  //   'In Progress',
  //   'Completed',
  //   'Cancelled',
  //   'No Show'
  // ];



  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private settingsService: SettingsService
  ) { }



  ngOnInit(): void {
    this.initializeForm();
    this.loadPatients();
    this.loadDoctors();
    this.loadAppointmentTypes();
    this.loadAppointmentStatuses();
    this.loadDefaultFee();

    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.appointmentId = +id;
        this.loadAppointmentData(+id);
      } else {
        // Check if patientId is provided in query params (for creating from patient detail)
        this.route.queryParamMap.subscribe(queryParams => {
          const patientId = queryParams.get('patientId');
          if (patientId) {
            this.appointmentForm.patchValue({ patientId: +patientId });
          }
        });
      }
    });
  }

  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentDate: [new Date(), Validators.required],
      appointmentTime: ['', Validators.required],
      appointmentTypeId: [2, Validators.required],
      statusId: [1, Validators.required],
      fee: [0, [Validators.required, Validators.min(0)]], //fetch value from system settings
      notes: [''],
      isBilled: [false]
    });



  }

  loadDefaultFee(): void {
    // this.settingsService.getSettings().subscribe({
    //   next: (data) => {
    //     // Handle both array or single object responses
    //     const settings = Array.isArray(data) ? data[0] : data;

    //     if (settings && settings.defaultFee) {
    //       this.appointmentForm.patchValue({ fee: settings.defaultFee });
    //       //  console.log('System default fee applied:', settings.defaultFee);
    //     } else {
    //       // console.warn('No defaultFee found in system settings response:', settings);
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Error fetching system settings:', err);
    //     this.snackBar.open('Could not fetch default system fee', 'Close', { duration: 3000 });
    //   }
    // });
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.systemSettings = settings;
      },
      error: (err) => console.error('Failed to load system settings', err)
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
      this.appointmentForm.patchValue({ patientId: null });
    }
  }

  onPatientSelected(patientId: number): void {
    this.appointmentForm.patchValue({ patientId });
  }

  getPatientNameById(id: number): string {
    const patient = this.patients.find(p => p.id === id);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  }

  onDoctorSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value?.toLowerCase() || '';

    if (!input.trim()) {
      this.filteredDoctors = [...this.doctors];
      this.selectedDoctor = null;
      return;
    }

    this.filteredDoctors = this.doctors.filter(doctor => {
      const searchField = `dr. ${doctor.doctorName} ${doctor.departmentName ?? ''}`.toLowerCase();
      return searchField.includes(input);
    });
  }


  loadDoctors(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.doctorService.getAllDoctors().subscribe({
        next: (doctors) => {
          this.doctors = doctors;
          this.filteredDoctors = doctors;
        },
        error: (err) => console.error('Failed to load doctors', err)
      });

      this.isLoading = false;
    }, 500);
  }



  onDoctorSelected(doctorId: number): void {
    this.appointmentForm.patchValue({ doctorId });

    const selectedDoctor = this.doctors.find(d => d.id === doctorId);
    if (!selectedDoctor || !this.systemSettings) return;
    this.selectedDoctor = this.doctors.find(d => d.id === doctorId) || null;
    const priority = this.systemSettings.feePriority;

    let feeToSet = this.systemSettings.defaultFee;
    let revisitDaysToSet = this.systemSettings.defaultRevisitDays;

    if (priority === 'Doctor' && selectedDoctor.consultationFee) {
      feeToSet = selectedDoctor.consultationFee;
      revisitDaysToSet = selectedDoctor.revisitDays;
    } else if (priority === 'Department') {
      feeToSet = selectedDoctor.departmentDefaultConsultationFee ?? this.systemSettings.defaultFee;
      revisitDaysToSet = selectedDoctor.departmentDefaultRevisitDays ?? this.systemSettings.defaultRevisitDays;
    }

    this.appointmentForm.patchValue({
      fee: feeToSet,
      revisitDays: revisitDaysToSet
    });
  }



  getDoctorNameById(id: number): string {
    const doctor = this.doctors.find(d => d.id === id);
    return doctor ? doctor.doctorName : '';
  }



  loadAppointmentTypes(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.appointmentService.getAppointmentTypes().subscribe({
        next: (appointmentTypes) => {
          this.appointmentTypes = appointmentTypes;
        },
        error: (err) => console.error('Failed to load appointment types', err)
      });

      this.isLoading = false;
    }, 500);
  }

  loadAppointmentStatuses(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.appointmentService.getAppointmentStatuses().subscribe({
        next: (appointmentStatuses) => {
          this.appointmentStatuses = appointmentStatuses;
        },
        error: (err) => console.error('Failed to load appointment types', err)
      });

      this.isLoading = false;
    }, 500);
  }



  // loadAppointmentData(id: number): void {
  //   this.isLoading = true;
  //   setTimeout(() => {
  //     // Mock data - replace with actual API call
  //     const appointment = {
  //       id: id,
  //       patientId: 2,
  //       appointmentDate: new Date('2023-06-16'),
  //       appointmentTime: '10:30 AM',
  //       appointmentType: 2,
  //       doctorName: 'Dr. Johnson',
  //       status: 1,
  //       fee: 150,
  //       notes: 'Initial consultation for knee pain.',
  //       isBilled: false
  //     };

  //     // Format date for form
  //     this.appointmentForm.patchValue({
  //       ...appointment,
  //       appointmentDate: appointment.appointmentDate
  //     });

  //     this.isLoading = false;
  //   }, 1000);
  // }

  loadAppointmentData(id: number): void {
    this.isLoading = true;

    this.appointmentService.getAppointmentById(id).subscribe({
      next: (appointment) => {
        console.log(appointment);
        const formattedTime = this.convertBackendTimeToPicker(appointment.appointmentTime);

        this.appointmentForm.patchValue({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentDate: new Date(appointment.appointmentDate),
          appointmentTime: formattedTime,
          appointmentTypeId: appointment.appointmentType.id,
          statusId: appointment.status.id,
          fee: appointment.fee,
          notes: appointment.notes,
          isBilled: appointment.isBilled
        });

        // this.selectedDoctor = this.doctors.find(d => d.id === appointment.doctorId) || null;

        const checkDoctorsLoaded = setInterval(() => {
          if (this.doctors.length > 0) {
            this.selectedDoctor = this.doctors.find(d => d.id === appointment.doctorId) || null;
            clearInterval(checkDoctorsLoaded);
          }
        }, 100);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load appointment', err);
        this.isLoading = false;
      }
    });
  }

  convertBackendTimeToPicker(time: string): string {
    if (!time) return "";

    const [hh, mm] = time.split(":");
    let hour = Number(hh);
    const minute = mm;
    const suffix = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minute} ${suffix}`;
  }



  // onSubmit(): void {
  //   if (this.appointmentForm.invalid) {
  //     this.markFormGroupTouched(this.appointmentForm);
  //     return;
  //   }

  //   const formValue = this.appointmentForm.value;

  //   const appointmentData = {
  //     patientId: formValue.patientId,
  //     doctorId: formValue.doctorId,
  //     appointmentDate: new Date(formValue.appointmentDate).toISOString(),
  //     appointmentTime: this.formatTime(formValue.appointmentTime),
  //     appointmentTypeId: formValue.appointmentTypeId, // FIXED
  //     statusId: formValue.statusId, // FIXED
  //     notes: formValue.notes || "",
  //     fee: formValue.fee,
  //     isBilled: formValue.isBilled || false,
  //     isRevisit: formValue.isRevisit || false,
  //   };

  //   this.isLoading = true;
  //   this.appointmentService.createAppointment(appointmentData).subscribe({
  //     next: () => {
  //       this.isLoading = false;
  //       this.snackBar.open('Appointment created successfully!', 'Close', { duration: 3000 });
  //       this.router.navigate(['/appointments']);
  //     },
  //     error: (err) => {
  //       console.error('Save failed', err);
  //       this.snackBar.open('Error saving appointment', 'Close', { duration: 3000 });
  //       this.isLoading = false;
  //     }
  //   });
  // }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }

    const formValue = this.appointmentForm.value;

    const appointmentData = {
      patientId: formValue.patientId,
      doctorId: formValue.doctorId,
      departmentId: formValue.departmentId,
      appointmentDate: new Date(formValue.appointmentDate).toISOString(),
      appointmentTime: this.formatTime(formValue.appointmentTime),
      appointmentTypeId: formValue.appointmentTypeId,
      statusId: formValue.statusId,
      notes: formValue.notes || "",
      fee: formValue.fee,
      isBilled: formValue.isBilled || false,
      isRevisit: formValue.isRevisit || false,
    };

    this.isLoading = true;

    if (this.isEditMode && this.appointmentId) {
      
      this.appointmentService.updateAppointment(this.appointmentId, appointmentData).subscribe({
        next: () => {
          this.snackBar.open('Appointment updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/appointments']);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Update failed', err);
          this.snackBar.open('Error updating appointment', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });

    } else {
     
      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: () => {
          this.snackBar.open('Appointment created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/appointments']);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Save failed', err);
          this.snackBar.open('Error saving appointment', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }




  formatTime(time: string): string {
    const date = new Date(`1970-01-01T${time}`);
    if (!isNaN(date.getTime())) {
      return date.toTimeString().substring(0, 8); // "HH:MM:SS"
    }
    const parsed = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)?/i);
    if (!parsed) return "00:00:00";
    let [_, hour, min, ampm] = parsed;
    let h = parseInt(hour, 10);
    if (ampm?.toLowerCase() === "pm" && h < 12) h += 12;
    if (ampm?.toLowerCase() === "am" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${min}:00`;
  }




  // Helper to mark all form controls as touched for validation
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/appointments']);
  }



}