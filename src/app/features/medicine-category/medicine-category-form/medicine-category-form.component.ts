import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { MedicineCategoryService } from '../../../../services/medicine-category.service';

@Component({
  selector: 'app-medicine-category-form',
  templateUrl: './medicine-category-form.component.html',
  styleUrl: './medicine-category-form.component.scss',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
})

export class MedicineCategoryFormComponent implements OnInit {
  medicineCategoryForm!: FormGroup;
  isEditMode = false;
  medicineCategoryId: number | null = null;
  isLoading = false;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private medicineCategoryService: MedicineCategoryService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.medicineCategoryId = +id;
        this.isEditMode = true;
        this.loadmedicineCategoryData(this.medicineCategoryId);
      }
    });
  }

  initForm(): void {
    this.medicineCategoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      isActive: [true]
    });
  }

  loadmedicineCategoryData(id: number): void {
    this.isLoading = true;
    setTimeout(() => {
      this.medicineCategoryService.getMedicineCategoryById(id).subscribe(
        (data) => {
          this.medicineCategoryForm.patchValue(data);
        },
        (error) => {
          console.error('Error fetching medicineCategory:', error);
          this.snackBar.open('Error loading medicineCategory data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/medicineCategorys']);
        }
      );
      this.isLoading = false;
    }, 1000);

  }

onSubmit(): void {
  if (this.medicineCategoryForm.invalid) return;

  this.isLoading = true;

  const medicineCategoryData = {
  id: this.medicineCategoryId ?? 0, 
  categoryName: this.medicineCategoryForm.value.categoryName,
  description: this.medicineCategoryForm.value.description,
  isActive: this.medicineCategoryForm.value.isActive
};


  if (this.isEditMode && this.medicineCategoryId) {
    this.medicineCategoryService.updateMedicineCategory(this.medicineCategoryId, medicineCategoryData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Medicine Category updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/medicine-category']);
      },
      error: (err) => {
        console.error('Error updating medicine Category:', err);
        console.log("Validation Error",err.error?.errors);
        this.snackBar.open('Error updating medicine Category', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  } else {
    this.medicineCategoryService.addMedicineCategory(medicineCategoryData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Medicine Category created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/medicine-category']);
      },
      error: (err) => {
        console.error('Error creating medicine Category:', err);
        console.log("Validation Error",err.error?.errors);
        this.snackBar.open('Error creating medicine Category', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}


  cancel(): void {
    this.router.navigate(['/medicine-category']);
  }
}
