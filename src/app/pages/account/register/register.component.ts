import { ToastrService } from 'ngx-toastr';
import { ProductService } from './../../../shared/services/product.service';
import { ProductNew } from './../../../shared/classes/product';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl, Validator} from '@angular/forms';
import { UserService } from 'src/app/shared/services/user.service';
import { Otp } from 'src/app/shared/classes/otp';

import Validation from '../utils/validation';
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';

// @ts-check
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  otpMassage:string="";
  signupMassage:string="";
  otpValid: boolean = true;
  phValid: boolean = true;
  isValid: boolean = false;
  form: FormGroup;
  submitted = false;
  callForOtp = false;
  userOtp;
  getOtpVal:any;
  public otp: Otp[] = [];
  cartproducts=[];
  product_img:any;
  public products: ProductNew[] = [];
  countDown: Subscription;
  counter = 75;
  tick = 1000;
  otpTimerstatus:boolean=false;


  constructor(private fromBuilder: FormBuilder, public userService: UserService, private router: Router, private product_service: ProductService, private toastr: ToastrService) { }
  
  showOtpComponent = true;

  ngOnInit(): void {
     this.form =  new FormGroup({
        'fname': new FormControl(null, [Validators.required]),
        'lname': new FormControl(null, [Validators.required]),
        'email': new FormControl(null, [Validators.required, Validators.email]),
        'password': new FormControl(null, [Validators.required, Validators.minLength(8), Validators.maxLength(16)]),
        'repeat_password': new FormControl(null, [Validators.required]),
        'phone': new FormControl(null, [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(12)]),

      },
       {
        validators: [Validation.match('password', 'repeat_password')]
       }
      );
  }

  otpTimer()
  {
    this.countDown = timer(0, this.tick)
    .pipe(take(this.counter))
    .subscribe(() => {
      --this.counter;
      // console.log(this.counter);
      if (this.counter == 0) {
        this.countDown.unsubscribe();
      }
    });
  }

  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return (
      ('00' + minutes).slice(-2) +
      ':' +
      ('00' + Math.floor(value - minutes * 60)).slice(-2)
    );
  }

  get fname() { return this.form.get('fname'); }
  get lname() { return this.form.get('lname');}
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password');}
  get repeat_password() { return this.form.get('repeat_password'); }
  get phone() { return this.form.get('phone');}
  //get otp() {return this.form.get('otp')}

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    
    
    let formData = this.form.value;
    let fullname=formData.fname+ ' '+formData.lname
    if(this.callForOtp==false){
      this.counter = 75;
      this.otpTimerstatus=true;
      this.otpTimer();
      let otpObj=
      {'phone':formData.phone,
      'name':fullname,
      'email':formData.email,
      'type': 'SignUp'
      }

      this.userService.genOtp(otpObj).subscribe(
        res => {
          if(res['error'] == 0){
            this.callForOtp = true;
            this.showDiv.otp = true;
            this.phValid=true;
            this.showDiv.signUpDiv = false;
            this.getOtpVal = res['data'].otpValue;
            console.log(res);
            this.toastr.success('OTP have been send to your register Email please Check');
          }
        },
        error => {
          // .... HANDLE ERROR HERE 
          this.toastr.error(error.error.message)
          console.log('OTP validate Error',error);
          this.phValid=false;
          // this.signupMassage=error.error.message;
          this.showDiv.signUpDiv = true;
          this.showDiv.otp = false;
     });
    }
  }

  showDiv = {
    signUpDiv : true,
    otp : false,
  }



  otpverify()
  {

    if(this.userOtp){
      let formData = this.form.value;
      let data = {
        'name': formData.fname+' '+formData.lname,
        'email': formData.email,
        'password': formData.password,
        'repeat_password': formData.repeat_password,
        'phone': formData.phone,
        'otp': this.userOtp
      }
      this.userService.userSignUp(data).subscribe(
        res => {

          this.loginfn(formData.email,formData.password);

          console.log(' Signup Success',res);
          this.toastr.success('OTP sucessfully Verified. Loging...')
          this.otpValid=true;
          this.isValid = true;
          // this.signupMassage="Your Registration sucessfull";

          setTimeout(() => {
            this.router.navigate(['/dashboard'])
            .then(() => {
              window.location.reload();
            });
          },3000)          
        },
        error => {
          // .... HANDLE ERROR HERE 
          console.log(error.message);
          this.toastr.error(error.message)
          //this.otpMassage=error.message;
          this.otpValid=false;
     }
      );
    }else{
        console.log('Please enter OTP first');
        this.toastr.error('Please enter OTP first')
       // this.otpMassage="Please enter OTP first";
        this.otpValid=false;
    }
  }

  otpresend()
  {
    console.log('Resend OTP')
    let formData = this.form.value;
    let fullname=formData.fname+ ' '+formData.lname
      this.counter = 75;
      this.otpTimerstatus=true;
      this.otpTimer();
      let otpObj=
      {'phone':formData.phone,
      'name':fullname,
      'email':formData.email,
      'type': 'SignUp'
      }

      this.userService.genOtp(otpObj).subscribe(
        res => {
          if(res['error'] == 0){
            this.callForOtp = true;
            this.showDiv.otp = true;
            this.phValid=true;
            this.showDiv.signUpDiv = false;
            this.getOtpVal = res['data'].otpValue;
            console.log(res);
            this.toastr.success('OTP have been send to your register Email please Check');
          }
        },
        error => {
          // .... HANDLE ERROR HERE 
          this.toastr.error('Phone number already exist')
          console.log('OTP validate Error',error.message);
          this.phValid=false;
          this.signupMassage="Phone number already exist";
          this.showDiv.signUpDiv = true;
          this.showDiv.otp = false;
     });
  }

  loginfn(username: any, password:any)
  {
    let data = {
      'email_phone': username,
      'password': password,
    }
    this.userService.userLogin(data).subscribe(
      res => {
  
        console.log(' Login Success',res);
        localStorage.setItem('user_id', res['data'].user_id);
        localStorage.setItem('user_token', res['data'].token);
        localStorage.setItem('currentUser', JSON.stringify(res));

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
      },
      error => {
        // .... HANDLE ERROR HERE 
        console.log(error.message);
    }
    );
  }

  onOtpChange(ele){
    this.userOtp = ele;
  }
}
