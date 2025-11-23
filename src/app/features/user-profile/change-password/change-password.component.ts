import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthenticationRequest, AuthenticationService } from '../../../../services/authentication.service';


@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})

export class ChangePasswordComponent {
  constructor(private router: Router, private snackbar: MatSnackBar, private authService: AuthenticationService) { }

  parsedUser: any = null;
  user: any = null;
  form = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/),
      Validators.minLength(8),
    ])
  });

  get f() {
    return this.form.controls;
  }

  validatePasswords(): boolean {
    const oldPassword = this.form.get('oldPassword')?.value;
    const newPassword = this.form.get('newPassword')?.value;
    if (oldPassword === newPassword) {
      this.openSnackBar('Old and New passwords cannot be the same.', 'Retry');
      return false;
    }
    return true;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.validatePasswords()) {
      return;
    }
    this.user = localStorage.getItem('user');
    try {
      this.parsedUser = this.user ? JSON.parse(this.user) : null;
    } catch (error) {
      this.openSnackBar('Error parsing user data from localStorage.', 'Error');
    }
    // const request: AuthenticationRequest = {
    //   password: this.form.value.oldPassword ?? '',
    //   newpassword: this.form.value.newPassword ?? '',
    //   username: this.parsedUser.userName ?? '',
    // };

    // this.authService.changePassword(request).subscribe({
    //   next: (response) => {
    //     this.clearFields();
    //     this.openSnackBar('Password Changed Successfully.', 'Done');
    //   },
    //   error: (err) => {
    //     if (err.status === 401) {
    //       this.openSnackBar('Failed to save data!.', 'Retry');
    //     } else {
    //       this.openSnackBar('An error occurred, please try again', 'Retry');
    //     }
    //   },
    // });
  }

  openSnackBar(message: string, action: string) {
    this.snackbar.open(message, action, {
      duration: 3000,
      panelClass: ['snack-style'],
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
    });
  }

  clearFields() {
    this.form.reset();
  }

}
