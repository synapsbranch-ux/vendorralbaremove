import { environment } from './../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

const state = {
  checkoutItems: JSON.parse(localStorage['checkoutItems'] || '[]')
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient, private router: Router,) { }

  // Get Checkout Items
  public get checkoutItems(): Observable<any> {
    const itemsStream = new Observable(observer => {
      observer.next(state.checkoutItems);
      observer.complete();
    });
    return <Observable<any>>itemsStream;
  }
  

  // Create order
  public createOrder2(product: any, details: any, orderId: any, amount: any) {
    var item = {
        shippingDetails: details,
        product: product,
        orderId: orderId,
        totalAmount: amount
    };
    state.checkoutItems = item;
    localStorage.setItem("checkoutItems", JSON.stringify(item));
    localStorage.removeItem("cartItems");
    this.router.navigate(['/checkout/success', orderId]);
  }

  getAllAddress()
  {
    let token = localStorage.getItem('u_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.get(environment.baseUrl+'user/addressList',httpOptionsroom);
  }

  userCreateOrder(data:Object)
  {
    let token = localStorage.getItem('u_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/orderCreate',data,httpOptionsroom);
  }

  userCreateOrderPayment(data:Object)
  {
    let token = localStorage.getItem('u_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/orderPayment',data,httpOptionsroom);
  }

  userSingleOrderDetails(data:Object)
  {
    let token = localStorage.getItem('u_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/orderDetails',data,httpOptionsroom);
  }
  
}
