import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Otp } from '../classes/otp';
import { Usersignup } from '../classes/usersignup';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public Otp;
  public Usersignup;
  constructor(private http: HttpClient) { }

  genOtp(data: any): Observable<Otp>{
    return this.http.post(environment.baseUrl+'user/generateOTP',data);
  }  
  
  userSignUp(data: any): Observable<Usersignup>{
    return this.http.post(environment.baseUrl+'user/signup',data);
  } 
}
