import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ProductService } from "../../shared/services/product.service";
import { ProductNew } from '../../shared/classes/product';

const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  
  public grid: string = 'col-xl-3 col-md-6';
  public layoutView: string = 'grid-view';
  public products: ProductNew[] = [];
  public brands: any[] = [];
  public colors: any[] = [];
  public size: any[] = [];
  public minPrice: number = 0;
  public maxPrice: number = 120000;
  public tags: any[] = [];
  public category: string;
  public pageNo: number = 1;
  public paginate: any = {}; // Pagination use only
  public sortBy: string; // Sorting Order
  public mobileSidebar: boolean = false;
  public loader: boolean = true;
  categories_image:any;

  constructor(private route: ActivatedRoute, private router: Router,
    private viewScroller: ViewportScroller, public productService: ProductService) {   

  }

  ngOnInit(): void {
    localStorage.setItem('cat_slug',this.route.snapshot.paramMap.get('slug'));

    this.productService.getallCategories().subscribe(
      res =>
      {

        const result = res['data'].filter(cat => cat.category_slug == this.route.snapshot.paramMap.get('slug'));
        this.categories_image=result[0].category_image;
        console.log('Current Catagories image  ====> ',this.categories_image)
        console.log('All Catagories',res['data'])
      }
    )

let catdata=
{
  'category': this.route.snapshot.paramMap.get('slug'),
}
    this.productService.getProductsBycat(catdata).subscribe(
      res =>
      {
        console.log('collections >>>>>>>>>>>',res['data']);
        this.products=res['data'];
      }
    )

          // Get Query params..
          this.route.queryParams.subscribe(params => {

            this.colors = params.color ? params.color.split(",") : [];
            this.size  = params.size ? params.size.split(",")  : [];
            this.minPrice = params.minPrice ? params.minPrice : this.minPrice;
            this.maxPrice = params.maxPrice ? params.maxPrice : this.maxPrice;
            this.tags = [...this.colors, ...this.size]; // All Tags Array
            
            this.category = this.route.snapshot.paramMap.get('slug');
            console.log('collection page catagories == ',this.category);
            this.sortBy = params.sortBy ? params.sortBy : 'ascending';
            this.pageNo = params.page ? params.page : this.pageNo;
    
            console.log('Collection page Tag Name',this.tags)

            // Get Filtered Products..
            this.productService.filterProducts(this.tags).subscribe(response => {      
              // Sorting Filter
              this.products = this.productService.sortProducts(response, this.sortBy);
    
              console.log('Collection page filter',response );

              console.log('Product Catagories Check',this.route.snapshot.paramMap.get('slug'));
              // Category Filter
              if(this.route.snapshot.paramMap.get('slug'))
    
                this.products = this.products.filter((item: any) => item.product_category.category_slug == this.category);

                console.log('Product Catagories Check',this.products );

                // Price Filter
              this.products = this.products.filter((item: any) => item.product_sale_price >= this.minPrice && item.product_sale_price <= this.maxPrice) 
            
              console.log('Product Price Check',this.products );

              // Paginate Products
              this.paginate = this.productService.getPager(this.products.length, +this.pageNo);     // get paginate object from service
              this.products = this.products.slice(this.paginate.startIndex, this.paginate.endIndex + 1); // get current page of items
    
              console.log('Product Paginate Check',this.products );
            })
          })

  }


  // Append filter value to Url
  updateFilter(tags: any) {
    tags.page = null; // Reset Pagination
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: tags,
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // SortBy Filter
  sortByFilter(value) {
    console.log('================>>',this.products);
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: { sortBy: value ? value : null},
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
      
    });
  }

  // Remove Tag
  removeTag(tag) {
    this.colors = this.colors.filter(val => val !== tag);
    this.size = this.size.filter(val => val !== tag );

    let params = { 
      color: this.colors.length ? this.colors.join(",") : null, 
      size: this.size.length ? this.size.join(",") : null
    }

    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // Clear Tags
  removeAllTags() {
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: {},
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // product Pagination
  setPage(page: number) {
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // Change Grid Layout
  updateGridLayout(value: string) {
    this.grid = value;
  }

  // Change Layout View
  updateLayoutView(value: string) {
    this.layoutView = value;
    if(value == 'list-view')
      this.grid = 'col-lg-12';
    else
      this.grid = 'col-xl-3 col-md-6';
  }

  // Mobile sidebar
  toggleMobileSidebar() {
    this.mobileSidebar = !this.mobileSidebar;
  }

}
