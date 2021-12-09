import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider, ProductDetailsThumbSlider } from '../../../../shared/data/slider';
import { ProductNew } from '../../../../shared/classes/product';
import { ProductService } from '../../../../shared/services/product.service';
import { SizeModalComponent } from "../../../../shared/components/modal/size-modal/size-modal.component";

@Component({
  selector: 'app-product-no-sidebar',
  templateUrl: './product-no-sidebar.component.html',
  styleUrls: ['./product-no-sidebar.component.scss']
})
export class ProductNoSidebarComponent implements OnInit {

  public product: ProductNew = {};
  public counter: number = 1;
  public activeSlide: any = 0;
  public selectedSize: any;
  public selectedColor: any;
  
  @ViewChild("sizeChart") SizeChart: SizeModalComponent;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any = ProductDetailsThumbSlider;

  constructor(private route: ActivatedRoute, private router: Router,
    public productService: ProductService) {
      this.route.data.subscribe(response =>{ 
        this.product = response.data;
        console.log('Product Deatils =====', this.product);
      });
    }

  ngOnInit(): void {
  }

  // Get Product Color
  Color(product_varient_options) {
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
    if (!uniqSize.includes(product_varient_options[i]) && product_varient_options[i]) {
      uniqSize.push(product_varient_options[i])
    }
  }
  return uniqSize
}
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
    product.quantity = this.counter || 1;
    product.product_varient_options[0].size_options=this.selectedSize;
    product.product_varient_options[1].color_options=this.selectedColor;
    console.log(product.quantity);
    const status = await this.productService.addToCart(product);
    if(status)
      this.router.navigate(['/shop/cart']);
    console.log(status);
  }

  // Buy Now
  async buyNow(product: any) {
    product.quantity = this.counter || 1;
    const status = await this.productService.addToCart(product);
    if(status)
      this.router.navigate(['/shop/checkout']);
  }

  // Add to Wishlist
  addToWishlist(product: any) {
    this.productService.addToWishlist(product);
  }

}
