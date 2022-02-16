import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-dashboard',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  public openDashboard: boolean = false;
  userName:string="";
  userEmail:string="";
  userPhone:string="";
  userData: JSON;



  constructor( private router: Router) { 
    
  }

  ngOnInit(): void {
    let obj = JSON.parse(localStorage.getItem('currentUser'));
    console.log(obj);
    this.userName= obj['data'].name;
    this.userEmail= obj['data'].email;
    this.userPhone= obj['data'].phone;
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  
  logout()
  {
    localStorage.clear();
    this.router.navigate(['/login'])
    .then(() => {
        window.location.reload();
    });
  }

}
