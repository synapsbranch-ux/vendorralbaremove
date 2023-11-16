import { Router } from '@angular/router';
import { StoreService } from 'src/app/shared/services/store.service';
import { UserService } from './../../../shared/services/user.service';
import { Component, OnInit, Input } from '@angular/core';
import { HomeSlider } from '../../../shared/data/slider';
import { environment } from 'src/environments/environment';

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


  public ImageSrc: string

  public stores;

  storename: string
  storeslug: string
  storeimgUrl: any
  store_slug: any
  vendor_id: any
  store_id: any;

  StoreLists = [];

  DepartmentsList = [];

  departmentmsg: any

  roomavailablity = [];
  envstore: any
  constructor(private userservice: UserService, private storeService: StoreService, private router: Router) { }

  ngOnInit(): void {

    this.envstore = environment.storeUrl;

  }

  public HomeSliderConfig: any = HomeSlider;

  vandorbannerClick(vendorid: any) {
    let VData =
    {
      vendor_id: vendorid
    }

    this.userservice.userVendorRoomCount(VData).subscribe(
      res => {
        this.storeclick(vendorid, res['data']);
      }
    )
  }


  storeclick(vendorid: any, roomno: any) {
    this.storeService.getStoresMore.subscribe(response => {
      console.log('Single Store response  =>', response);
      this.StoreLists = response['data'];
      const child = this.StoreLists.map((store_l) => {
        console.log('Store Vendor id API', store_l.store_owner._id);
        console.log('Store Vendor id', vendorid);
        if (store_l.store_owner._id == vendorid) {
          this.storename = store_l.store_name;
          this.storeslug = store_l.store_slug;
          this.storeimgUrl = store_l.store_image;
          this.vendor_id = store_l.store_owner._id;
          this.store_id = store_l._id;
          let sdata = {
            "store_id": this.store_id,
            "vendor_id": this.vendor_id
          }
          // store view count 
          this.storeService.storeviewcount(sdata).subscribe(
            res => {
              window.open(`${environment.storeUrl}/?s_slug=${this.storeslug}`, "_self");
            }
          )
          return store_l.store_department;
        }
      });
    });

  }

}
