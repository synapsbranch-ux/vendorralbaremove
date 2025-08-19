import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';
import { HomesliderService } from 'src/app/shared/services/homeslider.service';
import { CriptoService } from 'src/app/shared/services/cripto.service';

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
  cat_id: any;
  cat_slug: any;
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
  paginatedBrandList = []; // Brands to display
  currentIndex = 0;
  itemsPerPage = 28; // Number of brands to show per row

  constructor(private router: Router,
    public productService: ProductService, private route: ActivatedRoute, private toastr: ToastrService, private homesliderservice: HomesliderService, private criptoService: CriptoService) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      // Decrypt query parameters only if they are present
      this.cat_id = params['cat'] ? this.criptoService.decryptParam(params['cat']) : '';
      this.selectedBrand = params['brand'] ? this.criptoService.decryptParam(params['brand']) : '';
      this.tag_id = params['tag'] ? this.criptoService.decryptParam(params['tag']) : '';
    
      // Log the decrypted values or indicate if they were not present
      console.log('Decrypted Params:', {
        cat: this.cat_id || 'No category',
        brand: this.selectedBrand || 'No brand',
        tag: this.tag_id || 'No tag'
      });
    });
    

    if (!this.store_slug) {
      this.route.paramMap.subscribe(params => {
        // Extract the 'slug' and 'page' values from the route parameters
        this.store_slug = params.get('storeSlug');
        this.cat_slug = params.get('catSlug') == 'all' ? '' : params.get('catSlug');
      });
    }

    this.productService.getall2D3DBrands(this.store_slug).subscribe(
      res => {
        // console.log('res=========', res['data'])
        this.brandList = res['data'];
        this.updatePaginatedBrandList();
        this.selectedBrandName = this.getBrandName(this.brandList, this.selectedBrand)
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    this.productService.getallEyeGlassCategoryWithSubcat().subscribe(
      res => {
        this.categoryList = res['data'][0];
        if (this.cat_id !== '') {
          const matchedCategory = this.categoryList.find(category => category.category_id === this.cat_id);
          if (matchedCategory) {
            this.cat_id = matchedCategory.category_id;
            this.activeCategoryIndex = this.categoryList.indexOf(matchedCategory); // Set the active index
          }

          this.getCategoryDetails(matchedCategory, this.activeCategoryIndex);
        }
        else if (this.cat_slug) {
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
        // this.router.navigateByUrl('/')
      }
    );

    this.loadProducts();
  }

  updatePaginatedBrandList() {
    this.paginatedBrandList = this.brandList.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
  }

  showNext() {
    if (this.currentIndex + this.itemsPerPage < this.brandList.length) {
      this.currentIndex += this.itemsPerPage;
      this.updatePaginatedBrandList();
    }
  }

  showPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex -= this.itemsPerPage;
      this.updatePaginatedBrandList();
    }
  }
  // Method to load products from the API
  loadProducts(): void {
    console.log('Calling Load Product', this.isLoading, this.hasMoreProducts);

    if (this.isLoading || !this.hasMoreProducts) {
      console.log('Exiting due to isLoading or hasMoreProducts condition.');
      return; // Exit early if loading or no more products
    }

    this.isLoading = true; // Set loading state to true

    // Use the fixed limit for each page, and just increase the page number
    let prodObj = {
      "tag_id": this.tag_id,
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,  // Incremented page number
      "limit": this.limit  // Fixed limit per page
    };

    console.log('Calling API with prodObj:', prodObj);

    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      (res: any) => {
        console.log('API Response:', res);

        if (res['data'].hasOwnProperty('products') && res['data'].products.length > 0) {
          // Append the newly fetched products to the existing product list
          this.productList = [...this.productList, ...res['data'].products]; // Append, not overwrite
          this.currentPage++; // Increment the page number for the next load
          console.log('Product list updated. New page:', this.currentPage);
        } else {
          this.hasMoreProducts = false; // No more products available
          console.log('No more products available.');
        }
        this.isLoading = false; // Reset loading state
      },
      (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false; // Reset loading state in case of error
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
    event.preventDefault();
    this.showBrand = false;
  }

  getAllProducts() {
    this.tag_id = ''
    this.cat_id = '';
    this.selectedBrand = '';
    this.selectedBrandName = ''
    this.currentPage = 1;
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
        if (this.totalProducts > 12) {
          this.hasMoreProducts = true;
          this.isLoading = false;
        }
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });

    // Navigate with encrypted query params to update the URL (only query params are encrypted)
    this.router.navigate([`/all-products/${this.store_slug}/all`], {
      queryParams: {
        cat: this.criptoService.encryptParam(this.cat_id),          // Encrypt cat_id for URL query param
        brand: this.criptoService.encryptParam(this.selectedBrand), // Encrypt selectedBrand for URL query param
        tag: this.criptoService.encryptParam(this.tag_id),          // Encrypt tag_id for URL query param
        page: this.currentPage                                     // Normal value for page
      }
    });
  }

  getCategoryDetailsQuery(category: any, index: number) {
    this.activeCategoryIndex = index;
    this.currentPage = 1;  // Reset to page 1
    this.cat_id = category.category_id;

    // Update the URL by navigating with new encrypted path parameters
    this.router.navigate(
      ['/all-products', this.store_slug,'all'], // Absolute path navigation
      {
        queryParams: {
          cat: this.criptoService.encryptParam(this.cat_id),  // Encrypt category ID for the URL
          brand: this.criptoService.encryptParam(this.selectedBrand),  // Encrypt brand ID for the URL
          tag: this.criptoService.encryptParam(this.tag_id),  // Encrypt tag ID for the URL
          page: this.currentPage  // Normal page number for the URL
        }
      }
    );

    // API call with normal values (not encrypted)
    let prodObj = {
      "tag_id": this.tag_id,
      "product_category": this.cat_id,  // Unencrypted category ID for API
      "store_slug": this.store_slug,    // Unencrypted store slug for API
      "brand": this.selectedBrand,      // Unencrypted brand for API
      "page": this.currentPage,
      "limit": this.limit
    };

    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products;
        this.totalProducts = res['data'].totalCount;
        if (this.totalProducts > 12) {
          this.hasMoreProducts = true;
          this.isLoading = false;
        }
      },
      error => {
        this.toastr.error(error.error.message);
      }
    );
  }

  getCategoryDetails(category: any, index: number) {
    this.activeCategoryIndex = index;
    this.currentPage = 1;  // Reset to page 1
    this.cat_id = category.category_id;

    // API call with normal values (not encrypted)
    let prodObj = {
      "tag_id": this.tag_id,
      "product_category": this.cat_id,  // Unencrypted category ID for API
      "store_slug": this.store_slug,    // Unencrypted store slug for API
      "brand": this.selectedBrand,      // Unencrypted brand for API
      "page": this.currentPage,
      "limit": this.limit
    };

    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products;
        this.totalProducts = res['data'].totalCount;
        if (this.totalProducts > 12) {
          this.hasMoreProducts = true;
          this.isLoading = false;
        }
      },
      error => {
        this.toastr.error(error.error.message);
      }
    );
  }


  changeBrandname(brand: any) {
    event.preventDefault();
    this.showBrand = false;
    this.currentPage = 1;  // Reset to page 1
    this.selectedBrand = brand._id;
    this.selectedBrandName = brand.brand_name;

    console.log('this.selectedBrandName----', this.selectedBrandName);

    // Update the URL by navigating with new encrypted path parameters
    this.router.navigate(
      ['/all-products', this.store_slug, 'all'], // Absolute path navigation
      {
        queryParams: {
          cat: this.criptoService.encryptParam(this.cat_id),    // Encrypt category ID for the URL
          brand: this.criptoService.encryptParam(this.selectedBrand),  // Encrypt brand ID for the URL
          tag: this.criptoService.encryptParam(this.tag_id)    // Encrypt tag ID for the URL
        }
      }
    );

    // API call with normal values (not encrypted)
    let prodObj = {
      "tag_id": this.tag_id,
      "product_category": this.cat_id,  // Unencrypted category ID for API
      "store_slug": this.store_slug,    // Unencrypted store slug for API
      "brand": this.selectedBrand,      // Unencrypted brand for API
      "page": this.currentPage,
      "limit": this.limit
    };

    this.productService.get2D3DFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data'].products;
        this.totalProducts = res['data'].totalCount;
        if (this.totalProducts > 12) {
          this.hasMoreProducts = true;
          this.isLoading = false;
        }
      },
      error => {
        this.toastr.error(error.error.message);
      }
    );
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
