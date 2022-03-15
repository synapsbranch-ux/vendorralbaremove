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
  orderList=[];
  orderliststatus:boolean=true;


  constructor( private router: Router, private userservice: UserService) { 
    
  }

  ngOnInit(): void {
    if(localStorage.getItem('user_id'))
    {    
      this.userservice.getUserDetails().subscribe(
      res =>
      {
       this.userName= res['data'][0].name;
       this.userEmail= res['data'][0].email;
       this.userPhone= res['data'][0].phone;
        console.log('User Details ',res['data'][0]);
        
      }
    )
    this.userservice.getAllOrderList().subscribe(
      res =>
      {
        this.orderList=res['data'];
        if(this.orderList.length < 1)
        {
this.orderliststatus=false;
        }

        console.log('Get all Order List',res['data'])
      }
      
      )

    }


  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }
  viewOrder(orderId:any)
  {
    this.userservice.setUserOrderid(orderId);
    this.router.navigateByUrl('/view-order')
  }

  logout()
  {
    this.userservice.logout();
  }

}
