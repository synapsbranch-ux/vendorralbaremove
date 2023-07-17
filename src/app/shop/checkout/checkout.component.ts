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

  constructor(private fb: FormBuilder,
    public productService: ProductService,private userservice: UserService,
    private orderService: OrderService, private route: ActivatedRoute,private router: Router, private toaster : ToastrService) { 

  }

  ngOnInit(): void {
    this.local_checkout_obj=JSON.parse(localStorage.getItem('checkoutform'));
    if(this.local_checkout_obj)
    {
      this.email_=this.local_checkout_obj['email_address'];
      this.phone_=this.local_checkout_obj['phone_no'];
      this.country_=this.local_checkout_obj['country_name'];
      this.first_name_=this.local_checkout_obj['first_name'];
      this.last_name_=this.local_checkout_obj['last_name'];
      this.street_address_=this.local_checkout_obj['street_address'];
      this.street_address2_=this.local_checkout_obj['street_address2'];
      this.city_name_=this.local_checkout_obj['city_name'];
      this.state_name_=this.local_checkout_obj['state_name'];
      this.zip_code_=this.local_checkout_obj['zip_code'];
      

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
      'firstname': new FormControl(null, [Validators.required]),
      'lastname': new FormControl(null, [Validators.required]),
      'phone': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      'address1': new FormControl(null, [Validators.required]),
      'address2': new FormControl(null),
      'country': new FormControl(null, [Validators.required]),
      'town': new FormControl(null, [Validators.required]),
      'state': new FormControl(null, [Validators.required]),
      'postalcode': new FormControl(null, [Validators.required]),
      'paymentOption': new FormControl(null),
      'userAddressId': new FormControl(null, [Validators.required]),
    })
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
  country_name: (<HTMLInputElement>document.getElementById('country_name')).value,
  first_name: (<HTMLInputElement>document.getElementById('first_name')).value,
  last_name: (<HTMLInputElement>document.getElementById('last_name')).value,
  street_address: (<HTMLInputElement>document.getElementById('street_address')).value,  
  street_address2: (<HTMLInputElement>document.getElementById('street_address2')).value,
  city_name: (<HTMLInputElement>document.getElementById('city_name')).value,
  state_name: (<HTMLInputElement>document.getElementById('state_name')).value,
  zip_code: (<HTMLInputElement>document.getElementById('zip_code')).value,
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
    if(event.target.value == 'paypal' && this.useraddressslist.length > 0 && formData.firstname !="" && formData.lastname !="" && formData.phone !="" && formData.email !="" && formData.address1 !="" && formData.country !="" && formData.town !="" && formData.state !=""  && formData.postalcode !=""  && formData.userAddressId != null )
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

      let orderProducts : Object[]=[];

      for(const elem of this.products)
      {
        let odetails= {
          product_id: elem._id,
          product_name: elem.product_name,
          product_image: elem.product_image[0].pro_image,
          product_slug: elem.product_slug,
          qty: elem.quantity,
          price: elem.product_sale_price,
          addons: elem.addons,
          addonsprice: elem.addonsprice
        }
        orderProducts.push(odetails);
      }

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
  }
  else
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
    name: formData.firstname+' '+formData.lastname,
    customer_id_paypal: "",
    paypal_status: "",
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

          let address_arr={
            email_address: formData.email,
            phone_no: formData.phone,
            country_name: formData.country,
            first_name: formData.firstname,
            last_name: formData.lastname,
            street_address: formData.address1, 
            street_address2: formData.address2,
            city_name: formData.town,
            state_name: formData.state,
            zip_code: formData.postalcode,
          }
          localStorage.setItem('checkoutform',JSON.stringify(address_arr))
          this.orderService.userCreateOrder(orderData).subscribe(

            res =>
            {
              this.orderValid=true;
              this.orderMassage="Your Order Placed Sucessfully";
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
      },
      error: (e) => {
      },
      complete: () => console.info('Complete') 
      }
      );
}



      }
    }
    else
    {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' }});
    }

  }

}
