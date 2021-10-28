import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  otp: string;
  showOtpComponent = true;

  //@ViewChild('ngOtpInput', { static: false}) ngOtpInput: any;

  constructor() { }

  ngOnInit(): void {
  }

}
