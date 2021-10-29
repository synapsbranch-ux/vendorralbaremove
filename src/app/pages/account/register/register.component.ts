import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, Validator} from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Otp } from 'src/app/shared/classes/otp';

// @ts-check
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  form: FormGroup;
  submitted = false;
  callForOtp = false;
  userOtp = 0;
  public otp: Otp[] = [];
  constructor(private fromBuilder: FormBuilder, public userService: UserService) { }
  
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
      /*{
        validator: [Validation.match('password', 'confirmPassword')]
      }*/);
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
    console.log(formData);
    console.log('User Phone No', formData.phone);
    if(this.callForOtp==false){
      this.userService.genOtp({'phone':formData.phone, 'type': 'SignUp'}).subscribe(
        res => {
          console.log(res);
          console.log(res['error']);
          if(res['error'] == 0){
            this.callForOtp = true;
            this.userOtp = res['data'].otpValue;
          }
        });
    }else{
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
        }
      );
    }
  }

  showDiv = {
    signUpDiv : true,
    otp : false,
  }

 
}
