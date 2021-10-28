import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, Validator} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form : FormGroup;
  submitted: false;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    // this.form = {
      
    // }
  }

  onSubmit(){
    
  }

}
