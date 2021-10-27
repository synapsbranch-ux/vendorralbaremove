import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form: FormGroup;
  constructor(private fromBuilder: FormBuilder) { }
  
  ngOnInit(): void {
      this.fromBuilder.group({
        fname: [null, [Validators.required]],
        lname: [null, [Validators.required]],
        email: [null, [Validators.required, Validators.email]],
        password: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
        repeat_password: [null, [Validators.required]]
      });
  }

}
