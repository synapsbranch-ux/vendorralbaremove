import { UserService } from 'src/app/shared/services/user.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { json } from 'express';

@Component({
  selector: 'app-dashboard',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  public openDashboard: boolean = false;
  userName:string="";
  userEmail:string="";
  userPhone:string="";
  userData: JSON;
  form: FormGroup;
  isValid: boolean = false;
  signupMassage:string="";

  constructor( private router: Router, private userservice: UserService) { 
    
  }

  ngOnInit(): void {
    let obj = JSON.parse(localStorage.getItem('currentUser'));
    console.log(obj);


    this.form =  new FormGroup({
      'fname': new FormControl(null, [Validators.required]),
      'emailid': new FormControl(null, [Validators.required, Validators.email]),
      'phonenum': new FormControl(null, [Validators.required, Validators.pattern('[0-9]*')]),

    })

   this.userservice.getUserDetails().subscribe(
     res =>
     {
      this.userName= res['data'][0].name;
      this.userEmail= res['data'][0].email;
      this.userPhone= res['data'][0].phone;
       console.log('User Details ',res['data'][0]);
     }
   )

  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  get fname() { return this.form.get('fname'); }
  get emailid() { return this.form.get('email'); }
  get phonenum() { return this.form.get('phone');}

  logout()
  {
    this.userservice.logout();
  }

  onSubmit(): void {

    let formData = this.form.value;
    let EdData={
      "name": formData.fname,
      "phone": formData.phonenum
 }
 console.log('Send Update',EdData)
 this.userservice.userUpdateProdile(EdData).subscribe(
   res =>
   {
     this.isValid=true;
     this.signupMassage="User Sucessfully Updated";            
     setTimeout(() => {
      this.router.navigate(['/dashboard'])
    },2000)  
     console.log('User Update',res);
   }
 )
  }

}
