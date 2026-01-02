import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss']
})
export class SystemSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.handlePrintModeChanges();
    this.loadSettingsData();
  }


  initForm(): void {
    this.settingsForm = this.fb.group({
      // Clinic
      clinicName: ['', [Validators.required, Validators.maxLength(100)]],
      clinicAddress: [''],
      clinicPhone: [''],
      clinicEmail: ['', Validators.email],
      clinicGstNumber: [''],
      specialityName: [''],

      // Billing
      feePriority: ['Default', Validators.required],
      defaultRevisitDays: [15, [Validators.required, Validators.min(1)]],
      defaultFee: [200, [Validators.required, Validators.min(1)]],

      // Invoice Print
      defaultInvoicePrintMode: ['Normal', Validators.required],
      defaultInvoiceDesign: ['Classic', Validators.required],
      defaultReportDesign: ['Classic', Validators.required],

      // PDF Messages
      pdfHeaderMessage: [''],
      pdfFooterMessage: [''],
      pdfThankYouMessage: ['Thank you for choosing us']
    });
  }

  handlePrintModeChanges(): void {
    const printModeCtrl = this.settingsForm.get('defaultInvoicePrintMode');
    const designCtrl = this.settingsForm.get('defaultInvoiceDesign');

    printModeCtrl?.valueChanges.subscribe(mode => {
      if (mode === 'Thermal') {
        designCtrl?.disable({ emitEvent: false });
      } else {
        designCtrl?.enable({ emitEvent: false });
      }
    });
  }



  loadSettingsData(): void {
    this.isLoading = true;
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settingsForm.patchValue(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching settings:', error);
        this.snackBar.open('Error loading settings data', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) return;

    this.isLoading = true;

    const settingsData = this.settingsForm.value;
    this.settingsService.saveSettings(settingsData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('System settings saved successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/settings']);
      },
      error: (err) => {
        console.error('Error saving settings:', err);
        this.snackBar.open('Error saving settings', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/settings']);
  }
}
