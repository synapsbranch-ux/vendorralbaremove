import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, Validator} from '@angular/forms';

// @ts-check
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  form: FormGroup;
  submitted = false;
  constructor(private fromBuilder: FormBuilder) { }
  
  otp: string;
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

  onSubmit(): void {
    alert('Clicked!');
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    this.showDiv.otp = true;
    this.showDiv.signUpDiv = false;
    console.log(JSON.stringify(this.form.value, null, 2));

  }

  showDiv = {
    signUpDiv : true,
    otp : false,
  }

  generateOtp(no){
    if(no){

    }
  }
  
}
