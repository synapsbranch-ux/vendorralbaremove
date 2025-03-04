import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';

@Component({
  selector: 'app-all-2d-3d-products',
  templateUrl: './all-2d-3d-products.component.html',
  styleUrls: ['./all-2d-3d-products.component.scss']
})
export class AllTwoDThreeDProductsComponent implements OnInit {
  @Input() store_slug: string | undefined;
  @Input() currency: any = this.productService.Currency; // Default Currency 
  public ImageSrc: string
  public products: ProductNew[] = [];
  cat_slug: any = '';
  cat_id: any
  brandList = [];
  selectedBrand: any
  selectedBrandName: any
  categoryList = [];
  productList = [];
  showBrand: boolean = false;
  activeCategoryIndex: number = 1;
  tag_id: any;
  // p: any
  currentPage: number = 1; // Initialize with default page number
  limit: number = 12;
  totalProducts: any;
  isLoading: boolean = false;
  hasMoreProducts: boolean = true; // flag to track if more products exist
  public sliders = [];

  constructor(private router: Router,
    public productService: ProductService, private route: ActivatedRoute, private toastr: ToastrService, private homesliderservice: HomesliderService) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
    if (localStorage.getItem('2d_3d_brand')) {
      this.selectedBrand = localStorage.getItem('2d_3d_brand')
    }
    else {
      this.selectedBrand = ''
    }

    if (localStorage.getItem('tag_id')) {
      this.tag_id = localStorage.getItem('tag_id')
    }
    else {
      this.tag_id = ''
    }

    if (localStorage.getItem('2d_3d_cur_cat')) {
      this.cat_id = localStorage.getItem('2d_3d_cur_cat')
    }
    else {
      this.cat_slug = ''
    }

    if (!this.store_slug) {
      this.route.paramMap.subscribe(params => {
        // Extract the 'slug' and 'page' values from the route parameters
        this.store_slug = params.get('storeSlug');
        this.cat_slug = params.get('catSlug');

        // If 'all' is passed as the category slug, reset cat_slug and cat_id
        if (this.cat_slug == 'all') {
          this.cat_slug = '';
          this.cat_id = '';
        }
      });
    }

    this.productService.getall2D3DBrands(this.store_slug).subscribe(
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
        console.log('res=========', res['data'])
        this.categoryList = res['data'][0];
        if (this.cat_slug !== '' && this.cat_slug !== 'all') {
          // Check if cat_slug matches any category slug in the categoryList
          const matchedCategory = this.categoryList.find(category => category.category_slug === this.cat_slug);
          if (matchedCategory) {
            this.cat_id = matchedCategory.category_id;
            this.activeCategoryIndex = this.categoryList.indexOf(matchedCategory); // Set the active index
          }

          this.getCategoryDetails(matchedCategory, this.activeCategoryIndex);

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
      "tag_id": this.tag_id,
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      (res: any) => {
        if (res['data'].hasOwnProperty('products') && res['data'].products.length > 0) {
          // Append the new products to the existing list
          this.productList = [...res['data'].products];
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

  // Add to Wishlist
  addToWishlist(product: any) {
    product.addonsprice = 0;
    let addonSelectedResult = [];
    product.addons = addonSelectedResult
    this.productService.addToWishlist(product);
  }

  barndPopup() {
    this.showBrand = true;
  }

  barndPopupClose() {
    this.showBrand = false;
  }

  getAllProducts() {
    this.tag_id = ''
    this.cat_slug = '';
    this.cat_id = '';
    this.selectedBrand = '';
    this.selectedBrandName = ''
    this.currentPage = 1;
    localStorage.setItem('tag_id', this.tag_id);
    localStorage.setItem('2d_3d_brand', this.selectedBrand);
    localStorage.setItem('2d_3d_cur_cat', this.cat_id);
    let prodObj = {
      "tag_id": this.tag_id,
      "product_category": '',
      "store_slug": this.store_slug,
      "brand": '',
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }


  getCategoryDetails(category: any, index: number) {
    this.activeCategoryIndex = index;
    let pageNumber = 1;
    this.currentPage = 1;
    console.log('Category============', category);
    localStorage.setItem('2d_3d_cur_page', pageNumber.toString());
    localStorage.setItem('2d_3d_cur_cat', category.category_id);



    this.cat_slug = category.category_slug;
    this.cat_id = category.category_id;

    // Update the URL by navigating with new path parameters
    this.router.navigate(
      ['/all-products', this.store_slug, this.cat_slug]  // Absolute path navigation
    );

    let prodObj = {
      "tag_id": this.tag_id,
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    };

    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products;
        this.totalProducts = res['data'].totalCount;
      },
      error => {
        this.toastr.error(error.error.message);
      }
    );
  }

  changeBrandname(brand: any) {
    this.showBrand = false;
    let pageNumber = 1;
    localStorage.setItem('2d_3d_cur_page', pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    console.log('this.selectedBrandName----', this.selectedBrandName);
    localStorage.setItem('2d_3d_brand', this.selectedBrand);
    let prodObj = {
      "tag_id": this.tag_id,
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
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
