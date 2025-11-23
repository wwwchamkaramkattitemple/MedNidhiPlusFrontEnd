import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { departmentService } from '../../../../services/department.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.scss',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
})

export class DepartmentFormComponent implements OnInit {
  departmentForm!: FormGroup;
  isEditMode = false;
  departmentId: number | null = null;
  isLoading = false;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private departmentService: departmentService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.departmentId = +id;
        this.isEditMode = true;
        this.loadDepartmentData(this.departmentId);
      }
    });
  }

  initForm(): void {
    this.departmentForm = this.fb.group({
      departmentName: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      defaultRevisitDays: [15, [Validators.required, Validators.min(1)]],
      defaultConsultationFee: [200, [Validators.required, Validators.min(2)]],
      isActive: [true]
    });
  }

  loadDepartmentData(id: number): void {
    this.isLoading = true;
    setTimeout(() => {
      this.departmentService.getdepartmentById(id).subscribe(
        (data) => {
          this.departmentForm.patchValue(data);
        },
        (error) => {
          console.error('Error fetching department:', error);
          this.snackBar.open('Error loading department data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/departments']);
        }
      );
      this.isLoading = false;
    }, 1000);

  }

  onSubmit(): void {
    if (this.departmentForm.invalid) return;

    this.isLoading = true;

    const departmentData = {
      departmentName: this.departmentForm.value.departmentName,
      description: this.departmentForm.value.description,
      defaultRevisitDays: this.departmentForm.value.defaultRevisitDays,
      defaultConsultationFee: this.departmentForm.value.defaultConsultationFee || null ,
      isActive:this.departmentForm.value.isActive,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    if (this.isEditMode && this.departmentId) {
      this.departmentService.updatedepartment(this.departmentId, departmentData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Department updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/departments']);
        },
        error: (err) => {
          console.error('Error updating department:', err);
          this.snackBar.open('Error updating department', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.departmentService.createdepartment(departmentData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Department created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/departments']);
        },
        error: (err) => {
          console.error('Error creating department:', err);
          this.snackBar.open('Error creating department', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }


  cancel(): void {
    this.router.navigate(['/departments']);
  }
}
