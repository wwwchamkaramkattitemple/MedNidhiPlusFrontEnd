import { Component, inject } from '@angular/core';
import { MaterialModule } from './material.module';
import { RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangePasswordComponent } from './features/user-profile/change-password/change-password.component';
import { MatDialog } from '@angular/material/dialog';
import { MyProfileComponent } from './features/user-profile/my-profile/my-profile.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [MaterialModule, RouterModule, CommonModule, MatExpansionModule]
})
export class AppComponent {
  title = 'Clinic Billing System';
  userData: any = null;
  username!: string | null;
  readonly dialog = inject(MatDialog);
  reportsOpen = false;
  currentUser: any = null;
  isReady = false;

  constructor(public router: Router, private authService: AuthenticationService, private location: Location, private snackbar: MatSnackBar) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.reportsOpen = event.urlAfterRedirects.includes('report');
      });
  }
  hiddenRoutes = ['/authentication/login', '/authentication/register'];

  isAuthRoute(): boolean {
    return this.router.url.startsWith('/authentication');
  }




  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        take(1)
      )
      .subscribe(() => {
        this.isReady = true;
      });

    this.authService.userData$.subscribe(user => {
      this.currentUser = user;
      this.username = user?.UserName ?? '';
    });
  }



  onLogOut(event: Event) {
    event.preventDefault();
    this.authService.onLogOut();
    this.openSnackBar('Logout successful', 'Done');
    this.router.navigate(['/authentication/login']);
  }


  hasRole(role: string): boolean {
    return this.currentUser?.roles?.includes(role);
  }


  toggleReports() {
    this.reportsOpen = !this.reportsOpen;
  }

  openChangePassword(event: Event) {
    event.preventDefault();
    const dialogRef = this.dialog.open(ChangePasswordComponent);
    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }

  openMyProfile(event: Event) {
    event.preventDefault();
    this.router.navigate(['/my-profile']);
  }

  openUserManagement(event: Event) {
    event.preventDefault();
    this.router.navigate(['/user-management']);
  }

  openSnackBar(message: string, action: string) {
    this.snackbar.open(message, action, {
      duration: 3000,
      panelClass: ['snack-style'],
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }
}