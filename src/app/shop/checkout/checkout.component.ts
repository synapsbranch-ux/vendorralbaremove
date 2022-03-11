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

  isUserLogin:boolean=true;

  constructor(private fb: FormBuilder,
    public productService: ProductService,private userservice: UserService,
    private orderService: OrderService, private route: ActivatedRoute,private router: Router) { 

  }

  ngOnInit(): void {
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
    })

    // get return url from route parameters or default to '/'
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.getallAddressList();

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


  getallAddressList()
  {
    // this.userservice.getAllAddress().subscribe(
    //   res =>
    //   {
    //     this.useraddressslist=res['data'];
    //     console.log('User Address List', res['data']);
    //   }
    // )
  }
  public get getTotal(): Observable<number> {
    return this.productService.cartTotalAmount();
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
        // authorised so return true
        // this.productService.addToCartItemDb(products);
         this.router.navigate(['/order/success']);
    }
    else
    {
    // not logged in so redirect to login page with the return url
    // this.router.navigate(['/pages/login']);
    // this.router.navigateByUrl(this.returnUrl);
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' }});

    console.log(this.returnUrl);
    }

    // console.log(products);

  }

}
