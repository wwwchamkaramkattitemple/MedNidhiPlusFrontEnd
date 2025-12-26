import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getUserData();

    if (!user) {
      this.router.navigate(['/authentication/login']);
      return false;
    }

    return true;
  }
}
