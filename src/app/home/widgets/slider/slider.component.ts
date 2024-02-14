import { ActivatedRoute, Router } from '@angular/router';
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
  constructor(private userservice: UserService, private storeService: StoreService, private router: Router, private route:ActivatedRoute) {
   }

  ngOnInit(): void {
    this.envstore = environment.storeUrl;
    this.route.paramMap.subscribe(params => {
      // Extract the 'slug' and 'page' values from the route parameters
      this.store_slug = params.get('slug');
    });
  }

  public HomeSliderConfig: any = HomeSlider;

  vandorbannerClick(catDetails: any) {
    console.log('catDetails ------------------',catDetails);
    this.router.navigateByUrl(`/store-2d-products/${this.store_slug}/${catDetails.category_slug}`)
  }

}
