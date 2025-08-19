import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StoreService } from 'src/app/shared/services/store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/shared/services/product.service';
import { CriptoService } from 'src/app/shared/services/cripto.service';

@Component({
  selector: 'app-single-store-banner',
  templateUrl: './single-store-banner.component.html',
  styleUrls: ['./single-store-banner.component.scss']
})
export class SingleStoreBannerComponent implements OnInit {
  @Input() currency: any = this.productService.Currency; // Default Currency 
  public ImageSrc: string
  store_slug: any
  public sliders = [];
  categories: any
  allProducts: any[] = [];
  menProducts: any[] = [];
  womenProducts: any[] = [];
  unisexProducts: any[] = [];
  pradaProducts: any[] = [];
  gucciProducts: any[] = [];
  coachProducts: any[] = [];
  newArrivalProducts: any[] = [];
  is2Dshow: boolean = false;
  // Logo
  public brands = [];
  public home_brands = [];
  //// for 2D products
  public tagListData = [];
  public mediaTextData = [];
  currentPage = 1;

  constructor(private router: Router, private route: ActivatedRoute, private homesliderservice: HomesliderService, private toaster: ToastrService, private productService: ProductService, private toastr: ToastrService, private criptoService: CriptoService) {

  }

  ngOnInit() {
    // this.getAllBrands();
    if (localStorage.getItem('top_brands')) {
      this.brands = JSON.parse(localStorage.getItem('top_brands'));
    }

    if (localStorage.getItem('home_brands')) {
      this.home_brands = JSON.parse(localStorage.getItem('home_brands'));
    }

    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.store_slug = params['slug'];
        localStorage.setItem('storeslug', this.store_slug)
      } else {
        // If no slug in the params (i.e., root route), use the default slug 'yunicbrightvision'
        this.store_slug = 'yunicbrightvision';
        localStorage.setItem('storeslug', this.store_slug)
      }
    });

    let storeObj =
    {
      store_slug: this.store_slug
    }
    // get all home slider date from API
    this.homesliderservice.getallVendorSliderData(storeObj).subscribe(
      res => {
        this.sliders = res.data;
      },
      error => {
        this.toaster.error(error.error.message);
        this.router.navigateByUrl('/')
      }
    );
    this.productService.getallEyeGlassCategoryWithSubcat().subscribe(
      res => {
        this.categories = res['data'][0];
        this.fetchAllProducts();
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    this.tagList();
    this.testMediaSectionList(this.store_slug)
  }

  // getAllBrands() {
  //   this.productService.getHomeBrands().subscribe(
  //     res => {
  //       this.brands = res['data'];
  //     },
  //     error => {
  //       // .... HANDLE ERROR HERE 
  //       this.toastr.error(error.error.message)
  //     });
  // }


  fetchAllProducts() {
    const prodObj = {
      "store_slug": this.store_slug
    };

    this.productService.getHomeFilteredProduct(prodObj).subscribe(
      res => {
        this.allProducts = res['data'];
        this.filterProducts();
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.success(error.error.message);
        this.router.navigateByUrl('/')
      }
    );
  }

  tagList() {
    this.productService.gettagList().subscribe(
      res => {
        this.tagListData = res['data'];
        console.log(this.tagListData )
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.success(error.error.message);
      }
    );
  }

  testMediaSectionList(store_slug: any) {
    this.productService.gettestMediaSection(store_slug).subscribe(
      res => {
        this.mediaTextData = res['data'];
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.success(error.error.message);
      }
    );
  }

  getTagsProducts(tag: any) {
    const encryptedTag = this.criptoService.encryptParam(tag._id);
    
    // Navigate with encrypted query params
    this.router.navigate([`/all-products/${this.store_slug}/all`], {
      queryParams: {
        cat: this.criptoService.encryptParam(''),   // Encrypt the empty value
        brand: this.criptoService.encryptParam(''), // Encrypt the empty value
        tag: encryptedTag                           // Encrypt the tag ID
      }
    });
  }

  showAllProducts() {
    // Navigate with empty encrypted query params
    this.router.navigate([`/all-products/${this.store_slug}/all`], {
      queryParams: {
        cat: this.criptoService.encryptParam(''),
        brand: this.criptoService.encryptParam(''),
        tag: this.criptoService.encryptParam('')
      }
    });
  }

  filterProducts() {
    const menCategoryId = this.categories.find(cat => cat.category_name === 'Men')?.category_id;
    const womenCategoryId = this.categories.find(cat => cat.category_name === 'Women')?.category_id;
    const unisexCategoryId = this.categories.find(cat => cat.category_name === 'Unisex')?.category_id;
    if (this.allProducts.length > 0) {
      this.menProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_sub_categories.some(subCat => subCat.child_category_id === menCategoryId)
      ), 4);

      this.womenProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_sub_categories.some(subCat => subCat.child_category_id === womenCategoryId)
      ), 4);

      this.unisexProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_sub_categories.some(subCat => subCat.child_category_id === unisexCategoryId)
      ), 4);

      this.pradaProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_brand && product.product_brand.brand_name.toUpperCase() === 'PRADA'
      ), 4);

      this.gucciProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_brand && product.product_brand.brand_name.toUpperCase() === 'GUCCI'
      ), 4);

      this.coachProducts = this.getRandomItems(this.allProducts.filter(product =>
        product.product_brand && product.product_brand.brand_name.toUpperCase() === 'COACH'
      ), 4);

      // Get 4 random items from new arrivals
      this.newArrivalProducts = this.getRandomItems(this.allProducts, 4);
    }
    else {
      this.is2Dshow = true;
    }

  }

  getRandomItems(array: any[], count: number): any[] {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return array.slice(0, count);
  }

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    localStorage.setItem('cur_page', pageNumber.toString())
    console.log('pageNumber================', pageNumber);
  }

}
