import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss']
})
export class HeaderOneComponent implements OnInit {
  store_slug: any;
  @Input() class: string;
  @Input() themeLogo: string = 'assets/images/icon/logo_small_res.png'; // Default Logo
  @Input() topbar: boolean = true; // Default True
  @Input() sticky: boolean = false; // Default false
  public stick: boolean = false;
  vendorhome: boolean = false;
  isvendorlogoimage: boolean = false;

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event): void {
    event.preventDefault(); // Prevent default behavior (e.g., context menu)
    event.stopPropagation(); // Stop event propagation to parent elements
  }
  constructor(private router: Router, private route: ActivatedRoute, private storeService: StoreService, private toaster: ToastrService) { }

  ngOnInit(): void {

    // this.route.params.subscribe(params => {
    //   if (params['slug']) {
    //     this.store_slug = params['slug'];
    //   }
    //   else {
    //     // If no slug in the params (i.e., root route), use the default slug 'yunicbrightvision'
    //     this.store_slug = 'yunicbrightvision';
    //   }
    // });

    this.store_slug = localStorage.getItem('storeslug')
    
    if (this.store_slug) {

      let storeObj = {
        store_slug: this.store_slug
      };

      // get all home slider data from API
      this.storeService.vendorstoredetails(storeObj).subscribe(
        res => {
          console.log('every click run')
          localStorage.setItem('store3diamge', (res.data[0]?.store_glb_file) ? res.data[0]?.store_glb_file : '')
          console.log('every click run Local Value', localStorage.getItem('store3diamge'))
          if (res.data[0]?.is_logo) {
            if (res.data[0]?.logo) {
              this.themeLogo = res.data[0].logo
              this.isvendorlogoimage = true;
            }
            else {
              this.themeLogo = res.data[0]?.logo_name
              this.isvendorlogoimage = false;
            }
            this.vendorhome = true;
          }
          else {
            this.themeLogo = 'assets/images/icon/logo_small_res.png';
          }

        },
        error => {
          this.toaster.error(error.error.message);
          this.router.navigateByUrl('/');
        }
      );
    }
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (number >= 350 && window.innerWidth > 400) {
      this.stick = true;
    } else {
      this.stick = false;
    }
  }
  getSearchVAl(inputval: any) {
    console.log('Serarch String', inputval);
    this.router.navigateByUrl('/search?u=' + inputval);
  }
}
