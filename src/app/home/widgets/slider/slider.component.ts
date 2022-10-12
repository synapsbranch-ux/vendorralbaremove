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

  constructor(private userservice : UserService) { }

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
        console.log('Vendor Room Count',res['data'])
      }
    )

      console.log('Vendor Banner Click',vendorid)
  }

}
