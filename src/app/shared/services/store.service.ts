import { HttpClient } from '@angular/common/http';
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

  private get stores(): Observable<Store[]>{
    const body={"page": 1}
    this.Stores = this.http.post(environment.baseUrl+'stores',body);
    console.log('Store Service called!', this.Stores);
    return this.Stores;
  }
  // get Stores
  public get getStores(): Observable<Store[]>{
    return this.stores;
  }
}
