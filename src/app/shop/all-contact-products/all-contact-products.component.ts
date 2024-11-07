import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';

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
  cat_slug: any = '';
  cat_id: any
  brandList = [];
  selectedBrand: any
  selectedBrandName: any
  categoryList = [];
  productList = [];
  topBransList = []
  // p: any
  currentPage: number = 1; // Initialize with default page number
  numItemsPerSection = 3;
  limit: number = 9;
  groupedItems = [];
  totalProducts: any;
  constructor(private router: Router,
    public productService: ProductService, private route: ActivatedRoute, private toastr: ToastrService) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
    if (localStorage.getItem('top_brands')) {
      this.topBransList = JSON.parse(localStorage.getItem('top_brands'));
    }

    if (localStorage.getItem('cur_page_contact')) {
      this.currentPage = Number(localStorage.getItem('cur_page_contact'));
    }
    else {
      this.currentPage = 1
    }
    if (localStorage.getItem('brand')) {
      this.selectedBrand = localStorage.getItem('brand')
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

    this.productService.getallCategoryWithSubcat().subscribe(
      res => {
        this.categoryList = res['data'];

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
            this.groupItemsIntoSections(this.productList);
          },
          error => {
            // .... HANDLE ERROR HERE 
            this.toastr.error(error.error.message)
          });
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  getBrandDeatils(brand:any)
  {
    let pageNumber = 1;
    localStorage.setItem('cur_page_contact', pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    localStorage.setItem('brand', this.selectedBrand);
    let prodObj = {
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2DProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount
        this.groupItemsIntoSections(this.productList);
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
    let pageNumber = 1;
    localStorage.setItem('cur_page_contact', pageNumber.toString())
    localStorage.setItem('brand', this.selectedBrand);
    localStorage.setItem('cat_slug', this.cat_slug);
    localStorage.setItem('cur_cat', this.cat_slug);
    let prodObj = {
      "product_category": '',
      "store_slug": this.store_slug,
      "brand": '',
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2DProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  changeBrandname(brand: any) {
    let pageNumber = 1;
    localStorage.setItem('cur_page_contact', pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    console.log('this.selectedBrandName----', this.selectedBrandName);
    localStorage.setItem('brand', this.selectedBrand);
    let prodObj = {
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2DProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }


  groupItemsIntoSections(items) {
    this.groupedItems = [];
    if (items) {
      for (let i = 0; i < items.length; i += this.numItemsPerSection) {
        const section = items.slice(i, i + this.numItemsPerSection);
        this.groupedItems.push(section);
      }
    }
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

  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    localStorage.setItem('cur_page_contact', pageNumber.toString())
    console.log('pageNumber================', pageNumber);
    // Do whatever you need to do when the page changes
    // For example, fetch data for the new page
    let prodObj = {
      "product_category": this.cat_id,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand,
      "page": this.currentPage,
      "limit": this.limit
    }
    this.productService.get2DProductList(prodObj).subscribe(
      res => {
        this.productList = res['data'].products
        this.totalProducts = res['data'].totalCount
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

}
