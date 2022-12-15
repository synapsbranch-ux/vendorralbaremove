import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserAddress } from './../../../shared/classes/user';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.scss']
})
export class EditAddressComponent implements OnInit {
  //public useraddressclass: UserAddress[] = [];
  public openDashboard: boolean = false;
  userData: JSON;
  public useraddressslist:any =[];
  addressMassage:string=""
  form: FormGroup;
  fullname:any;
  address1:any;
  address2:any;
  cityname:any;
  statename:any;
  postal_code:any;
  telephone_num:any
  is_defaultval:any
  isValid: boolean = false;
  submitMassage:any;

  constructor( private router: Router, private userservice: UserService, private toastr: ToastrService) { 
    if(!this.userservice.getUserAddressid())
    {
      this.router.navigate(['/address'])
    }
  }

  ngOnInit(): void {
    this.addressMassage="Edit Address";
    this.getAddressDetails();

    this.form =  new FormGroup({
      'userfullname': new FormControl(null, [Validators.required]),
      'addressline1': new FormControl(null, [Validators.required]),
      'addressline2': new FormControl(null),
      'city': new FormControl(null, [Validators.required]),
      'state': new FormControl(null, [Validators.required]),
      'postalCode': new FormControl(null, [Validators.required]),
      'telephone': new FormControl(null, [Validators.required]),
      'defaultstatus': new FormControl(null, [Validators.required]),
    })
let lData=
{
  "address_id": this.userservice.getUserAddressid()
}
this.userservice.getSingleAddressDetails(lData).subscribe(
  res =>
  {
    this.fullname=res['data'][0].user_full_name;
    this.address1=res['data'][0].addressline1;
    this.address2=res['data'][0].addressline2;
    this.cityname=res['data'][0].city;
    this.statename=res['data'][0].state;
    this.postal_code=res['data'][0].postal_code;
    this.telephone_num=res['data'][0].mobile;
    this.is_defaultval=res['data'][0].is_default;
  }
)
  }
  getAddressDetails()
  {
    let daDAta=
    {
      
    }
    this.userservice.getSingleAddress(daDAta).subscribe(
      res =>
      {
        this.useraddressslist=res['data'];
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
  get defaultstatus() { return this.form.get('defaultstatus');}


  editAddress(address_id:any)
  {
    UserAddress.setID(address_id)
    this.router.navigate(['/login'])
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  logout()
  {
    this.userservice.logout();
  }

  onSubmit()
  {
    let formData = this.form.value;
    let EdData={
      "address_id": this.userservice.getUserAddressid(),
      "user_full_name": formData.userfullname,
      "addressline1": formData.addressline1,
      "addressline2": formData.addressline2,
      "city": formData.city,
      "postal_code": formData.postalCode,
      "mobile": formData.telephone,
      "state": formData.state,
      "is_default": formData.defaultstatus
 }
 this.userservice.userUpdateAddress(EdData).subscribe(
   res =>
   {
     this.toastr.success("Address Sucessfully Updated");            
     setTimeout(() => {
      this.router.navigate(['/address'])
      .then(() => {
        window.location.reload();
      });
    },2000)  
   },
   error => {
     // .... HANDLE ERROR HERE 
     this.toastr.error(error.error.message)
}
 )

  }

}
