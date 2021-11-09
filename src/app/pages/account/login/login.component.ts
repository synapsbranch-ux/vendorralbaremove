import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, Validator} from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form : FormGroup;
  submitted= false;

  constructor(private formBuilder: FormBuilder, public userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'phone_email': new FormControl(null, [Validators.required]),
      'login_password': new FormControl(null, [Validators.required])
    });
  }

  get phone_email(){ return this.form.get('phone_email');}
  get login_password(){ return this.form.get('login_password');}

    onSubmit(): void {

      this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    let formData = this.form.value;
    console.log(JSON.stringify(this.form.value, null, 2));
    let data = {
      'email_phone': formData.phone_email,
      'password': formData.login_password,
    }
    this.userService.userLogin(data).subscribe(
      res => {
        console.log(' Login Success',res);
        localStorage.setItem('user_id', res['data'].user_id);
        localStorage.setItem('user_token', res['data'].token);
        localStorage.setItem('currentUser', JSON.stringify(res));
        this.router.navigate(['/pages/dashboard']);
      }
    );
    
    }

}
