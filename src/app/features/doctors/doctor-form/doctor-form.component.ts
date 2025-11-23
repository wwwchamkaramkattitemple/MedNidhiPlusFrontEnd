
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { DoctorService } from '../../../../services/doctor.service';
import { departmentService } from '../../../../services/department.service';


@Component({
  selector: 'app-doctor-form',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './doctor-form.component.html',
  styleUrl: './doctor-form.component.scss'
})


export class DoctorFormComponent implements OnInit {
  doctorForm!: FormGroup;
  isEditMode = false;
  doctorId: number | null = null;
  isLoading = false;
  maxDate = new Date();
  departments: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private doctorService: DoctorService,
    private departmentService: departmentService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.doctorId = +id;
        this.isEditMode = true;
        this.loadDoctorData(this.doctorId);
      }
    });
  }

  initForm(): void {
    this.doctorForm = this.fb.group({
      id: [0],
      doctorName: ['', Validators.required],
      departmentId: ['', Validators.required],
      qualification: [''],
      specialization: [''],
      consultationFee: [200, [Validators.min(0)]],
      revisitDays: [15, [Validators.min(0)]],
      mobileNumber: [''],
      email: ['', [Validators.email]],
      isActive: [true]
    });
  }

  loadDoctorData(id: number): void {
    this.isLoading = true;
    setTimeout(() => {
      this.doctorService.getdoctorById(id).subscribe(
        (data) => {
          this.doctorForm.patchValue(data);
        },
        (error) => {
          console.error('Error fetching doctor:', error);
          this.snackBar.open('Error loading doctor data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/doctors']);
        }
      );
      this.isLoading = false;
    }, 1000);

  }

 loadDepartments(): void {
  this.departmentService.getAlldepartments().subscribe({
    next: (data) => {
      this.departments = data.filter((dept: any) => dept.isActive === true);
    },
    error: (err) => console.error('Error loading departments:', err)
  });
}


 onSubmit(): void {
  if (this.doctorForm.invalid) return;

  this.isLoading = true;

  const doctorData = {
    doctorName: this.doctorForm.value.doctorName,
    departmentId: this.doctorForm.value.departmentId,
    qualification: this.doctorForm.value.qualification,
    specialization: this.doctorForm.value.specialization,
    consultationFee: this.doctorForm.value.consultationFee,
    revisitDays: this.doctorForm.value.revisitDays,
    mobileNumber: this.doctorForm.value.mobileNumber,
    email: this.doctorForm.value.email,
    isActive: this.doctorForm.value.isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  console.log(doctorData);

  if (this.isEditMode && this.doctorId) {
    this.doctorService.updateDoctor(this.doctorId, doctorData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Doctor updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/doctors']);
      },
      error: (err) => {
        console.error('Error updating doctor:', err);
        this.snackBar.open('Error updating doctor', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  } else {
    this.doctorService.createDoctor(doctorData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Doctor created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/doctors']);
      },
      error: (err) => {
        console.error('Error creating doctor:', err);
        this.snackBar.open('Error creating doctor', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}



  cancel(): void {
    this.router.navigate(['/doctors']);
  }
}
