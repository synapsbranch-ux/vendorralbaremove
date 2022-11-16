import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StoreService } from 'src/app/shared/services/store.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';

@Component({
  selector: 'app-product-box-one',
  templateUrl: './single-store.component.html',
  styleUrls: ['./single-store.component.scss']
})
export class SingleStoreComponent implements OnInit {

  public ImageSrc : string

  public stores;

  storename:string
  storeslug:string
  storeimgUrl:any
  store_slug:any
  vendor_id:any
  store_id:any;

  StoreLists=[];

  DepartmentsList=[];

  departmentmsg:any

  roomavailablity=[];


  constructor( private storeService: StoreService , private route: ActivatedRoute, private homesliderservice: HomesliderService ) { 
    this.storeService.getStoresMore.subscribe(response => {
      console.log('Single Store response  =>', response);
      this.StoreLists=response['data'];
      const child = this.StoreLists.map((store_l) => {
        if(store_l.store_slug == this.store_slug){    
          this.storename=store_l.store_name;
          this.storeslug=store_l.store_slug;
          this.vendor_id=store_l.store_owner._id;
          this.store_id=store_l._id;
          this.storeImageBanner(this.vendor_id);
          return store_l.store_department;
        }
      });

      console.log('Store ID ======>',this.store_id);

      let sdata={
        "store_id": this.store_id,
        "vendor_id": this.vendor_id
      }
      console.log('Sending Store Data',sdata);
      this.storeService.storeviewcount(sdata).subscribe(
        res =>
        {
          console.log('Store View API ==',res['data']);
        }
      )

      const filterItem = child.filter(item => item != undefined);
      console.log('Department List Filter ==',filterItem);
      if(filterItem.length > 0){
        this.DepartmentsList=filterItem[0];

        if(!this.DepartmentsList.length)
        {
          this.departmentmsg="No Department Register Here";
        }

        for(let [index, element] of this.DepartmentsList.entries())
        {

console.log('For Department -==',index);
let rdata={
  "department_id": element._id,
  "vendor_id": this.vendor_id
}
this.storeService.roomAvailableCheck(rdata).subscribe(
  res =>
  {
    console.log('room API ==',res['data']);
    if(res['data'].room_name)
    {
      this.roomavailablity[index] = 'false';
    console.log('false ===', res['data'].room_name);
    }
    else
    {
      this.roomavailablity[index] = 'true';
    }
  }
)

        }
      console.log('Department list ====',this.DepartmentsList);
      console.log('Room Availble === ',this.roomavailablity);
      }

    });

  }

  ngOnInit() {
   
    this.route.params.subscribe(params => {      
      this.store_slug=params['slug'];
    });



  }

  stordepartment(department_slug,room_status)
  {
    if(room_status == 'false')
    {
      console.log('Department Slug',department_slug);
      window.open("https://store.ralbatech.com/store/"+this.storeslug+"/"+department_slug ,"_self");
      // window.open("https://store.ralbatech.com/?d_id="+department_slug+"&v_id="+this.vendor_id , "_blank");
    }

  }

  storeImageBanner(v_id)
  {
    let SData=
    {
      vendor_id : v_id
    }
    this.homesliderservice.getallVendorSliderData(SData).subscribe(
      res =>
      {
         this.storeimgUrl= res.data[0].banner_background_image;
      }
    )
  }


}
