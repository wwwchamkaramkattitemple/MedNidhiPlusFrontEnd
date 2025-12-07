import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { MedicineService } from '../../../../services/medicine.service';
import { MedicineCategoryService } from '../../../../services/medicine-category.service';


@Component({
  selector: 'app-medicine-form',
  templateUrl: './medicine-form.component.html',
  styleUrl: './medicine-form.component.scss',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
})

export class MedicineFormComponent implements OnInit {
  medicineForm!: FormGroup;
  isEditMode = false;
  medicineId: number | null = null;
  isLoading = false;
  maxDate = new Date();
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private medicineService: MedicineService,
    private medicineCategoryService: MedicineCategoryService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCategory();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.medicineId = +id;
        this.isEditMode = true;
        this.loadmedicineData(this.medicineId);
      }
    });
  }

  initForm(): void {
    this.medicineForm = this.fb.group({
      medicineName: ['', [Validators.required, Validators.maxLength(250)]],
      genericName: ['', [Validators.required, Validators.maxLength(200)]],
      categoryId: ['', Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      discount: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [10, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  loadmedicineData(id: number): void {
    this.isLoading = true;
    setTimeout(() => {
      this.medicineService.getMedicineById(id).subscribe(
        (data) => {
          this.medicineForm.patchValue(data);
        },
        (error) => {
          console.error('Error fetching medicine:', error);
          this.snackBar.open('Error loading medicine data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/medicines']);
        }
      );
      this.isLoading = false;
    }, 1000);

  }

  loadCategory(): void {
    this.medicineCategoryService.getMedicineCategorys().subscribe({
      next: (data) => {
        this.categories = data.filter((dept: any) => dept.isActive === true);
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }


  onSubmit(): void {
    if (this.medicineForm.invalid) return;

    this.isLoading = true;

    const medicineData = {
      id: this.medicineId ?? 0,
      medicineName: this.medicineForm.value.medicineName,
      genericName: this.medicineForm.value.genericName,
      categoryId: this.medicineForm.value.categoryId,
      unitPrice: Number(this.medicineForm.value.unitPrice),
      taxRate: Number(this.medicineForm.value.taxRate),
      discount: Number(this.medicineForm.value.discount),
      stockQuantity: Number(this.medicineForm.value.stockQuantity),
      reorderLevel: Number(this.medicineForm.value.reorderLevel),
      isActive: this.medicineForm.value.isActive
    };


    if (this.isEditMode && this.medicineId) {
      this.medicineService.updateMedicine(this.medicineId, medicineData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Medicine updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/medicines']);
        },
        error: (err) => {
          console.error('Error updating medicine:', err);
          console.log("Validation Error", err.error?.errors);
          this.snackBar.open('Error updating medicine', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.medicineService.addMedicine(medicineData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Medicine created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/medicines']);
        },
        error: (err) => {
          console.error('Error creating medicine:', err);
          console.log("Validation Error", err.error?.errors);
          this.snackBar.open('Error creating medicine', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }


  cancel(): void {
    this.router.navigate(['/medicines']);
  }
}
