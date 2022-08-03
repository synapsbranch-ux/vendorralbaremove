import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Userlogin } from './../../../shared/classes/userslogin';
import { UserAddress } from './../../../shared/classes/user';
import { UserService } from 'src/app/shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  //public useraddressclass: UserAddress[] = [];
  public openDashboard: boolean = false;
  userName:string="";
  userEmail:string="";
  userPhone:string="";
  userData: JSON;
  public useraddressslist:any =[];
  addressMassage:string=""
  form: FormGroup;
  isValid: boolean = false;
  submitMassage:any;
  returnUrl:string;


  constructor( private router: Router, private userservice: UserService, private route: ActivatedRoute) { 
    
  }

  ngOnInit(): void {
    this.addressMassage="Add New Address";
    this.getallAddressList();
    this.form =  new FormGroup({
      'userfullname': new FormControl(null, [Validators.required]),
      'addressline1': new FormControl(null, [Validators.required]),
      'addressline2': new FormControl(null),
      'city': new FormControl(null, [Validators.required]),
      'state': new FormControl(null, [Validators.required]),
      'postalCode': new FormControl(null, [Validators.required]),
      'telephone': new FormControl(null, [Validators.required]),
    })

      // get return url from route parameters or default to '/'
  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  getallAddressList()
  {
    this.userservice.getAllAddress().subscribe(
      res =>
      {
        this.useraddressslist=res['data'];
        console.log('User Address List', res['data']);
      }
    )
  }
  editAddress(address_id:any)
  {
    //this.useraddressclass['id']= address_id;
    //console.log('Address Edit', this.useraddressclass['id'])
    this.userservice.setUserAddressid(address_id);
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  logout()
  {
    this.userservice.logout();
  }
  setDefaultAddress(val:any, address_id:any)
  {
    let Ddata=
    {
      "address_id": address_id,
      "is_default": String(val)
    }

    this.userservice.setDefaultAddress(Ddata).subscribe(
      res =>
      {
        console.log('Default Set',res['data']);
        this.getallAddressList();
      }
    )
  }

  get userfullname() { return this.form.get('userfullname'); }
  get addressline1() { return this.form.get('addressline1');}
  get addressline2() { return this.form.get('addressline2'); }
  get city() { return this.form.get('city');}
  get state() { return this.form.get('state');}
  get postalCode() { return this.form.get('postalCode');}
  get telephone() { return this.form.get('telephone');}

  onSubmit()
  {
    let formData = this.form.value;
    let EdData={
      "user_full_name": formData.userfullname,
      "addressline1": formData.addressline1,
      "addressline2": formData.addressline2,
      "city": formData.city,
      "postal_code": formData.postalCode,
      "mobile": formData.telephone,
      "state": formData.state,
 }
 console.log('Send Updaate Address',EdData)
 this.userservice.addNewAddress(EdData).subscribe(
  res =>
  {
    this.isValid=true;
    this.submitMassage="Address Sucessfully Added";            
    this.getallAddressList();
    setTimeout(() => {
      if(this.returnUrl)
      {
      // login successful so redirect to return url
      this.router.navigateByUrl(this.returnUrl)
      }
      else
      {
        this.router.navigate(['/address'])
        .then(() => {
          this.form.reset();
          this.isValid=false;
        });
      }

    },2000) 
    console.log('User Address Update',res);
  }
)

  }

}
