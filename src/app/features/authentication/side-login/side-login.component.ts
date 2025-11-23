import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthenticationRequest, AuthenticationService, UserData } from '../../../../services/authentication.service';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSnackBarModule, CommonModule],
  templateUrl: './side-login.component.html',
  styleUrls: ['./side-login.component.scss'],
})
export class AppSideLoginComponent {
  showSpinner: boolean = false;
  constructor(private router: Router, private snackbar: MatSnackBar, private authService: AuthenticationService
  ) { }

  form = new FormGroup({
    username: new FormControl('', [Validators.required]), 
    password: new FormControl('',[Validators.required]), 
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const authRequest: AuthenticationRequest = {
      username: this.form.value.username ?? '',
      password: this.form.value.password ?? ''
    };
    this.showSpinner = true;
    this.authService.login(authRequest).subscribe({
      next: (response) => {
        if (response.token != null) {
          const storeUserData: UserData = {
            AuthToken: response.token ?? '',
            UserName: this.authService.getUsernameFromToken(response.token) ?? ''
          }
          this.authService.storeUserData(storeUserData);
        };

        this.openSnackBar('Login Successful', 'Done');
        this.showSpinner = true;
        this.router.navigate(['/dashboard']);
        this.showSpinner = false;
      },
      error: (err) => {
        this.showSpinner = false;
        if (err.status === 401) {
          this.openSnackBar('Invalid username or password', 'Retry');
        } else {
          this.openSnackBar('An error occurred, please try again', 'Retry');
        }
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

  goRegister(event: Event) {
  event.preventDefault();   // prevent default anchor behavior
  this.router.navigate(['/authentication/register']); // navigate immediately
}

}
