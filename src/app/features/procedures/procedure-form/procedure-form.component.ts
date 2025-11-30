import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from "../../../material.module";
import { CommonModule } from '@angular/common';
import { ProcedureService } from '../../../../services/procedure.service';

@Component({
   selector: 'app-procedure-form',
  templateUrl: './procedure-form.component.html',
  styleUrl: './procedure-form.component.scss',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
})

export class ProcedureFormComponent implements OnInit {
  procedureForm!: FormGroup;
  isEditMode = false;
  procedureId: number | null = null;
  isLoading = false;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private procedureService: ProcedureService
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.procedureId = +id;
        this.isEditMode = true;
        this.loadprocedureData(this.procedureId);
      }
    });
  }

  initForm(): void {
    this.procedureForm = this.fb.group({
      procedureName: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      fee: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      isActive: [true]
    });
  }

  loadprocedureData(id: number): void {
    this.isLoading = true;
    setTimeout(() => {
      this.procedureService.getById(id).subscribe(
        (data) => {
          this.procedureForm.patchValue(data);
        },
        (error) => {
          console.error('Error fetching procedure:', error);
          this.snackBar.open('Error loading procedure data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/procedures']);
        }
      );
      this.isLoading = false;
    }, 1000);

  }

onSubmit(): void {
  if (this.procedureForm.invalid) return;

  this.isLoading = true;

  const procedureData = {
  id: this.procedureId, 
  procedureName: this.procedureForm.value.procedureName,
  description: this.procedureForm.value.description,
  fee: Number(this.procedureForm.value.fee),
  taxRate: Number(this.procedureForm.value.taxRate),
  isActive: this.procedureForm.value.isActive
};


  if (this.isEditMode && this.procedureId) {
    this.procedureService.updateProcedure(this.procedureId, procedureData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Procedure updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/procedures']);
      },
      error: (err) => {
        console.error('Error updating procedure:', err);
        this.snackBar.open('Error updating procedure', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  } else {
    this.procedureService.createProcedure(procedureData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Procedure created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/procedures']);
      },
      error: (err) => {
        console.error('Error creating procedure:', err);
        this.snackBar.open('Error creating procedure', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}


  cancel(): void {
    this.router.navigate(['/procedures']);
  }
}
