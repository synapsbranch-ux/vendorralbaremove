import { Component, OnInit, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from "../../services/product.service";
import { ProductNew } from "../../classes/product";
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  cartproducts=[];
  product_img:any;

  user_id:string
  public products: ProductNew[] = [];
  public search: boolean = false;
  
  public languages = [{ 
    name: 'English',
    code: 'en'
  }, {
    name: 'French',
    code: 'fr'
  }];

  public currencies = [{
    name: 'Euro',
    currency: 'EUR',
    price: 0.90 // price of euro
  }, {
    name: 'Rupees',
    currency: 'INR',
    price: 70.93 // price of inr
  }, {
    name: 'Pound',
    currency: 'GBP',
    price: 0.78 // price of euro
  }, {
    name: 'Dollar',
    currency: 'USD',
    price: 1 // price of usd
  }]

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService,
    public productService: ProductService, private router: Router , private product_service: ProductService) {
    this.productService.cartItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {

  this.user_id=localStorage.getItem('user_id');
  console.log('Setting Run');
  const currentUser = localStorage.getItem("user_id");
  if (currentUser) {
    console.log('User Login');

const cartItems_local = localStorage.getItem('cartItems');

console.log('Local storage check',cartItems_local);

      this.product_service.allCartProducts().subscribe(
        res =>{
          console.log('Return Cart Products1',res['data'].products);
            for (const element of res['data'].products) {   
              
              this.product_service.getproductsBySlugs(element.pro_slug).subscribe(product => {

                 this.product_img=product['data'].product_image[0].pro_image;
                 let data = 
                 {
                   "_id": element.pro_id,
                   "product_image": [
                     {
                         "pro_image": this.product_img,
                         "status": "active"
                     },
                   ],
                   "product_name": element.pro_name,
                   "product_slug": element.pro_slug,
                   "quantity": element.qty,
                   "product_sale_price": element.price,
                   "product_varient_options":[
                       {"size_options": element.options[0].size},
                       {"color_options": element.options[1].color}
                   ]
               }
               this.cartproducts.push(data);
                localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
                console.log('Return LocalStorage',localStorage.getItem("cartItems"));
              })                          
            
        }
        
      }
      )

  }
  else
  {
    console.log('User Not Login');
  }
  }

  searchToggle(){
    this.search = !this.search;
  }

  changeLanguage(code){
    if (isPlatformBrowser(this.platformId)) {
      this.translate.use(code)
    }
  }

  get getTotal(): Observable<number> {
    return this.productService.cartTotalAmount();
  }

  removeItem(product: any) {
    this.productService.removeCartItem(product);
  }

  changeCurrency(currency: any) {
    this.productService.Currency = currency
  }

  logout()
  {
    localStorage.clear();
    this.router.navigate(['']);
  }

}
