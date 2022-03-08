import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  public openDashboard: boolean = false;
  userName:string="";
  userEmail:string="";
  userPhone:string="";
  userData: JSON;



  constructor( private router: Router, private userservice: UserService) { 
    
  }

  ngOnInit(): void {
    this.userservice.getUserDetails().subscribe(
      res =>
      {
       this.userName= res['data'][0].name;
       this.userEmail= res['data'][0].email;
       this.userPhone= res['data'][0].phone;
        console.log('User Details ',res['data'][0]);
      }
    )
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  logout()
  {
    this.userservice.logout();
  }

}
