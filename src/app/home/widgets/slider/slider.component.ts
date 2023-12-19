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

  vandorbannerClick(v_id: any) {
    let data =
    {
      vendor_id: v_id
    }
    this.storeService.vendorstoredetails(data).subscribe(
      res => {
        let sdata =
        {
          vendor_id: v_id,
          store_id: res.data[0]._id
        }
        this.storeService.storeviewcount(sdata).subscribe(
          response => {
            window.open(`${environment.storeUrl}/${res.data[0].store_slug}/1`, "_self");
            console.log('res=================', res.data[0].store_slug)
          }
        )
      }
    )


  }

}
