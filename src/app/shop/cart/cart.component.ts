import { Component, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductSlider } from '../../shared/data/slider';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";

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

  constructor(public product_service: ProductService) {
    this.product_service.cartItems.subscribe(response => this.products = response);
  }


  ngOnInit(): void {
    
  }

  ngOnChanges(changes) {
    console.log('change detected',changes);
  }

  public get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

  // Increament
  increment(product, qty = 1) {

console.log(qty);    
    this.product_service.updateCartQuantity(product, qty);
  }

  // Decrement
  decrement(product, qty = -1) {
    console.log(qty); 
    this.product_service.updateCartQuantity(product, qty);
  }

  public addwishlist(product)
  {
    this.product_service.addToWishlist(product);
  }

  public removeItem(product: any) {
    this.product_service.removeCartItem(product);
  }

}
