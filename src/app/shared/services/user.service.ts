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

  useraddressid:any
  public Otp;
  public Usersignup;
  constructor(private http: HttpClient, private router: Router,) { }

  genOtp(data: any): Observable<Otp>{
    return this.http.post(environment.baseUrl+'user/generateOTP',data);
  }  
  
  userSignUp(data: any): Observable<Usersignup>{
    return this.http.post(environment.baseUrl+'user/signup',data);
  } 

  vendorSignUp(data: any): Observable<Usersignup>{
    return this.http.post(environment.baseUrl+'vendor/signup',data);
  } 

  userLogin(data){
    return this.http.post(environment.baseUrl+'user/login',data);
  }
  getAllAddress()
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.get(environment.baseUrl+'user/addressList',httpOptionsroom);
  }
  getSingleAddress(data:any)
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/updateAddress',data,httpOptionsroom);
  }
  getUserDetails()
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.get(environment.baseUrl+'user/details',httpOptionsroom);
  }
  userUpdateAddress(data:any)
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/updateAddress',data,httpOptionsroom);
  }

  addNewAddress(data:any)
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/addAddress',data,httpOptionsroom);
  }

  getSingleAddressDetails(data:any)
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/addressDetails',data,httpOptionsroom);
  }
  setDefaultAddress(data:any)
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/updateAddress',data,httpOptionsroom);
  }

  userUpdateProdile(data:any)
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/update',data,httpOptionsroom);
  }

  changePassword(data:any)
  {
    let token = localStorage.getItem('user_token') // Will return if it is not set 
  
    let httpOptionsroom = {
      headers: new HttpHeaders({
        'Authorization': "Bearer " + token
      })
    }
    return this.http.post(environment.baseUrl+'user/changepassword',data,httpOptionsroom);
  }

  setUserAddressid(userAddtrss:any)
  {
    this.useraddressid=userAddtrss;
  }

  getUserAddressid()
  {
    return this.useraddressid;
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
