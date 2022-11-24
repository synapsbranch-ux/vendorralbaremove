import { ToastrService } from 'ngx-toastr';
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

  constructor(public product_service: ProductService, private toaster: ToastrService) {

  }

  ngOnInit(): void {
    if(localStorage.getItem('user_id'))
    {
    this.product_service.cartItems.subscribe(response => this.products = response);
    this.product_service.allCartProducts().subscribe(
      res =>{
        console.log('Return Cart ===>',res);
        if(res['data'])
        {
          let bodydata=res['data'];
          if(bodydata.hasOwnProperty('products'))
          {
          for (const element of res['data'].products) {   

            //console.log('cart Product slug',element.pro_slug);
            
            this.product_service.getproductsBySlugs(element.pro_slug).subscribe(product => {

              //console.log('cart Product Image',product['data']);

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
                  "cart_id": res['data']._id,
                  "product_name": element.pro_name,
                  "product_slug": element.pro_slug,
                  "quantity": element.qty,
                  "stock":(product['data'].stock - element.qty),
                  "product_sale_price": element.price,
                  "product_varient_options":[
                      {"size_options": element.options[0].size},
                      {"color_options": element.options[1].color}
                  ],
                  "width": element.width,
                  "height": element.height
                }
              this.cartproducts.push(data);          
              this.products=this.cartproducts;     
              localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
              //console.log('Return LocalStorage',localStorage.getItem("cartItems"));
              
            })                          
          
      }
    }
    }
      
    }
    )
  }
  else
  {
    this.product_service.cartItems.subscribe(response => this.products = response);    
    localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
    //console.log('Return LocalStorage',localStorage.getItem("cartItems"));                            
          
  }

  }
  

  ngOnChanges(changes) {
    //console.log('change detected',changes);
  }

  public get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

  // Increament
  increment(product, qty = 1) {
    product.stock= (product.stock - 1);
    console.log('product.stock',product)
    if(product.stock >=0)
    {
      product.quantity +=1;
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


//console.log(qty);    
    this.product_service.updateCartQuantity(product, qty);
    this.getTotal.subscribe(
      res =>
      {
        //console.log('Increment Total',res);
      }
    );

  }

  // Decrement
  decrement(product, qty = -1) {

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

    //console.log(qty); 
    this.product_service.updateCartQuantity(product, qty);
    this.getTotal.subscribe(
      res =>
      {
        //console.log('Decrement Total',res);
      }
    );
    
  }

  public addwishlist(product)
  {
    this.product_service.addToWishlist(product);
  }

  public removeItem(product: any) {

    //console.log('Remove Cart Item',product);
    this.product_service.removeCartItem(product);
    this.product_service.cartItems.subscribe(response => this.products = response);

  }

}
