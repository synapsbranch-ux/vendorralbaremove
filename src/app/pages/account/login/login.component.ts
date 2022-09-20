import { element } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, Validator} from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/shared/services/product.service';
import { ProductNew } from 'src/app/shared/classes/product';
import { ToastrService } from 'ngx-toastr';

const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
selector: 'app-login',
templateUrl: './login.component.html',
styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

loginMassage:string="";
loginValid: boolean = false;
loginInValid: boolean = false;
form : FormGroup;
submitted= false;
returnUrl:string;

cartproducts=[];
product_img:any;
public products: ProductNew[] = [];

constructor(private formBuilder: FormBuilder, public userService: UserService, private router: Router,private route: ActivatedRoute, public product_service: ProductService, private toaster: ToastrService) { }

ngOnInit(): void {

  console.log('Cart Item From Login',state.cart)
  this.cartproducts=state.cart;

// if login then redirect dashboard
  const currentUser = localStorage.getItem("user_id");
  if (currentUser) {
    this.router.navigate(['/dashboard'])
  }

  this.form = new FormGroup({
    'phone_email': new FormControl(null, [Validators.required]),
    'login_password': new FormControl(null, [Validators.required])
  });

  // get return url from route parameters or default to '/'
  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';


}

get phone_email(){ return this.form.get('phone_email');}
get login_password(){ return this.form.get('login_password');}

  onSubmit(): void {
  this.submitted = true;
  if (this.form.invalid) {
    return;
  }
  let formData = this.form.value;
  console.log(JSON.stringify(this.form.value, null, 2));
  let data = {
    'email_phone': formData.phone_email,
    'password': formData.login_password,
  }
  this.userService.userLogin(data).subscribe(
    res => {

      console.log(' Login Success',res);
      localStorage.setItem('user_id', res['data'].user_id);
      localStorage.setItem('user_token', res['data'].token);
      localStorage.setItem('currentUser', JSON.stringify(res));

      this.loginValid=true;
      this.loginInValid=false;
      // this.loginMassage="Login sucessfull";
      this.toaster.success('Login sucessfull');
/////////////////////////////////////////////////////////


//Cart Details
///////////////////////////////////////////////////////////

  console.log('User Login');
  console.log('Cart Item before Add From Login',this.cartproducts)
  this.product_service.allCartProducts().subscribe(
    res =>{
      console.log('Return Cart',res);
      if(res['data'])
      {
        let bodydata=res['data'];
        if(bodydata.hasOwnProperty('products'))
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
                "cart_id": res['data']._id,
                "product_name": element.pro_name,
                "product_slug": element.pro_slug,
                "quantity": element.qty,
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
            console.log('Return LocalStorage',localStorage.getItem("cartItems"));
            
          })                          
        
    }
  }
  }
    
  }
  )

    setTimeout(() => {
    if(this.returnUrl != '/')
    {
      console.log('this.returnUrl Yes==========>',this.returnUrl);
    // login successful so redirect to return url
    this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.returnUrl]);
  }) 
    }
    else
    {
      console.log('this.returnUrl No==========>',this.returnUrl);
      this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
        this.router.navigate(['dashboard']);
    }) 
    .then(() => {
        window.location.reload();
    });
  }
  console.log('Return LocalStorage',localStorage.getItem("cartItems"));
  console.log('state.cart After Login',state.cart)
  },2500) 

    },
    error => {
      // .... HANDLE ERROR HERE 
      console.log(error.message);
      this.loginValid=false;
      this.loginInValid=true;
      // this.loginMassage="Username and Password does not match";
      this.toaster.error('Username and Password does not match');
  }
  );
  
  }

}
