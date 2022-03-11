import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider, ProductDetailsThumbSlider } from '../../../../shared/data/slider';
import { ProductNew,ProductNew2 } from '../../../../shared/classes/product';
import { ProductService } from '../../../../shared/services/product.service';
import { SizeModalComponent } from "../../../../shared/components/modal/size-modal/size-modal.component";
import { ToastrService } from 'ngx-toastr';
import '@google/model-viewer'
import { view3DModalComponent } from 'src/app/shared/components/modal/product-view3D/product-view3D.component';

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
    
    
      // this.productService.getproductsBySlugs(this.route.snapshot.paramMap.get('slug')).subscribe(response =>{ 
      //   this.product = response.data;
      //   if(response.data.product_external_link){
      //     this.product_external_link=response.data.product_external_link;
      //   }
      //   else
      //   {
      //     this.product_external_link="#"
      //   }
        
      //   console.log('product Slug ', this.route.snapshot.paramMap.get('slug'));
      //   console.log('Product Deatils ===== >>>>>>>>>>>', this.product);
      //   this.productCategory=response.data.product_category.category_slug;
      //   localStorage.setItem("product_slug",this.route.snapshot.paramMap.get('slug'));
      //   localStorage.setItem("product_catg",response.data.product_category.category_slug);
      //   console.log('Product Categories ===== >>>>>>>>>>>', this.productCategory);
      //   this.image3d=this.product.product_3d_image[0].pro_3d_image;
      //   console.log('Product 3D image =====', this.image3d);
      //   this.productColor=this.product.product_varient_options[1].color_options;
      //   this.productSize=this.product.product_varient_options[0].size_options;
      // });
      

  // this.route.data.subscribe(response =>
  //   {
  //     console.log('response.data', response.data)
  //     if(response.data)
  //     {
  //       this.product = response.data 
  //     }    
  //   });

    }

  ngOnInit(): void {

    this.productService.getSettingsDetails().subscribe(
      res =>
      {
        this.cartbuttonhideStatus=res['data'][0].addto_cart_status;
        this.quentityStatus=res['data'][0].quentity_status;

    //    console.log('Product Settings',res);
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
      //    console.log('Related cat   ',catdata);
          this.productService.getProductscat(catdata).subscribe(response => 
            {      
           //   console.log('Related Products ==== >>>',response)
              this.products=response['data'];
            
            }
          );

          this.image3d=this.product.product_3d_image[0].pro_3d_image;
          this.productColor=this.product.product_varient_options[1].color_options;
          this.productSize=this.product.product_varient_options[0].size_options;
        });
   //   console.log('response.data', this.product)
      })

  }

  externalLInk(link:any)
  {
    window.open( link , "_blank");
  //  console.log('Redirect Other Website')
  }

  ngOnChanges()
  {

  }


  // Get Product Color
  Color(product_varient_options) {
    // console.log('Color Function ====',product_varient_options);
    if((product_varient_options).length >= 0)
    {
      const uniqColor = [];
      for (let i = 0; i < (product_varient_options).length; i++) {
        if (!uniqColor.includes(product_varient_options[i]) && product_varient_options[i]) {
          uniqColor.push(product_varient_options[i]);
        }
      }
      uniqColor.push(product_varient_options);
      
      return uniqColor
    }
  }

  // Get Product Size
Size(product_varient_options) {
 
  if((product_varient_options).length >= 0)
  {
  const uniqSize = []
  for (let i = 0; i < (product_varient_options).length; i++) {

    if (!uniqSize.includes(product_varient_options) && product_varient_options) {
      uniqSize.push(product_varient_options)
    }
  }
  return uniqSize
}
}

  selectSize(size) {
    this.selectedSize = size;
    console.log('Selected Size : ', this.selectedSize );
  }
  selectColor(color) {
    this.selectedColor = color;
    console.log('Selected Color : ', this.selectedColor );
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
    product.quantity = this.counter || 1;


   // console.log('Product Size Option ============',product.product_varient_options[0].size_options);
   // console.log('Product Color Option ============',product.product_varient_options[1].color_options);
   //console.log('Product Quentity ============',product.quantity);
    if(this.selectedSize && this.selectedColor)
    {
    if(this.selectedSize)
    {
      product.product_varient_options[0].size_options=this.selectedSize;
    }

    if(this.selectedColor)
    {
      product.product_varient_options[1].color_options=this.selectedColor;
    }

    const status = await this.productService.addToCart(product);
    if(status)
    {
      this.toastrService.success('Product has been added in Cart.');
      // this.router.navigate(['/shop/cart']);
    }
    console.log('Add To CArt Status =======',status);
   // console.log('Ready to Cart');
    }
    else
    {
      this.toastrService.warning('Please choose all veriation');
    //  console.log('Not Ready Cart');
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
