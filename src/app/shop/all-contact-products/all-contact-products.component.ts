import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';

@Component({
  selector: 'app-all-contact-products',
  templateUrl: './all-contact-products.component.html',
  styleUrls: ['./all-contact-products.component.scss']
})
export class AllContactProductsComponent implements OnInit {
  @Input() store_slug: string | undefined;
  @Input() currency: any = this.productService.Currency; // Default Currency 
  public ImageSrc: string
  public products: ProductNew[] = [];
  public sliders = [];
  cat_slug: any = '';
  cat_id: any
  brandList = [];
  selectedBrand: any
  selectedBrandName: any
  categoryList = [];
  productList = [];
  topBransList = []
  // p: any
  showBrand: boolean = false;
  currentPage: number = 1; // Initialize with default page number
  limit: number = 12;
  totalProducts: any;
  isLoading: boolean = false;
  hasMoreProducts: boolean = true; // flag to track if more products exist

  constructor(private router: Router,
    public productService: ProductService, private route: ActivatedRoute, private toastr: ToastrService, private homesliderservice: HomesliderService) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
    if (localStorage.getItem('top_brands')) {
      this.topBransList = JSON.parse(localStorage.getItem('top_brands'));
      console.log('this.topBransList----------------', this.topBransList)
    }
    if (localStorage.getItem('contract_brand')) {
      this.selectedBrand = localStorage.getItem('contract_brand')
    }
    else {
      this.selectedBrand = ''
    }

    if (!this.store_slug) {
      this.route.paramMap.subscribe(params => {
        // Extract the 'storeSlug' value from the route parameters
        this.store_slug = params.get('storeSlug');
      });
    }
    this.productService.getallContactBrands(this.store_slug).subscribe(
      res => {
        console.log('res=========', res['data'])
        this.brandList = res['data'];
        this.selectedBrandName = this.getBrandName(this.brandList, this.selectedBrand)
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    this.productService.getallEyeGlassCategoryWithSubcat().subscribe(
      res => {
        this.categoryList = res['data'];

        let prodObj = {
          "product_category": this.cat_id,
          "store_slug": this.store_slug,
          "brand": this.selectedBrand,
          "page": this.currentPage,
          "limit": this.limit
        }
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
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
        this.toastr.error(error.error.message);
        this.router.navigateByUrl('/')
      }
    );

    this.loadProducts();
  }


  // Method to load products from the API
  loadProducts(): void {
    if (this.isLoading || !this.hasMoreProducts) return;

    this.isLoading = true;
    let prodObj = {
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getContactFilterdProductList(prodObj).subscribe(
      (res: any) => {
        if (res['data'].hasOwnProperty('products') && res['data'].products.length > 0) {
          // Append the new products to the existing list
          this.productList = [...this.productList, ...res['data'].products];
          this.currentPage++; // Increment the page number for the next load
        } else {
          this.hasMoreProducts = false; // No more products available
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    );
  }

  // Listen to window scroll event to trigger pagination
  @HostListener('window:scroll', [])
  onScroll(): void {
    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
    const body = document.body;
    const html = document.documentElement;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    const windowBottom = windowHeight + window.pageYOffset;

    if (windowBottom >= docHeight - 100) {
      // If scrolled near the bottom, load more products
      this.loadProducts();
    }
  }

  barndPopup() {
    this.showBrand = true;
  }

  barndPopupClose() {
    this.showBrand = false;
  }


  getBrandDeatils(brand: any) {
    let pageNumber = 1;
    this.currentPage = 1;
    localStorage.setItem('cur_page_contact', pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    localStorage.setItem('contract_brand', this.selectedBrand);
    let prodObj = {
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getContactFilterdProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount

      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  getAllProducts() {

    this.cat_slug = '';
    this.cat_id = '';
    this.selectedBrand = '';
    this.selectedBrandName = ''
    this.currentPage = 1;
    localStorage.setItem('contract_brand', this.selectedBrand);
    localStorage.setItem('cat_slug', this.cat_slug);
    localStorage.setItem('cur_cat', this.cat_slug);
    let prodObj = {
      "product_category": '',
      "store_slug": this.store_slug,
      "brand": '',
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getContactFilterdProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount

      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  changeBrandname(brand: any) {
    let pageNumber = 1;
    this.currentPage = 1;
    localStorage.setItem('cur_page_contact', pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    console.log('this.selectedBrandName----', this.selectedBrandName);
    localStorage.setItem('contract_brand', this.selectedBrand);
    let prodObj = {
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.getContactFilterdProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount

      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  // Add to Wishlist
  addToWishlist(product: any) {
    product.addonsprice = 0;
    let addonSelectedResult = [];
    product.addons = addonSelectedResult
    this.productService.addToWishlist(product);
  }


  getBrandName(brandarr, brandId) {
    if (brandarr.length > 0) {
      for (const brand of brandarr) {
        if (brand._id == brandId) {
          return brand.brand_name
        }
      }
    }
    return null
  }

}
