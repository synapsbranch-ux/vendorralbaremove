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
  addtocartstatus: boolean = false;
  image3d:any;
  product_external_link:any="#"
  cartbuttonhideStatus:any='inactive';
  quentityStatus:any='inactive';
  productAttributeArr=[];
  productAddons=[];
  selectedOptions: any = {}; // Addons selected options as an object with dropdown ID as key
  value: any = {}; // Addons prices as an object with dropdown ID as key
  uploadAddonsImage=[]
  private fileToUpload: File = null;
  range:boolean=false;

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
    let product_slug = this.route.snapshot.paramMap.get('slug');
    this.productService.getproductsBySlugs(product_slug).subscribe(response =>{ 
      this.product = response.data;
      this.productAttributeArr = response.data.attributes;
      this.productAddons = response.data.add_ons;
      console.log('productAttributeArr =======================>',response.data.attributes)
      if(response.data.product_external_link){
        this.product_external_link=response.data.product_external_link;
      }
      else
      {
        this.product_external_link="#"
      }
      this.image3d=this.product.product_3d_image[0].pro_3d_image;
    }); 
  }

  externalLInk(link:any)
  {
    window.open( link , "_blank");
  }

  ngOnChanges()
  {

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
// key value to text convert with capitalize format
  capitalizeString(str) {
    let words = str.split('_');
    let capitalizedWords = words.map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    let capitalizedString = capitalizedWords.join(' ');
  
    return capitalizedString;
  }

  uploadFiles(files: FileList,formcontrolname)
{
  this.fileToUpload = files.item(0);

this.productService.uploadImage(this.fileToUpload).subscribe(
  (res) => {
  let imgobj={
    keyname: formcontrolname,
    fileUrl : res['data'].fileUrl,
  };
  console.log('imgobj ==================================>',imgobj)
  this.uploadAddonsImage.push(imgobj);
  },
  (err) => {
    // console.log('GLB Image Upload Error',err);
  })
// }
}

onAngleChange(val:any,slug) {
  // Do something with the angle value
  this.productAddons.map( (elm)=>
  {
     if(elm.addon_slug == slug)
     {
      elm.add_ons_value[0].value= val;
      return elm
     }
     this.range = true;
     if(val == 0)
     {
      this.range = false;
     }
  })
  console.log('Angle changed:',val, slug);
  console.log('this.productAddons ===========>',this.productAddons);
}

getFormControlName(name: string): string {
  return name.toLowerCase()
  .replace(/ /g, '_')
  .replace(/[^\w-]+/g, '');
}

  updatePrice(dropdownSlug) {
    const dropdown = this.productAddons.find(item => item.addon_slug === dropdownSlug);
    if (dropdown) {
      const selectedOption = this.selectedOptions[dropdownSlug];
      const priceObj = dropdown.add_ons_value.find(option => option.value_slug === selectedOption);
      if (priceObj) {
        this.value[dropdownSlug] = priceObj.value;
      }
    }
  }

  stingURLCheck(str)
  {
    if (str.startsWith("http")) {
      let parts = str.split('.');
      let extension = parts[parts.length - 1];
      if(extension == 'jpg' || extension == 'png')
      {
        return 'img';
      }
      else
      {
        return 'pdf';
      }
      
    }
    else
    {
      return false;
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
