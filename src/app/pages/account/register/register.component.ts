import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, Validator} from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Otp } from 'src/app/shared/classes/otp';

import Validation from '../utils/validation';

// @ts-check
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  otpValid: boolean = true;
  isValid: boolean = false;
  form: FormGroup;
  submitted = false;
  callForOtp = false;
  userOtp;
  public otp: Otp[] = [];
  constructor(private fromBuilder: FormBuilder, public userService: UserService, private router: Router) { }
  
  showOtpComponent = true;

  ngOnInit(): void {
     this.form =  new FormGroup({
        'fname': new FormControl(null, [Validators.required]),
        'lname': new FormControl(null, [Validators.required]),
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
  get lname() { return this.form.get('lname');}
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password');}
  get repeat_password() { return this.form.get('repeat_password'); }
  get phone() { return this.form.get('phone');}
  //get otp() {return this.form.get('otp')}

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    this.showDiv.otp = true;
    this.showDiv.signUpDiv = false;
    let formData = this.form.value;

    if(this.callForOtp==false){
      this.userService.genOtp({'phone':formData.phone, 'type': 'SignUp'}).subscribe(
        res => {
          if(res['error'] == 0){
            this.callForOtp = true;
            //this.userOtp = res['data'].otpValue;
            console.log(res);
          }
        });
    }else{

      if(this.userOtp){
        let data = {
          'name': formData.fname+' '+formData.lname,
          'email': formData.email,
          'password': formData.password,
          'repeat_password': formData.repeat_password,
          'phone': formData.phone,
          'otp': this.userOtp
        }
        this.userService.userSignUp(data).subscribe(
          res => {
            console.log(' Signup Success',res);
            this.otpValid=true;
            this.isValid = true;
            setTimeout(() => {
              this.router.navigate(['/pages/login']);
            },3000)
            
          }
        );
      }else{
        console.log('Please enter OTP first');
        this.otpValid=false;
      }
      
    }
  }

  showDiv = {
    signUpDiv : true,
    otp : false,
  }

  onOtpChange(ele){
    this.userOtp = ele;
  }
}
