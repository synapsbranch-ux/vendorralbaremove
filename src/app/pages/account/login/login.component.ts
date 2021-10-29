import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, Validator} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form : FormGroup;
  submitted= false;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'lemail': new FormControl(null, [Validators.required, Validators.email]),
      'lpassword': new FormControl(null, [Validators.required])
    });
  }

  get lemail(){ return this.form.get('lemail');}
  get lpassword(){ return this.form.get('lpassword');}

    onSubmit(): void {

      this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    console.log(JSON.stringify(this.form.value, null, 2));
    
    }

}
