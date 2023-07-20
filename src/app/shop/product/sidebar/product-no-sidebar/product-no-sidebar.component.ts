import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider, ProductDetailsThumbSlider } from '../../../../shared/data/slider';
import { ProductNew, ProductNew2 } from '../../../../shared/classes/product';
import { ProductService } from '../../../../shared/services/product.service';
import { SizeModalComponent } from "../../../../shared/components/modal/size-modal/size-modal.component";
import { ToastrService } from 'ngx-toastr';
import '@google/model-viewer';
import { view3DModalComponent } from 'src/app/shared/components/modal/product-view3D/product-view3D.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';


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
export class ProductNoSidebarComponent implements OnInit, OnChanges {
  public products: ProductNew2[] = [];
  public product: ProductNew = {};
  public counter: number = 1;
  public activeSlide: any = 0;
  addtocartstatus: boolean = false;
  public productSubmitForm: FormGroup;
  image3d: any;
  product_external_link: any = "#"
  cartbuttonhideStatus: any = 'inactive';
  quentityStatus: any = 'inactive';
  productAttributeArr = [];
  productAddons = [];
  selectedOptions: any = {}; // Addons selected options as an object with dropdown ID as key
  value: any = {}; // Addons prices as an object with dropdown ID as key
  uploadAddonsImage = [];
  addonSelectedResult = [];
  private fileToUpload: File = null;
  range: boolean = false;
  productAddonsPrice: number = 0;
  desableInput: boolean = false;
  AddonService: boolean = false;
  productImages=[];
  productWishliststatus:boolean=false;

  @ViewChild("view3D") view3D: view3DModalComponent;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any = ProductDetailsThumbSlider;

