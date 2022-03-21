import { Router } from '@angular/router';
import { UserService } from './../../../shared/services/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  form: FormGroup;
  isValid:boolean=false;
  submitMassage:any;

  constructor(private userservice: UserService, private router: Router) { }

  ngOnInit(): void {
    this.form =  new FormGroup({
      'userEmail': new FormControl(null, [Validators.required]),
    });
  }

  get userEmail() { return this.form.get('userEmail'); }


  onSubmit()
  {
    let formData = this.form.value;

    let fData={
      email : formData.userEmail
    }

    this.userservice.forgotPassword(fData).subscribe(
      res =>
      {
        this.isValid=true;
        this.submitMassage="Your Password han been changed. Please Check Your Mail."
        setTimeout(() => {
          this.router.navigate(['/login'])
          .then(() => {
            // window.location.reload();
          });
        },2000) 
        console.log('Submit Forgot Password',res);
      }
    )



  }

}
