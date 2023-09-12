import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  public products: ProductNew[] = [];

  constructor(private router: Router, 
    public productService: ProductService) {
    this.productService.wishlistItems.subscribe(
      response => {
        this.products = response
      }
      
      

      );
  }

  ngOnInit(): void {
  }

  public get getTotal(): Observable<number> {
    return this.productService.cartTotalAmount();
  }

  async addToCart(product: any) {
    let quantity = 1;
    const status = await this.productService.addToCart(product,quantity);
    this.getTotal.subscribe();
    if(status) {
      if(product.stock > 0)
      {
        product.stock = (product.stock - 1);
      }
      
      this.router.navigate(['/cart']);
      this.removeItem(product);
    }
  }

  removeItem(product: any) {
    this.productService.removeWishlistItem(product);
  }

}
