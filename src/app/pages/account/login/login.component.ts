import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, Validator} from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/shared/services/product.service';
import { ProductNew } from 'src/app/shared/classes/product';

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

constructor(private formBuilder: FormBuilder, public userService: UserService, private router: Router,private route: ActivatedRoute, public product_service: ProductService) { }

ngOnInit(): void {

  const currentUser = localStorage.getItem("user_id");
  if (currentUser) {
    this.router.navigate(['/pages/dashboard'])
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
      this.loginMassage="Login sucessfull";
/////////////////////////////////////////////////////////


//Cart Details
///////////////////////////////////////////////////////////
const currentUser = localStorage.getItem("user_id");

if (currentUser) {
  console.log('User Login');

const cartItems_local = localStorage.getItem('cartItems');

console.log('Local storage check',cartItems_local);

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
              localStorage.setItem("cartItems", JSON.stringify(this.cartproducts));
              console.log('Return LocalStorage',localStorage.getItem("cartItems"));
              
            })                          
          
      }
    }
      
    }
    )

}
else
{
  console.log('User Not Login');
}



/////////////////////////////////////////////////////////   
      setTimeout(() => {
        if(this.returnUrl !="/")
        {
        // login successful so redirect to return url
        this.router.navigateByUrl(this.returnUrl)
        .then(() => {
            window.location.reload();
        });
        }
        else
        {
          
        this.router.navigate(['/pages/dashboard'])
        .then(() => {
            window.location.reload();
        });
      }
      },2000)  
    },
    error => {
      // .... HANDLE ERROR HERE 
      console.log(error.message);
      this.loginValid=false;
      this.loginInValid=true;
      this.loginMassage="Username and Password does not match";
  }
  );
  
  }

}
