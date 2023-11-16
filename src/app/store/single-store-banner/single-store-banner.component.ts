import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StoreService } from 'src/app/shared/services/store.service';
import { ActivatedRoute, Router} from '@angular/router';
import { of } from 'rxjs';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-single-store-banner',
  templateUrl: './single-store-banner.component.html',
  styleUrls: ['./single-store-banner.component.scss']
})
export class SingleStoreBannerComponent implements OnInit {

  store_slug:any
  public sliders = [];

  constructor(private router: Router, private route: ActivatedRoute, private homesliderservice: HomesliderService, private toaster: ToastrService) {

  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.store_slug = params['slug'];
    });

    let storeObj=
    {
      store_slug: this.store_slug
    }
    // get all home slider date from API
    this.homesliderservice.getallVendorSliderData(storeObj).subscribe(
      res =>
      {
        this.sliders=res.data;
        console.log('Banner res',res);
      },
      error => {
        this.toaster.error(error.error.message);
        this.router.navigateByUrl('/')
      }
    )

  }

}
