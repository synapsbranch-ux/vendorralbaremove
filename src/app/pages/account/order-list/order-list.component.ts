import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';
import { ProductService } from 'src/app/shared/services/product.service';
import * as moment from 'moment';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {

  public openDashboard: boolean = false;
  userName: string = "";
  userEmail: string = "";
  userPhone: string = "";
  userData: JSON;
  orderList = [];
  orderliststatus: boolean = true;
  ongoingOrders = [];
  deliveredOrders = [];
  filterongoingOrders = []
  constructor(private router: Router, private userservice: UserService, public productService: ProductService) {

  }

  ngOnInit(): void {
    if (localStorage.getItem('user_')) {
      this.userservice.getUserDetails().subscribe(
        res => {
          if (res['error'] != 1) {
            this.userName = res['data'][0].name;
            this.userEmail = res['data'][0].email;
            this.userPhone = res['data'][0].phone;
          }
        }
      )
      this.userservice.getAllOrderList().subscribe(
        res => {
          this.orderList = res['data'];
          // Filter orders based on their status
          this.ongoingOrders = this.orderList.filter(order => order.order_status !== 'delivered');
          this.deliveredOrders = this.orderList.filter(order => order.order_status === 'delivered');
          this.filterOrders();
          if (this.orderList.length < 1) {
            this.orderliststatus = false;
          }
        }

      )

    }


  }

  filterOrders() {
    this.filterongoingOrders = this.ongoingOrders.filter(order => {
      // Always include approved orders
      if (order.payment_status === 'APPROVED' || order.payment_status === 'COMPLETED') {
        return true;
      }

      // For non-approved orders, only include if within 2 days of creation
      return (order.payment_status !== 'APPROVED' && order.payment_status !== 'COMPLETED') && this.isWithinTwoDays(order.createdAt);

    })
  }

  isWithinTwoDays(orderDate: string): boolean {
    const currentDate = moment();  // Local time
    const createdAt = moment.utc(orderDate);  // Parse order date as UTC
    const differenceInDays = currentDate.diff(createdAt, 'days');

    return differenceInDays <= 1;  // Only show orders within 1 days
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }
  viewOrder(orderId: any) {
    this.userservice.setUserOrderid(orderId);
    this.router.navigateByUrl('/view-order')
  }

  logout() {
    this.userservice.logout();
  }

}
