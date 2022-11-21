import { PasswordStrengthValidator } from './../../../password-strength.validators';
import { UserService } from 'src/app/shared/services/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';
import Validation from '../utils/validation';

@Component({
  selector: 'app-dashboard',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public openDashboard: boolean = false;
  userName:string="";
  userEmail:string="";
  userPhone:string="";
  userData: JSON;
  form: FormGroup;
  isValid: boolean = false;
  signupMassage:string="";


  constructor( private router: Router, private userservice: UserService) { 
    
  }

  ngOnInit(): void {
    this.form =  new FormGroup({
      'oldPassword': new FormControl(null, [Validators.required]),
      'newPassword': new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(16),PasswordStrengthValidator]),
      'confirmPassword': new FormControl(null, [Validators.required]),
    },
       {
        validators: [Validation.match('newPassword', 'confirmPassword')]
       }
    )
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  get oldPassword() { return this.form.get('oldPassword'); }
  get newPassword() { return this.form.get('newPassword');}
  get confirmPassword() { return this.form.get('confirmPassword'); }
  
  logout()
  {
    this.userservice.logout();
  }

  onSubmit(): void {

    let formData = this.form.value;
    let EdData={
      "old_Password": formData.oldPassword,
      "new_Password": formData.newPassword,
      "confirm_Password": formData.confirmPassword
 }
 console.log('Send Update',EdData)
 this.userservice.changePassword(EdData).subscribe(
   res =>
   {
     this.isValid=true;
     this.signupMassage="Password Changing ...";            
     setTimeout(() => {
      this.router.navigate(['/dashboard'])
    },2000)  
     console.log('User Update',res);
   }
 )
  }

}
