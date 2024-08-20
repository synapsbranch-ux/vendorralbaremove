import { ToastrService } from 'ngx-toastr';
import { element } from 'protractor';
import { Component, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductSlider } from '../../shared/data/slider';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { NavigationStart, Router } from '@angular/router';

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
export class CartComponent implements OnInit, OnChanges {



  public products: ProductNew[] = [];
  public ProductSliderConfig: any = ProductSlider;
  cartproducts = [];
  product_img: any;
  cartproductlist = [];
  desableincrement: boolean = false;
  desabledecrement: boolean = false
  delay: boolean = false;
  productWishliststatus: boolean = false;

  constructor(public product_service: ProductService, private toaster: ToastrService, private router: Router) {

  }

  ngOnInit(): void {
    console.log('Cart')
    this.products = JSON.parse(localStorage.getItem('cartItems'));
    this.product_service.cartItems.subscribe(response => this.products = response);
    console.log('this.products ==========> Cart page :::', this.products);
    this.detectNavigationType();
  }


  removeAddon(product: any, addonIndex: number): void {
    const addonToRemove = product.addons[addonIndex];
    // Remove the addon from the product's addons array
    product.addons.splice(addonIndex, 1);
    // Subtract the addon price from the total addons price
    if (product.addonsprice) {
      product.addonsprice -= addonToRemove.price;
    }
    this.product_service.updateCartQuantity(product, 0)
    // this.getTotal.subscribe();
  }

  private detectNavigationType(): void {
    // Check if the navigation is a hard refresh
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {

      this.product_service.allCartProducts().subscribe(
        res => {
          let bodydata = res['data'];
          console.log('bodydata=========================>', bodydata);
          if (bodydata) {
            if (bodydata.hasOwnProperty('products')) {
              localStorage.setItem('cart_',res['data']._id)
              this.cartproducts = [];
              for (const element of res['data'].products) {
                this.product_service.getproductsBySlugs(element.pro_slug).subscribe(product => {
                  if (product['data']) {
                    this.product_img = product['data']?.product_image[0] ? product['data'].product_image[0].pro_image : 'assets/images/product/placeholder.jpg';
                    let data =
                    {
                      "_id": element.pro_id,
                      "product_image": [
                        {
                          "pro_image": this.product_img,
                          "status": "active"
                        },
                      ],
                      "cart_id": res['data']._id,
                      "product_name": element.pro_name,
                      "product_slug": element.pro_slug,
                      "quantity": element.qty,
                      "stock": (product['data'].stock - element.qty),
                      "product_sale_price": element.price,
                      "addons": element.addons,
                      "addonsprice": element.addonsprice
                    }
                    this.cartproducts.push(data);
                    this.products = this.cartproducts;
                    state.cart.push(this.cartproducts);
                    localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
                    // this.getTotal.subscribe();
                    console.log('this.cartproducts', this.cartproducts);
                  }
                })

              }
            }
          }

        }
      )
    }

    // Listen to router events for additional logic if needed
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // You can add more logic here to handle soft navigations
        console.log('Navigation started', event.url);
      }
    });
  }

  ngOnChanges(changes) {
  }

  public get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

  // Increament
  increment(product, qty = 1) {
    console.log('product.stock', product.stock);

    this.desabledecrement = false;
    this.delay = true;
    setTimeout(() => {
      this.delay = false
    }, 1000);
    console.log('product.quantity===============', product.quantity);
    if (product.stock > 0) {
        product.stock = (product.stock - 1)
        product.quantity = product.quantity + 1
  
      let incremtstatus = this.product_service.updateCartQuantity(product, 0);
      console.log('incremtstatus------------------',incremtstatus);
      // this.getTotal.subscribe();
      this.desableincrement = false;
    }
    else {
      this.toaster.error('Your product out of stock');
      this.desableincrement = true;
    }

    if (product.quantity >= 1) {
      this.desableincrement = false;
    }
    else {
      this.desableincrement = true;
    }
    console.log('product.quantity===============', product.quantity);
  }

  // Decrement
  decrement(product, qty = -1) {
    console.log('product.stock', product.stock);

    this.desableincrement = false;
    this.delay = true;
    setTimeout(() => {
      this.delay = false
    }, 1000);


    if (product.quantity == 1) {
      this.desabledecrement = true;
    }
    else {
      product.stock = (product.stock + 1);
      product.quantity = product.quantity - 1
      this.desabledecrement = false;
      this.product_service.updateCartQuantity(product, 0);
      // this.getTotal.subscribe();
    }


  }
  public checkwishlist(product) {
    return this.product_service.wishlistProductCheck(product)
  }

  public addwishlist(product) {
    this.productWishliststatus = this.product_service.wishlistProductCheck(product)
    if (!this.productWishliststatus) {
      this.product_service.addToWishlist(product);
    }

  }

  public removeItem(product: any) {
    product.stock = (product.stock + product.quantity);
    this.product_service.removeCartItem(product);
    this.product_service.cartItems.subscribe(response => this.products = response);

  }

}
