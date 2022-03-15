import { element } from 'protractor';
import { Component, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductSlider } from '../../shared/data/slider';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";

const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
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

  constructor(public product_service: ProductService) {

  }

  ngOnInit(): void {
    this.product_service.cartItems.subscribe(response => this.products = response);

if(localStorage.getItem('user_id'))
{
  this.product_service.allCartProducts().subscribe(
    res =>{
      console.log('Return Cart',res);

      if(res['data'] != null)
      {
        for (const element of res['data'].products) {   

          console.log('cart Product slug',element.pro_slug);
          
          this.product_service.getproductsBySlugs(element.pro_slug).subscribe(product => {

            console.log('cart Product Image',product['data']);

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
                "cart_id": element._id,
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
            this.products=this.cartproducts;
            this.getTotal;     
            localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
            console.log('Return LocalStorage',localStorage.getItem("cartItems"));
            
          })                          
        
    }
  }
    
  }
  )
}

  }
  

  ngOnChanges(changes) {
    console.log('change detected',changes);
  }

  public get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

  // Increament
  increment(product, qty = 1) {
    product.quantity +=1;

    if(product.quantity > 1)
    {
      this.desableincrement=true;
    }
    else
    {
      this.desableincrement=false;
    }


console.log(qty);    
    this.product_service.updateCartQuantity(product, qty);
  }

  // Decrement
  decrement(product, qty = -1) {
    product.quantity -=1;

    if(product.quantity < 2 )
    {
      this.desableincrement=false;
    }
    else
    {
      this.desableincrement=true;
    }

    console.log(qty); 
    this.product_service.updateCartQuantity(product, qty);
  }

  public addwishlist(product)
  {
    this.product_service.addToWishlist(product);
  }

  public removeItem(product: any) {

      // console.log('Remove Cart Item',product);

    this.product_service.removeCartItem(product);
  }

}
