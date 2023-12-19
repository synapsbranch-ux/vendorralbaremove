import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Store } from '../classes/store';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  public Stores
  constructor(private http: HttpClient) {  }

  // get Stores
  public get getStores(): Observable<Store[]>{
    const body={"page": 1, "limit": 100}
    this.Stores = this.http.post(environment.baseUrl+'stores',body);
    console.log('Store Service called!', this.Stores);
    return this.Stores;
  }
  public get getStoresMore(): Observable<Store[]>{
    const body={"page": 1, "limit": 50}
    this.Stores = this.http.post(environment.baseUrl+'stores',body);
    
    return this.Stores;
  }
  
  roomAvailableCheck(data: any): Observable<any>{
    return this.http.post(environment.baseUrl+'stores/roomconfiguration',data);
  } 

  storeviewcount(data: any): Observable<any>{
    return this.http.post(environment.baseUrl+'stores/storeview',data);
  } 

  vendorstoredetails(data: any): Observable<any>{
    return this.http.post(environment.baseUrl+'stores/vendor-store-details',data);
  } 

}
