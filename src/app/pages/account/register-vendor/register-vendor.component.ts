import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, Validator} from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Otp } from 'src/app/shared/classes/otp';

import Validation from '../utils/validation';

// @ts-check
@Component({
  selector: 'app-register-vendor',
  templateUrl: './register-vendor.component.html',
  styleUrls: ['./register-vendor.component.scss']
})

export class RegisterVendorComponent implements OnInit {

  signupMassage:string="";
  phValid: boolean = true;
  isValid: boolean = false;
  form: FormGroup;
  submitted = false;

  constructor(private fromBuilder: FormBuilder, public userService: UserService, private router: Router) { }
  
  showOtpComponent = true;

  ngOnInit(): void {
     this.form =  new FormGroup({
        'fname': new FormControl(null, [Validators.required]),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'password': new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(16)]),
        'repeat_password': new FormControl(null, [Validators.required]),
        'phone': new FormControl(null, [Validators.required, Validators.pattern('[0-9]*')]),

      },
       {
        validators: [Validation.match('password', 'repeat_password')]
       }
      );
  }

  get fname() { return this.form.get('fname'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password');}
  get repeat_password() { return this.form.get('repeat_password'); }
  get phone() { return this.form.get('phone');}

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    
    
    let formData = this.form.value;

    let element = <HTMLInputElement> document.getElementById("customControlAutosizing1");  
    if (element.checked) { 

      let data = {
        'name': formData.fname,
        'email': formData.email,
        'password': formData.password,
        'repeat_password': formData.repeat_password,
        'phone': formData.phone,
      }
      this.userService.vendorSignUp(data).subscribe(
        res => {
          console.log(' Signup Success',res);
          this.isValid = true;
          this.signupMassage="Your Registration sucessfull";

          setTimeout(() => {
            this.router.navigate(['/pages/login'])
            .then(() => {
              window.location.reload();
            });
          },3000)          
        },
        error => {
          // .... HANDLE ERROR HERE 
          console.log(error.message);
          this.phValid=false;
          this.signupMassage="Your Phone Or Email Already Register";
      }
      );

    }
    else
    {
      this.phValid=false;
      this.signupMassage="Please check Terms & Conditions";
    }

      
    }
  }

