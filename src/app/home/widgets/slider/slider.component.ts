import { Router } from '@angular/router';
import { StoreService } from 'src/app/shared/services/store.service';
import { UserService } from './../../../shared/services/user.service';
import { Component, OnInit, Input } from '@angular/core';
import { HomeSlider } from '../../../shared/data/slider';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  
  @Input() sliders: any[];
  @Input() class: string;
  @Input() textClass: string;
  @Input() category: string;
  @Input() buttonText: string;
  @Input() buttonClass: string;


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

  constructor(private userservice : UserService, private storeService: StoreService, private router: Router ) { }

  ngOnInit(): void {



  }

  public HomeSliderConfig: any = HomeSlider;

  vandorbannerClick(vendorid:any)
  {
    let VData=
    {
      vendor_id: vendorid
    }

    this.userservice.userVendorRoomCount(VData).subscribe(
      res =>
      {
        this.storeclick(vendorid,res['data']);
        //console.log('Vendor Room Count',res['data'])
      }
    )

      //console.log('Vendor Banner Click',vendorid)
  }


  storeclick(vendorid:any,roomno:any)
  {
    this.storeService.getStoresMore.subscribe(response => {
      console.log('Single Store response  =>', response);
      this.StoreLists=response['data'];
      const child = this.StoreLists.map((store_l) => {
        console.log('Store Vendor id API',store_l.store_owner._id);
        console.log('Store Vendor id',vendorid);
        if(store_l.store_owner._id == vendorid){    
          this.storename=store_l.store_name;
          this.storeslug=store_l.store_slug;
          this.storeimgUrl=store_l.store_image;
          this.vendor_id=store_l.store_owner._id;
          this.store_id=store_l._id;
          return store_l.store_department;
        }
      });

      const filterItem = child.filter(item => item != undefined);
      //console.log('Department List Filter ==',filterItem);
      if(filterItem.length > 0){
        this.DepartmentsList=filterItem[0];

        if(!this.DepartmentsList.length)
        {
          this.departmentmsg="No Department Register Here";
        }
        if(roomno > 1)
        {
            this.router.navigateByUrl(`/stores/${this.storeslug}`)
            //console.log('this.storeslug ==>',this.storeslug)
        }
        else
        {
          window.open("https://store.ralbatech.com/banner/"+this.storeslug+"/"+this.DepartmentsList[0].department_slug ,"_self");
          //console.log('this.storeslug ==>',this.storeslug)
          //console.log('this.DepartmentsList[department_slug] ==>',this.DepartmentsList[0].department_slug)
        }
      //console.log('Department list ====',this.DepartmentsList);
      }

    });

  }

}