  constructor(private route: ActivatedRoute, private router: Router,
    public productService: ProductService, private toastrService: ToastrService, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {

    this.productService.getSettingsDetails().subscribe(
      res => {
        if (res.length) {
          this.cartbuttonhideStatus = res['data'][0].addto_cart_status;
          this.quentityStatus = res['data'][0].quentity_status;
        }
      }
    )
    let product_slug = this.route.snapshot.paramMap.get('slug');
    this.productService.getproductsBySlugs(product_slug).subscribe(response => {
      this.product = response.data;
      this.productWishliststatus = this.productService.wishlistProductCheck(this.product)
      this.productAttributeArr = response.data.attributes;
      this.productAddons = response.data.add_ons;
      this.productImages.push(...response.data.product_3d_image)
      this.productImages.push(...response.data.product_image)
      console.log('this.productImages =======================>', this.productImages)
      this.ceateForm();
      if (response.data.product_external_link) {
        this.product_external_link = response.data.product_external_link;
      }
      else {
        this.product_external_link = "#"
      }
      this.image3d = this.product.product_3d_image[0].pro_3d_image;
    });

    
  }

  ceateForm() {
    const formControlsConfig = {};
    if (this.productAddons) {
      for (const item of this.productAddons) {
        if (item.add_ons_input == 'range-input') {
          const controlName = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName + '-1_addons'] = new FormControl();

          const controlName2 = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName2 + '-2_addons'] = new FormControl();

          const controlName3 = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName3 + '-price_addons'] = new FormControl();

        }
        else {
          const controlName = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName + '_addons'] = new FormControl();
          const controlName2 = item.add_ons_name.includes(' ')
            ? item.add_ons_name.toLowerCase()
              .replace(/ /g, '_')
              .replace(/[^\w-]+/g, '')
            : item.add_ons_name.toLowerCase();
          formControlsConfig[controlName2 + '-price_addons'] = new FormControl();
        }

      }
    }
    console.log('formControlsConfig -========================>?', formControlsConfig)
    this.productSubmitForm = this.formBuilder.group(formControlsConfig);

  }


  externalLInk(link: any) {
    window.open(link, "_blank");
  }

  ngOnChanges() {

  }
  // Increament
  increment() {
    this.counter++;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter--;
  }

  // Add to cart
  async addToCart(product: any) {
    product.stock = (product.stock - this.counter);
    product.quantity = this.counter || 0;
    product.addonsprice=this.productAddonsPrice;
    let extraObj=
    {
      extra_document:this.uploadAddonsImage
    }
    this.addonSelectedResult.push(extraObj);
    product.addons= this.addonSelectedResult
    console.log('Final Cart Product ==================>',product)
    const status = await this.productService.addToCart(product);
    if (status) {
      this.toastrService.success('Product has been added in Cart.');
    }


  }
  // key value to text convert with capitalize format
  capitalizeString(str) {
    let words = str.split('_');
    let capitalizedWords = words.map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    let capitalizedString = capitalizedWords.join(' ');

    return capitalizedString;
  }

  uploadFiles(files: FileList, formcontrolname, addon) {
    this.fileToUpload = files.item(0);

    this.productService.uploadImage(this.fileToUpload).subscribe(
      (res) => {
        this.value[formcontrolname] = addon.add_ons_value[0].price ? addon.add_ons_value[0].price:0 ;
        let imgobj = {
          keyname: formcontrolname,
          fileUrl: res['data'].fileUrl,
        };
        const exists = this.uploadAddonsImage.findIndex(el => el.keyname == formcontrolname);
        let oldObj = this.uploadAddonsImage.find(el => el.keyname == formcontrolname);
        if (exists == -1) {
          this.uploadAddonsImage.push(imgobj);
          this.productAddonsPrice += parseFloat(addon.add_ons_value[0].price ? addon.add_ons_value[0].price : 0)
        }
        else {
          oldObj.fileUrl = res['data'].fileUrl;
          this.uploadAddonsImage.splice(exists, 1, oldObj)
        }

        console.log('imgobj =======================>',imgobj);

      },
      (err) => {
        // console.log('GLB Image Upload Error',err);
      })
    // }
    console.log('this.uploadAddonsImage', this.uploadAddonsImage);
    console.log('this.addonSelectedResult', this.addonSelectedResult);
    console.log('this.productAddonsPrice ', this.productAddonsPrice);
  }

  onMultiInputChange(val: any, slug, addon) {
    let seletctObject =
    {
      key: addon.addon_slug,
      value: '',
      price: addon.add_ons_value[0].price ? addon.add_ons_value[0].price: 0,
      other: val
    }
    const exists = this.addonSelectedResult.findIndex(el => el.key == addon.addon_slug);
    let oldObj = this.addonSelectedResult.find(el => el.key == addon.addon_slug);
    // // If the key-value pair doesn't exist, push the object into the array
    if (exists == -1) {
      this.addonSelectedResult.push(seletctObject);
      this.productAddonsPrice += parseFloat(addon.add_ons_value[0].price? addon.add_ons_value[0].price: 0)
    }
    else {
      oldObj.other = val;
      this.addonSelectedResult.splice(exists, 1, oldObj)
    }

    console.log('this.addonSelectedResult', this.addonSelectedResult);
    console.log('this.productAddonsPrice ', this.productAddonsPrice);
  }

  onInputChange(val: any, slug, addon) {
    // Do something with the angle value
    this.productAddons.map((elm) => {
      if (elm.addon_slug == slug) {
        elm.add_ons_value[0].values = val;
        // return elm
      }
      this.range = true;
      if (val == 0 && (addon.add_ons_input == 'range' || addon.add_ons_input == 'range-input')) {
        elm.add_ons_value[0].values = val;
        this.range = false;
      }
    })
    const selecttxt = this.productAddons.find(item => item.addon_slug === slug);
    console.log('selecttxt Find', selecttxt);
    if (selecttxt) {
      this.value[slug] = selecttxt.add_ons_value[0].price ? selecttxt.add_ons_value[0].price: 0;
    }

    let seletctObject =
    {
      key: addon.addon_slug,
      value: val,
      price: addon.add_ons_value[0].price ? addon.add_ons_value[0].price:0,
      other: ''
    }
    const exists = this.addonSelectedResult.findIndex(el => el.key == addon.addon_slug);
    let oldObj = this.addonSelectedResult.find(el => el.key == addon.addon_slug);
    console.log('exists ===========>', exists);

    // // If the key-value pair doesn't exist, push the object into the array
    if (exists == -1) {
      this.addonSelectedResult.push(seletctObject);
      this.productAddonsPrice += parseFloat(addon.add_ons_value[0].price? addon.add_ons_value[0].price: 0)
    }
    else {
      console.log('val ===========>',Number(val) , addon.add_ons_input)

      if (Number(val) > 0 && (addon.add_ons_input == 'range' || addon.add_ons_input == 'range-input')) {
        if(oldObj.other != '')
        {
          seletctObject.other=oldObj.other;
        }
        this.addonSelectedResult.splice(exists, 1, seletctObject)
      }
      else 
      if (val.length > 0 && (addon.add_ons_input == 'input' || addon.add_ons_input == 'textarea')) {
        if(oldObj.other != '')
        {
          seletctObject.other=oldObj.other;
        }
        this.addonSelectedResult.splice(exists, 1, seletctObject)
      }
      else
      {
        this.addonSelectedResult.splice(exists, 1)
        this.productAddonsPrice -= parseFloat(oldObj.price)
      }
    }

    console.log('this.addonSelectedResult', this.addonSelectedResult);
    console.log('this.productAddonsPrice ', this.productAddonsPrice);
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
        let seletctObject =
        {
          key: dropdownSlug,
          value: selectedOption,
          price: priceObj.price ? priceObj.price : 0,
          other: ''
        }
        this.pushObjectIfKeyNotExists(this.addonSelectedResult, 'key', selectedOption, seletctObject);
        this.productAddonsPrice += parseFloat(priceObj.price ? priceObj.price : 0)

        console.log('this.addonSelectedResult', this.addonSelectedResult);
        console.log('this.productAddonsPrice ', this.productAddonsPrice);

        this.value[dropdownSlug] = priceObj.price;
      }
    }
  }

  pushObjectIfKeyNotExists(array, key, value, obj) {
    // Check if any object in the array has the specified key-value pair
    const exists = array.findIndex(el => el.key == obj.key);
    let oldObj = array.find(el => el.key == obj.key);
    // If the key-value pair doesn't exist, push the object into the array
    if (exists == -1) {
      array.push(obj);
    }
    else {
      array.splice(exists, 1, obj)
      this.productAddonsPrice -= parseFloat(oldObj.price ? oldObj.price:0)
    }
  }


  stingURLCheck(str) {
    if (str.startsWith("http")) {
      let parts = str.split('.');
      let extension = parts[parts.length - 1];
      if (extension == 'jpg' || extension == 'png') {
        return 'img';
      }
      else {
        return 'pdf';
      }

    }
    else {
      return false;
    }
  }

  // Buy Now
  async buyNow(product: any) {
    product.quantity = this.counter || 1;
    this.addonSelectedResult[this.addonSelectedResult.length + 1].extra_document=this.uploadAddonsImage;
    product.addons= this.addonSelectedResult
    console.log('Final Cart Product ==================>',product)
    const status = await this.productService.addToCart(product);
    if (status)
      this.router.navigate(['/checkout']);
  }

  // Add to Wishlist
  addToWishlist(product: any) {
    this.productService.addToWishlist(product);
    this.productWishliststatus = this.productService.wishlistProductCheck(product)
  }

}
