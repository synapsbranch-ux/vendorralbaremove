import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider, ProductDetailsThumbSlider } from '../../../../shared/data/slider';
import { ProductNew,ProductNew2 } from '../../../../shared/classes/product';
import { ProductService } from '../../../../shared/services/product.service';
import { SizeModalComponent } from "../../../../shared/components/modal/size-modal/size-modal.component";
import { ToastrService } from 'ngx-toastr';
import '@google/model-viewer'
import { view3DModalComponent } from 'src/app/shared/components/modal/product-view3D/product-view3D.component';


const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Component({
  selector: 'app-product-no-sidebar',
  templateUrl: './product-no-sidebar.component.html',
  styleUrls: ['./product-no-sidebar.component.scss']
})
export class ProductNoSidebarComponent implements OnInit,OnChanges {
  public products: ProductNew2[] = [];
  public product: ProductNew = {};
  public counter: number = 1;
  public activeSlide: any = 0;
  public selectedSize: any;
  public selectedColor: any;
  addtocartstatus: boolean = false;
  colorarr=[];
  sizearr=[];

  productColor:any;
  productSize:any;
  image3d:any;
  productCategory:any;
  product_external_link:any="#"

  cartbuttonhideStatus:any='inactive';
  quentityStatus:any='inactive';

  
  @ViewChild("sizeChart") SizeChart: SizeModalComponent;
  @ViewChild("view3D") view3D: view3DModalComponent;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any = ProductDetailsThumbSlider;

  constructor(private route: ActivatedRoute, private router: Router,
    public productService: ProductService, private toastrService: ToastrService) {
    }

  ngOnInit(): void {

    this.productService.getSettingsDetails().subscribe(
      res =>
      {
        if(res.length)
        {
        this.cartbuttonhideStatus=res['data'][0].addto_cart_status;
        this.quentityStatus=res['data'][0].quentity_status;
        }
      }
    )
    this.route.params.subscribe(
      params => {
        this.productService.getproductsBySlugs(params.slug).subscribe(response =>{ 
          this.product = response.data;
          if(response.data.product_external_link){
            this.product_external_link=response.data.product_external_link;
          }
          else
          {
            this.product_external_link="#"
          }
          this.productCategory=response.data.product_category.category_slug;

          let catdata=
          {
            'category': this.productCategory
          }
          this.productService.getProductscat(catdata).subscribe(response => 
            {      
              this.products=response['data'];
            
            }
          );

          this.image3d=this.product.product_3d_image[0].pro_3d_image;
          this.productColor=this.product.product_varient_options[1].color_options;
          this.productSize=this.product.product_varient_options[0].size_options;
        });
      })

  }

  externalLInk(link:any)
  {
    window.open( link , "_blank");
  }

  ngOnChanges()
  {

  }

  selectSize(size) {
    this.selectedSize = size;
  }
  selectColor(color) {
    this.selectedColor = color;
  }
  
  // Increament
  increment() {
    this.counter++ ;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter-- ;
  }

  // Add to cart
  async addToCart(product: any) {
    product.stock= (product.stock - this.counter);
    product.quantity = this.counter || 0;
    const status = await this.productService.addToCart(product);
    if(status)
    {
      this.toastrService.success('Product has been added in Cart.');
    }


  }

  // Buy Now
  async buyNow(product: any) {
    product.quantity = this.counter || 1;
    const status = await this.productService.addToCart(product);
    if(status)
      this.router.navigate(['/checkout']);
  }

  // Add to Wishlist
  addToWishlist(product: any) {
    this.productService.addToWishlist(product);
  }

}
