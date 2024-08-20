import { ToastrService } from 'ngx-toastr';
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
import { first } from 'rxjs/operators';
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
  paypalstatus:boolean=false;
  transactionId=0;
  isUserLogin:boolean=true;
  paypalreurnData=[];
  local_checkout_obj={};
  email_:any;
  phone_:any;
  country_:any;
  first_name_:any;
  last_name_:any;
  street_address_:any
  street_address2_:any;
  city_name_:any;
  state_name_:any;
  zip_code_:any;
  product_not_available:any=[];
  userFuyllName:any

  constructor(private fb: FormBuilder,
    public productService: ProductService,private userservice: UserService,
    private orderService: OrderService, private route: ActivatedRoute,private router: Router, private toaster : ToastrService) { 

  }

  ngOnInit(): void {
    let currentUserDetails=JSON.parse(localStorage.getItem('currentUser'));
    this.email_=currentUserDetails.data.email;
    this.phone_=currentUserDetails.data.phone;
    this.userFuyllName = currentUserDetails.data.name;

    this.local_checkout_obj=JSON.parse(localStorage.getItem('checkoutform'));
    if(this.local_checkout_obj)
    {
      this.email_=this.local_checkout_obj['email_address'];
      this.phone_=this.local_checkout_obj['phone_no'];
    }
  if(localStorage.getItem('user_id'))
  {
    this.isUserLogin=false;
  }

    this.productService.cartItems.subscribe(response => this.products = response);
   for (const element of this.products) {
            
      this.productService.getproductsBySlugs(element.product_slug)
      .pipe(first())
      .subscribe({
      next: (v) => {
          let stock=(v.data.stock - element.quantity);
          if(stock < 0)
          {
            if(v.data.product_name)
            {
              this.toaster.error(`${v.data.product_name} is out of stock, please delete from cart to continue shoping`)
              this.router.navigateByUrl(`stores/${v.data.product_store.store_slug}/${v.data.product_department.department_slug}/${v.data.product_slug}`)
            }
          }  
        },
        error: (e) => {
        },
        complete: () => console.info('Complete') 
        }
        );
  }
    this.getTotal.subscribe(amount => this.amount = amount);
    this.initConfig();
    this.checkoutForm = new FormGroup({
      'phone': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email,Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
      'paymentOption': new FormControl(null),
      'userShippingAddressId': new FormControl(null, [Validators.required]),
      'userBillingAddressId': new FormControl(null, [Validators.required]),
    })
    if(this.isUserLogin)
    {
      this.checkoutForm.controls['phone'].disable();
      this.checkoutForm.controls['email'].disable();
      this.checkoutForm.controls['paymentOption'].disable();
     
    }
    if(!this.isUserLogin)
    {
      this.getuserallAddressList();
    }

  }

  get phone() { return this.checkoutForm.get('phone'); }
  get email() { return this.checkoutForm.get('email');}
  get paymentOption() { return this.checkoutForm.get('paymentOption');}
  get userShippingAddressId() { return this.checkoutForm.get('userShippingAddressId');}
  get userBillingAddressId() { return this.checkoutForm.get('userBillingAddressId');}


  getuserallAddressList()
  {
    this.orderService.getAllAddress().subscribe(
      res =>
      {
        this.useraddressslist=res['data'];
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
  checkaddress()
  {
let address_arr={
  email_address: (<HTMLInputElement>document.getElementById('email_address')).value,
  phone_no: (<HTMLInputElement>document.getElementById('email_address')).value,
}

    localStorage.setItem('checkoutform',JSON.stringify(address_arr))

    this.router.navigate(['/address'], { queryParams: { returnUrl: '/checkout' }});
  }

  // Paypal Payment Gateway
  private initConfig(): void {
    let orderProductspaypal : Object[]=[];

    for(const elem of this.products)
    {
     let odetailsobj= 
     {
      name: elem.product_name,
      quantity: elem.quantity,
      unit_amount: {
        currency_code: this.productService.Currency.currency,
        value: elem.product_sale_price,
      },
    }
    orderProductspaypal.push(odetailsobj);
    }
  
    this.payPalConfig = {
      currency: this.productService.Currency.currency,
      clientId: environment.paypal_token,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: this.productService.Currency.currency,
              value: this.amount,
              breakdown: {
                item_total: {
                  currency_code: this.productService.Currency.currency,
                  value: this.amount,
                }
              }
            },
            items: orderProductspaypal
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        actions.order.get().then(details => {
          this.transactionId=details['id'];
          
          setTimeout(() => {
           this.placeorder();
          },1500) 
          this.paypalreurnData=[
            {
              transaction_id: details.id,
              country_code: details.payer.address.country_code,
              email_address: details.payer.email_address,
              name:  `${details.payer.name.given_name} ${details.payer.name.surname}`,
              customer_id_paypal: details.payer.payer_id,
              paypal_status: details.status,
            }
          ];
        });
      },
      onClientAuthorization: (data) => {
       // console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
      },
      onCancel: (data, actions) => {
      //  console.log('OnCancel', data, actions);
      },
      onError: err => {
      //  console.log('OnError', err);
      },
      onClick: (data, actions) => {
       // console.log('onClick', data, actions);
      },
    };

  }

  getpaymentoption(event)
  {

    if(event.target.value == 'COD')
    {
      this.paypalstatus=false;
    }
    let formData = this.checkoutForm.value;
    if(event.target.value == 'paypal' && this.useraddressslist.length > 0  && formData.userShippingAddressId != null  && formData.userBillingAddressId != null  )
    {
      this.paypalstatus=true;
    }
  }

  placeorder()
  {
    const currentUser = localStorage.getItem("user_id");
    if (currentUser) {
      
    if(this.products.length > 0)
  {



        let orderTotal=0;
        let paymentStatus="";
        let formData = this.checkoutForm.value;

        if(formData.paymentOption == 'COD')
        {
          paymentStatus="success";
          this.transactionId=uuidv4();
        }
        else
        {
          this.initConfig();
          paymentStatus="pending";
        }
        this.getTotal.subscribe(
          res =>
          {
            orderTotal=res
            
          }
        )

  let orderData={}

  if(formData.paymentOption == 'paypal')
  {
    orderData=
    {
      total_order_amount: orderTotal,
      order_status: 'initiated',
      payment_status: paymentStatus,
      payment_method: formData.paymentOption,
      transaction_id: this.transactionId,
      country_code: this.paypalreurnData[0].country_code,
      email_address: this.paypalreurnData[0].email_address,
      name: this.paypalreurnData[0].name,
      customer_id_paypal: this.paypalreurnData[0].customer_id_paypal,
      paypal_status: this.paypalreurnData[0].paypal_status,
      shipping_address_id: formData.userShippingAddressId,
      billing_address_id: formData.userBillingAddressId,
      billing_email: formData.email,
      billing_phone: formData.phone,
      cart_id: localStorage.getItem('cart_'),
    }
  }
  else if(formData.paymentOption == 'COD')
  {
    orderData=
  {
    total_order_amount: orderTotal,
    order_status: 'initiated',
    payment_status: paymentStatus,
    payment_method: formData.paymentOption,
    transaction_id: this.transactionId,
    country_code: "",
    email_address: formData.email,
    name: this.userFuyllName,
    customer_id_paypal: "",
    paypal_status: "",
    shipping_address_id: formData.userShippingAddressId,
    billing_address_id: formData.userBillingAddressId,
    billing_email: formData.email,
    billing_phone: formData.phone,
    cart_id: localStorage.getItem('cart_'),
  }
  }
  else
  {
    this.toaster.error('Please select a payment method')
    return;
  }

  for (const element of this.products) {
            
    this.productService.getproductsBySlugs(element.product_slug)
    .pipe(first())
    .subscribe({
    next: (v) => {
        let stock=(v.data.stock - element.quantity);

        if(stock < 0)
        {
          if(v.data.product_name)
          {
            this.toaster.error(`${v.data.product_name} is out of stock, please delete from cart to continue shoping`)
            this.router.navigateByUrl(`stores/${v.data.product_store.store_slug}/${v.data.product_department.department_slug}/${v.data.product_slug}`)
          }
        }
        else
        {
            return;
        }  
      },
      error: (e) => {
      },
      complete: () => console.info('Complete') 
      }
      );
}

this.orderService.userCreateOrder(orderData).subscribe(
  res =>
  {
    this.orderValid=true;
    this.orderMassage="Your Order Placed successfully";
    for(const elem of this.products)
    {
      this.productService.removeCartItem(elem);
    }
    this.userservice.setUserOrderid(res['data']._id);
    setTimeout(() => {
      this.router.navigateByUrl('/order/success');
    },1000) 
  },
  error => {
    // .... HANDLE ERROR HERE 
    this.toaster.error(error.error.message);
});

      }
    }
    else
    {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' }});
    }

  }

}
