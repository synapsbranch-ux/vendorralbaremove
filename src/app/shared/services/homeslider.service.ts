import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomesliderService {
  constructor(private http: HttpClient) {  }

  // get Stores
  getallSliderData(): Observable<any>{
    return this.http.get(environment.baseUrl+'banner/list');
  } 

  getallVendorSliderData(data): Observable<any>{
    return this.http.post(environment.baseUrl+'vendorbanner/list',data);
  } 

  getallvendorlist(): Observable<any>{
    return this.http.get(environment.baseUrl+'vendorlist');
  } 

}
