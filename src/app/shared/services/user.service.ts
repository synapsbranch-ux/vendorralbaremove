import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Otp } from '../classes/otp';
import { Usersignup } from '../classes/usersignup';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  useraddressid: any
  userorderid: any
  public Otp;
  public Usersignup;
  constructor(private http: HttpClient, private router: Router,) { }

  genOtp(data: any): Observable<Otp> {
    return this.http.post(environment.baseUrl + 'user/generateOTP', data);
  }

  userSignUp(data: any): Observable<Usersignup> {
    return this.http.post(environment.baseUrl + 'user/signup', data);
  }

  vendorSignUp(data: any): Observable<Usersignup> {
    return this.http.post(environment.baseUrl + 'vendor/signup', data);
  }

  vendorgenerateOTP(data: any): Observable<any> {
    return this.http.post(environment.baseUrl + 'vendor/generateOTP', data);
  }

  userLogin(data) {
    return this.http.post(environment.baseUrl + 'user/login', data);
  }

  userContact(data) {
    return this.http.post(environment.baseUrl + 'user/contact', data);
  }

  userVendorRoomCount(data) {
    return this.http.post(environment.baseUrl + 'user/vendor-roomcheck', data);
  }



  getAllAddress() {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.get(environment.baseUrl + 'user/addressList', httpOptionsroom);
  }
  getAllOrderList() {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.get(environment.baseUrl + 'user/orderList', httpOptionsroom);
  }
  getAllOrderDetailsList(data) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/orderList', data, httpOptionsroom);
  }
  getSingleAddress(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/updateAddress', data, httpOptionsroom);
  }
  getUserDetails() {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.get(environment.baseUrl + 'user/details', httpOptionsroom);
  }
  userUpdateAddress(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/updateAddress', data, httpOptionsroom);
  }

  addNewAddress(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/addAddress', data, httpOptionsroom);
  }

  getSingleAddressDetails(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/addressDetails', data, httpOptionsroom);
  }
  setDefaultAddress(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/updateAddress', data, httpOptionsroom);
  }

  deleteAddress(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/deleteAddress', data, httpOptionsroom);
  }

  userUpdateProdile(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/update', data, httpOptionsroom);
  }

  changePassword(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/changepassword', data, httpOptionsroom);
  }

  samepasswordcheck(data: any) {
    let token = localStorage.getItem('u_token') // Will return if it is not set 

    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl + 'user/checkSamePassword', data, httpOptionsroom);
  }

  forgotPassword(data: any) {
    return this.http.post(environment.baseUrl + 'user/forgotpassword', data);
  }

  setUserAddressid(userAddtrss: any) {
    this.useraddressid = userAddtrss;
  }

  getUserAddressid() {
    return this.useraddressid;
  }

  setUserOrderid(userOrderId: any) {
    this.userorderid = userOrderId;
  }

  getUserOrderid() {
    return this.userorderid;
  }

  isTokenExpired(token: string): boolean {
    if (!token) {
      return true; // No token means it's not valid or expired
    }
  
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the payload
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  
    return payload.exp < currentTime; // Check if token is expired
  }

  logout() {
    localStorage.removeItem('u_token');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('user_');
    localStorage.removeItem('vendor_id');
    this.router.navigate(['/login'])
  }

}
