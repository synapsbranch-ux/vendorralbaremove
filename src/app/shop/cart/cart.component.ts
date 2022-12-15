import { ToastrService } from 'ngx-toastr';
import { element } from 'protractor';
import { Component, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductSlider } from '../../shared/data/slider';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";

const state = {

  products: JSON.parse(localStorage.getItem('products') || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit , OnChanges {



  public products: ProductNew[] = [];
  public ProductSliderConfig: any = ProductSlider;
  cartproducts=[];
  product_img:any;
  cartproductlist=[];
  desableincrement:boolean=true;
  delay:boolean=false;

  constructor(public product_service: ProductService, private toaster: ToastrService) {

  }

  ngOnInit(): void {
    // this.products=JSON.parse(localStorage.getItem('cartItems'));
    this.product_service.cartItems.subscribe(response => this.products = response);
  }
  

  ngOnChanges(changes) {
  }

  public get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

  // Increament
  increment(product, qty = 1) {
    this.delay = true;
    setTimeout(() => {
      this.delay = false
      }, 1000);
    if(product.stock > 0)
    {
      product.quantity +=1;
      product.stock= (product.stock - 1);

      let incremtstatus= this.product_service.updateCartQuantity(product, qty);
        this.getTotal.subscribe(
          res =>
          {
          }
        );
    }
    else
    {
      this.toaster.error('Your product out of stock');
    }
    
    if(product.quantity > 1)
    {
      this.desableincrement=true;
    }
    else
    {
      this.desableincrement=false;
    }

  }

  // Decrement
  decrement(product, qty = -1) {
    this.delay = true;
    setTimeout(() => {
      this.delay = false
      }, 1000);
    product.stock= (product.stock + 1);
    product.quantity -=1;
    if(product.quantity < 2 )
    {
      this.desableincrement=false;
    }
    else
    {
      this.desableincrement=true;
    }
    this.product_service.updateCartQuantity(product, qty);
    this.getTotal.subscribe(
      res =>
      {
      }
    );
    
  }

  public addwishlist(product)
  {
    this.product_service.addToWishlist(product);
  }

  public removeItem(product: any) {
    this.product_service.removeCartItem(product);
    this.product_service.cartItems.subscribe(response => this.products = response);

  }

}
