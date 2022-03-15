import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { environment } from '../../../environments/environment';
import { ProductNew } from "../../shared/classes/product";
import { ProductService } from "../../shared/services/product.service";
import { OrderService } from "../../shared/services/order.service";
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { v4 as uuidv4 } from 'uuid';
const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  public checkoutForm:  FormGroup;
  public products: ProductNew[] = [];
  public payPalConfig ? : IPayPalConfig;
  public payment: string = 'Stripe';
  public amount:  any;
  returnUrl: string;
  useraddressslist=[];
  orderValid:boolean=false;
  orderMassage:any;

  isUserLogin:boolean=true;

  constructor(private fb: FormBuilder,
    public productService: ProductService,private userservice: UserService,
    private orderService: OrderService, private route: ActivatedRoute,private router: Router) { 

  }

  ngOnInit(): void {
    console.log('Cart Products',state.cart)
  if(localStorage.getItem('user_id'))
  {
    this.isUserLogin=false;
  }

    this.productService.cartItems.subscribe(response => this.products = response);
    this.getTotal.subscribe(amount => this.amount = amount);
    // this.initConfig();
    this.checkoutForm = new FormGroup({
      'firstname': new FormControl(null, [Validators.required]),
      'lastname': new FormControl(null, [Validators.required]),
      'phone': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required]),
      'address1': new FormControl(null, [Validators.required]),
      'address2': new FormControl(null),
      'country': new FormControl(null, [Validators.required]),
      'town': new FormControl(null, [Validators.required]),
      'state': new FormControl(null, [Validators.required]),
      'postalcode': new FormControl(null, [Validators.required]),
      'paymentOption': new FormControl(null, [Validators.required]),
      'userAddressId': new FormControl(null, [Validators.required]),
    })

    // get return url from route parameters or default to '/'
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if(this.isUserLogin)
    {
      this.checkoutForm.controls['phone'].disable();
      this.checkoutForm.controls['email'].disable();
      this.checkoutForm.controls['firstname'].disable();
      this.checkoutForm.controls['lastname'].disable();
      this.checkoutForm.controls['address1'].disable();
      this.checkoutForm.controls['address2'].disable();
      this.checkoutForm.controls['country'].disable();
      this.checkoutForm.controls['town'].disable();
      this.checkoutForm.controls['state'].disable();
      this.checkoutForm.controls['postalcode'].disable();
      this.checkoutForm.controls['paymentOption'].disable();
     
    }
    if(!this.isUserLogin)
    {
      this.getuserallAddressList();
    }

  }

  get firstname() { return this.checkoutForm.get('firstname'); }
  get lastname() { return this.checkoutForm.get('lastname');}
  get phone() { return this.checkoutForm.get('phone'); }
  get email() { return this.checkoutForm.get('email');}
  get address1() { return this.checkoutForm.get('address1');}
  get address2() { return this.checkoutForm.get('address2');}
  get country() { return this.checkoutForm.get('country');}
  get town() { return this.checkoutForm.get('town');}
  get state() { return this.checkoutForm.get('state');}
  get postalcode() { return this.checkoutForm.get('postalcode');}
  get paymentOption() { return this.checkoutForm.get('paymentOption');}
  get userAddressId() { return this.checkoutForm.get('userAddressId');}


  getuserallAddressList()
  {
    this.orderService.getAllAddress().subscribe(
      res =>
      {
        this.useraddressslist=res['data'];
        console.log('User Address List', res['data']);
      }
    )
  }
  public get getTotal(): Observable<number> {
    return this.productService.cartTotalAmount();
  }

  checkoutLogin()
  {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' }});
  }

  // // Stripe Payment Gateway
  // stripeCheckout() {
  //   var handler = (<any>window).StripeCheckout.configure({
  //     key: environment.stripe_token, // publishble key
  //     locale: 'auto',
  //     token: (token: any) => {
  //       // You can access the token ID with `token.id`.
  //       // Get the token ID to your server-side code for use.
  //       this.orderService.createOrder(this.products, this.checkoutForm.value, token.id, this.amount);
  //     }
  //   });
  //   handler.open({
  //     name: 'Multikart',
  //     description: 'Online Fashion Store',
  //     amount: this.amount * 100
  //   }) 
  // }

  // // Paypal Payment Gateway
  // private initConfig(): void {
  //   this.payPalConfig = {
  //       currency: this.productService.Currency.currency,
  //       clientId: environment.paypal_token,
  //       createOrderOnClient: (data) => < ICreateOrderRequest > {
  //         intent: 'CAPTURE',
  //         purchase_units: [{
  //             amount: {
  //               currency_code: this.productService.Currency.currency,
  //               value: this.amount,
  //               breakdown: {
  //                   item_total: {
  //                       currency_code: this.productService.Currency.currency,
  //                       value: this.amount
  //                   }
  //               }
  //             }
  //         }]
  //     },
  //       advanced: {
  //           commit: 'true'
  //       },
  //       style: {
  //           label: 'paypal',
  //           size:  'small', // small | medium | large | responsive
  //           shape: 'rect', // pill | rect
  //       },
  //       onApprove: (data, actions) => {
  //           this.orderService.createOrder(this.products, this.checkoutForm.value, data.orderID, this.getTotal);
  //           console.log('onApprove - transaction was approved, but not authorized', data, actions);
  //           actions.order.get().then(details => {
  //               console.log('onApprove - you can get full order details inside onApprove: ', details);
  //           });
  //       },
  //       onClientAuthorization: (data) => {
  //           console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
  //       },
  //       onCancel: (data, actions) => {
  //           console.log('OnCancel', data, actions);
  //       },
  //       onError: err => {
  //           console.log('OnError', err);
  //       },
  //       onClick: (data, actions) => {
  //           console.log('onClick', data, actions);
  //       }
  //   };
  // }

  placeorder()
  {
    const currentUser = localStorage.getItem("user_id");
    if (currentUser) {
      

      let orderTotal=0;
      let transactionId=0;
      let paymentStatus="success";
      let formData = this.checkoutForm.value;

      if(formData.paymentOption == 'COD')
      {
        transactionId=uuidv4();
      }
      console.log('Payment Status',formData.paymentOption);

      this.getTotal.subscribe(
        res =>
        {
          orderTotal=res
          
        }
      )
      
     console.log('Cart Products',this.products)

     let orderProducts : Object[]=[];

     for(const elem of this.products)
     {
       console.log('product Loop',elem);
      let odetails= {
        store_id: elem.product_store,
        vendor_id: elem.product_owner,
        department_id: elem.product_department,
        product_id: elem._id,
        product_name: elem.product_name,
        product_image: elem.product_image[0].pro_image,
        product_slug: elem.product_slug,
        qty: elem.quantity,
        price: elem.product_sale_price,
        options:[
            {size: elem.product_varient_options[0].size_options},
            {color: elem.product_varient_options[1].color_options}
        ]
      }
      orderProducts.push(odetails);
     }


console.log('orderProducts',orderProducts)
let orderData=
{
  total_order_amount: orderTotal,
  order_status: 'initiated',
  payment_status: paymentStatus,
  payment_method: formData.paymentOption,
  transaction_id: transactionId,
  shipping_address_id: formData.userAddressId,
  billing_email: formData.email,
  billing_phone: formData.phone,
  billing_country: formData.country,
  billing_first_name: formData.firstname,
  billing_last_name: formData.lastname,
  billing_address1: formData.address1,
  billing_address2: formData.address2,
  billing_city: formData.town,
  billing_state: formData.state,
  billing_zip: formData.postalcode,
  order_details: orderProducts,
}
console.log('Order Generate STR 1',orderData);
console.log('Order Generate STR 2',JSON.stringify(orderData));

this.orderService.userCreateOrder(orderData).subscribe(

  res =>
  {
    this.orderValid=true;
    this.orderMassage="Your Order Placed Sucessfully";
    console.log('Order Created',res);
    for(const elem of this.products)
    {
      this.productService.removeCartItem(elem);
    }
    this.userservice.setUserOrderid(res['data'].order_id);
    setTimeout(() => {
      this.router.navigateByUrl('/order/success');
    },1000) 
  }

)

    }
    else
    {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' }});
    console.log(this.returnUrl);
    }

  }

}
