import { Component, OnInit, Input } from '@angular/core';
import { LogoSlider } from '../../../shared/data/slider';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {

  @Input() brands: any[] = [];
  store_slug: any

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.store_slug = params['slug'];
    });

  }

  public LogoSliderConfig: any = LogoSlider;

  viewResults(keyname: any) {

    if (keyname != 'all') {
      localStorage.setItem('brand', keyname)
    }
    this.router.navigate([`/store-2d-products/${this.store_slug}/all`]);

  }
  

}
