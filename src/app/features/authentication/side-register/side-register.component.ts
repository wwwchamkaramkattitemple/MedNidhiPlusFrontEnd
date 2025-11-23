import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthenticationService, RegisterRequest } from '../../../../services/authentication.service';

@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './side-register.component.html',
  styleUrl: './side-register.component.scss',
})
export class AppSideRegisterComponent {
  constructor(private router: Router, private authService: AuthenticationService, private snackbar: MatSnackBar) { }
  showSpinner: boolean = false;

  form = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const registerRequest: RegisterRequest = {
      firstName: this.form.value.firstName ?? '',
      lastName: this.form.value.lastName ?? '',
      username: this.form.value.username ?? '',
      password: this.form.value.password ?? '',
      email: this.form.value.email ?? ''
    };
    this.showSpinner = true;
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.openSnackBar(response.message, 'Done');
        this.showSpinner = true;
        this.router.navigate(['/authentication/login']);
        this.showSpinner = false;
      },
      error: (err) => {
        if (err.status === 400) {
          this.openSnackBar('Username already exists.', 'Retry');
        } else {
          this.openSnackBar('An error occurred, please try again', 'Retry');
        }
        this.showSpinner = false;
      },
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackbar.open(message, action, {
      duration: 3000,
      panelClass: ['snack-style'],
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }

  goSignIn(event: Event) {
    event.preventDefault();  
    this.router.navigate(['/authentication/login']);
  }

}
