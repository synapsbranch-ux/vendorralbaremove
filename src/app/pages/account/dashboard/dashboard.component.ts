import { Component, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public openDashboard: boolean = false;
  userName:string="";
  userEmail:string="";
  userPhone:string="";
  userData: JSON;



  constructor() { 
    
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

}
