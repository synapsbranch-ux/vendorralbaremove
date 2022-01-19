import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { CartModalComponent } from "../../modal/cart-modal/cart-modal.component";
import { ProductNew } from "../../../classes/product";
import { ProductService } from "../../../services/product.service";

@Component({
  selector: 'app-product-box-one',
  templateUrl: './product-box-one.component.html',
  styleUrls: ['./product-box-one.component.scss']
})
export class ProductBoxOneComponent implements OnInit {

  @Input() product: ProductNew;
  @Input() currency: any = this.productService.Currency; // Default Currency 
  @Input() thumbnail: boolean = false; // Default False 
  @Input() onHowerChangeImage: boolean = false; // Default False
  @Input() cartModal: boolean = false; // Default False
  @Input() loader: boolean = false;
  
  @ViewChild("quickView") QuickView: QuickViewComponent;
  @ViewChild("cartModal") CartModal: CartModalComponent;

  public ImageSrc : string

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    if(this.loader) {
      setTimeout(() => { this.loader = false; }, 2000); // Skeleton Loader
    }
  console.log('product-list page products ============>',this.product);
    
  }

  // Get Product Color
  Color(product_varient_options) {
    const uniqColor = [];
    for (let i = 0; i < (product_varient_options).length; i++) {
      if (!uniqColor.includes(product_varient_options[i]) && product_varient_options[i]) {
        uniqColor.push(product_varient_options[i]);
      }
    }
    
    return uniqColor
  }


  // Change Variants
  ChangeVariants(color, product) {
    product.product_varient_options.map((item) => {
      if (item.color_options === color) {
        product.product_image.map((img) => {
            this.ImageSrc = img.pro_image;
        })
      }
    })
  }

  // Change Variants Image
  ChangeVariantsImage(src) {
    this.ImageSrc = src;
  }

  addToCart(product: any) {
    this.productService.addToCart(product);
  }

  addToWishlist(product: any) {
    this.productService.addToWishlist(product);
  }

  addToCompare(product: any) {
    this.productService.addToCompare(product);
  }

}
