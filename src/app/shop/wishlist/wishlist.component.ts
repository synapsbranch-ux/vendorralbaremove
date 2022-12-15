import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";

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

  async addToCart(product: any) {
    product.quantity = 1;
    const status = await this.productService.addToCart(product);
    if(status) {
      this.router.navigate(['/cart']);
      this.removeItem(product);
    }
  }

  removeItem(product: any) {
    this.productService.removeWishlistItem(product);
  }

}
