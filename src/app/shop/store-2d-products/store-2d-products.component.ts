import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from "../../shared/classes/product";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-store-2d-products',
  templateUrl: './store-2d-products.component.html',
  styleUrls: ['./store-2d-products.component.scss']
})
export class StoreproductsComponent implements OnInit {

  public products: ProductNew[] = [];
  store_slug: any;
  cat_slug: any
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
    if(localStorage.getItem('cur_page'))
    {
      this.currentPage = Number(localStorage.getItem('cur_page'));
    }
    if (localStorage.getItem('brand')) {
      this.selectedBrand = localStorage.getItem('brand')
    }

    this.route.paramMap.subscribe(params => {
      // Extract the 'slug' and 'page' values from the route parameters
      this.store_slug = params.get('storeSlug');
      this.cat_slug = params.get('catSlug');
    });

    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand
    }
    this.productService.getallFilteredProduct(prodObj).subscribe(
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
        this.selectedBrandName = this.getBrandName(this.brandList,this.selectedBrand)
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

  groupItemsIntoSections(items) {
    for (let i = 0; i < items.length; i += this.numItemsPerSection) {
      const section = items.slice(i, i + this.numItemsPerSection);
      this.groupedItems.push(section);
    }
  }

  getCAtegoryDeatils(Category: any) {
    let pageNumber = 1;
    localStorage.setItem('cur_page',pageNumber.toString())
    console.log('Category============', Category);
    this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/store-2d-products/${this.store_slug}/${Category.category_slug}`]);
    })
    // this.router.navigateByUrl(`/store-2d-products/${this.store_slug}/${Category.category_slug}`);
    this.cat_slug = Category.category_slug;
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand
    }
    this.productService.getallFilteredProduct(prodObj).subscribe(
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
    localStorage.setItem('cur_page',pageNumber.toString())
    this.selectedBrand = brand._id
    this.selectedBrandName = brand.brand_name;
    console.log('this.selectedBrandName----',this.selectedBrandName);
    localStorage.setItem('brand', this.selectedBrand);
    this.router.navigateByUrl('settings-header', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/store-2d-products/${this.store_slug}/${this.cat_slug}`]);
    })
    let prodObj = {
      "product_category": this.cat_slug,
      "store_slug": this.store_slug,
      "brand": this.selectedBrand
    }
    this.productService.getallFilteredProduct(prodObj).subscribe(
      res => {
        this.productList = res['data']
        this.groupItemsIntoSections(this.productList);
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
      });
  }


getBrandName(brandarr,brandId)
{
  if(brandarr.length > 0)
  {
   for (const brand of brandarr) {
     if(brand._id == brandId)
     {
      return brand.brand_name
     }
   } 
  }
  return null
}

onPageChange(pageNumber: number): void {
  this.currentPage = pageNumber;
  localStorage.setItem('cur_page',pageNumber.toString())
  console.log('pageNumber================',pageNumber);
  // Do whatever you need to do when the page changes
  // For example, fetch data for the new page
}

}
