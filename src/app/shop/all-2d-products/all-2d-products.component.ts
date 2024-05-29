import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-all-2d-products',
  templateUrl: './all-2d-products.component.html',
  styleUrls: ['./all-2d-products.component.scss']
})
export class AllTwoDProductsComponent implements OnInit {
  @Input() currency: any = this.productService.Currency; // Default Currency 
  public ImageSrc: string
  public products: ProductNew[] = [];
  store_slug: any;
  cat_slug: any = '';
  brandList = [];
  selectedBrand: any
  selectedBrandName: any
  categoryList = [];
  productList = [];

  // p: any
  currentPage: number = 1; // Initialize with default page number
  numItemsPerSection = 3;
  groupedItems = [];
  constructor(private router: Router,
    public productService: ProductService, private route: ActivatedRoute, private toastr: ToastrService) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
    if (localStorage.getItem('cur_page')) {
      this.currentPage = Number(localStorage.getItem('cur_page'));
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

    this.route.paramMap.subscribe(params => {
      // Extract the 'slug' and 'page' values from the route parameters
      this.store_slug = params.get('storeSlug');
    });

    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand
    }
    this.productService.get2DProductList(prodObj).subscribe(
      res => {
        this.productList = res['data']
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });


    this.productService.getallBrands().subscribe(
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
        console.log('res=========', res['data'])
        this.categoryList = res['data'];
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });



  }

  getAllProducts() {

    this.cat_slug = '';
    this.selectedBrand = '';
    this.selectedBrandName = ''
    let pageNumber = 1;
    localStorage.setItem('cur_page', pageNumber.toString())
    localStorage.setItem('brand', this.selectedBrand);
    let prodObj = {
      "product_category": '',
      "store_slug": this.store_slug,
      "brand": ''
    }
    this.productService.get2DProductList(prodObj).subscribe(
      res => {
        this.productList = res['data']
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  getCAtegoryDeatils(Category: any) {
    let pageNumber = 1;
    localStorage.setItem('cur_page', pageNumber.toString())
    localStorage.setItem('cur_cat', Category.category_slug)
    console.log('Category============', Category);
    this.cat_slug = Category.category_slug;
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand
    }
    this.productService.get2DProductList(prodObj).subscribe(
      res => {
        this.productList = res['data']
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }

  changeBrandname(brand: any) {
    let pageNumber = 1;
    localStorage.setItem('cur_page', pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    console.log('this.selectedBrandName----', this.selectedBrandName);
    localStorage.setItem('brand', this.selectedBrand);
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand
    }
    this.productService.get2DProductList(prodObj).subscribe(
      res => {
        this.productList = res['data']
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }


  groupItemsIntoSections(items) {
    this.groupedItems=[];
    for (let i = 0; i < items.length; i += this.numItemsPerSection) {
      const section = items.slice(i, i + this.numItemsPerSection);
      this.groupedItems.push(section);
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
    localStorage.setItem('cur_page', pageNumber.toString())
    console.log('pageNumber================', pageNumber);
    // Do whatever you need to do when the page changes
    // For example, fetch data for the new page
  }

}
