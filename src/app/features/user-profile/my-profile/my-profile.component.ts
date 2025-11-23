import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { AuthenticationService } from '../../../../services/authentication.service';


@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit{
  constructor(private authService: AuthenticationService) {}
  userData: any = null;
  
ngOnInit() {
  this.userData = this.authService.getUserData();
}

}





