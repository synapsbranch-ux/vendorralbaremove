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
  store_slug:any;
  cat_slug:any
  brandList=[];
  selectedBrand:any
  categoryList=[];

  totalPageCount = 7;
  currentHead = 1;
  currentTail = this.totalPageCount < 5 ? this.totalPageCount : 5;
  totalItemsPerBar = this.totalPageCount < 5 ? this.totalPageCount : 5;
  showPrev =
    this.currentHead == 1 || this.totalPageCount <= this.totalItemsPerBar
      ? false
      : true;
  showNext = this.totalPageCount <= this.totalItemsPerBar ? false : true;
  buttonNumbers = [];

  constructor(private router: Router, 
    public productService: ProductService, private route : ActivatedRoute, private toastr: ToastrService ) {
    this.productService.compareItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      // Extract the 'slug' and 'page' values from the route parameters
      this.store_slug = params.get('storeSlug');
      this.cat_slug = params.get('catSlug');
    });

    this.productService.getallBrands().subscribe(
      res => {
        console.log('res=========',res['data'])
        this.brandList = res['data'];
      },
      error => {
        // .... HANDLE ERROR HERE 
        this.toastr.error(error.error.message)
   });

   this.productService.getallCategoryWithSubcat().subscribe(
    res => {
      console.log('res=========',res['data'])
      this.categoryList = res['data'];
    },
    error => {
      // .... HANDLE ERROR HERE 
      this.toastr.error(error.error.message)
 });

 for (
  let i = 1;
  i <= (this.totalPageCount < 5 ? this.totalPageCount : 5);
  i++
) {
  this.buttonNumbers.push(i);
}

  }
  getCAtegoryDeatils(Category:any)
  {
    console.log('Category============',Category);
  }

  handleNext(): void {
    console.log("next", this.currentHead, this.currentTail);
    if (this.currentTail < this.totalPageCount) {
      this.showPrev = true;
      this.currentHead = this.currentTail + 1;
      // loop from current head + 1 till total page count.
      this.buttonNumbers = [];
      let limit =
        this.currentTail + 5 <= this.totalPageCount
          ? this.currentTail + 5
          : this.totalPageCount;
      for (let i = this.currentTail + 1; i <= limit; i++) {
        this.buttonNumbers.push(i);
        if (i === limit) {
          this.currentTail = i;
        }
      }

      console.log("after next", this.currentTail);

      if (this.totalPageCount - this.currentTail < 1) {
        this.showNext = false;
      }
    }
  }

  handlePrev(): void {
    console.log("prev", this.currentHead, this.currentTail);
    this.currentHead -= 5;
    if (this.currentTail % 5 !== 0) {
      this.currentTail -= this.currentTail % 5;
    } else {
      this.currentTail -= 5;
    }
    // loop from currentHead till currentTail.
    if (this.currentHead === 1) {
      this.showPrev = false;
    }
    this.buttonNumbers = [];
    for (let i = this.currentHead; i <= this.currentTail; i++) {
      this.buttonNumbers.push(i);
    }
    if (this.currentTail < this.totalPageCount) {
      this.showNext = true;
    }
  }

}
