import { HomesliderService } from './../../../shared/services/homeslider.service';
import { Component, OnInit } from '@angular/core';
import { ProductSlider } from '../../../shared/data/slider';
import { Product } from '../../../shared/classes/product';
import { ProductService } from '../../../shared/services/product.service';
import { StoreService } from 'src/app/shared/services/store.service';
import { Store } from 'src/app/shared/classes/store';
import { Router } from '@angular/router';


@Component({
  selector: 'app-fashion-one',
  templateUrl: './fashion-one.component.html',
  styleUrls: ['./fashion-one.component.scss']
})
export class FashionOneComponent implements OnInit {

  public products: Product[] = [];
  public productCollections: any[] = [];
  public stores: Store[] = [];
  public homeslider:any=[];
  
  constructor(public productService: ProductService,public storeService: StoreService, public homesliderservice: HomesliderService) {
    // this.productService.getProducts.subscribe(response => {
    //   //console.log('Product Received!.....', response['data']);

    //   // this.products = response['data'].filter(item => item.product_category.category_slug == 'apparels');
    //   // //console.log('Items ==>',this.products);
      
    //   // Get Product Collection
    //   this.products.filter((item) => {
    //     item.collection.filter((collection) => {
    //       const index = this.productCollections.indexOf(collection);
    //       if (index === -1) this.productCollections.push(collection);
    //     })
    //   })
    // });
  }
  public ProductSliderConfig: any = ProductSlider;

  // public sliders = [{
  //   title: 'Shop The New Signature Collection',
  //   subTitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non porttitor leo, a.',
  //   image: 'assets/images/slider/facade_1.png'
  // }, 
  // {
  //   title: 'Welcome to fashion Women fashion',
  //   subTitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non porttitor leo, a.',
  //   image: 'assets/images/slider/facade_2.png'
  // }]

  public sliders = [];

  get(): void {
    this.storeService.getStores.subscribe(response => {

      if(response["error"] === 0){
        this.stores = response["data"];
        //console.log(this.stores);
      }
    });
  }


  ngOnInit(): void {
    this.get();
    this.getvendorlist();
    this.homesliderservice.getallSliderData().subscribe(
      res =>
      {
        this.sliders=res.data;
        //console.log('Banner Slider',res.data);
        console.log('Banner Slider this.sliders' ,this.sliders);
      }
    )

  }

  getvendorlist()
  {
    this.homesliderservice.getallvendorlist().subscribe(
      res =>
      {
        let vendors = res['data']
        vendors.map( (vid) =>
        {
          let SData=
          {
            vendor_id : vid._id
          }
          this.homesliderservice.getallVendorSliderData(SData).subscribe(
            res =>
            {
  
              for (const element of res.data) {
                this.sliders.push(element)
              }
              // this.homeslider = this.sliders.sort( () => Math.random() - 0.5);
            }
          )
        });

        console.log('vendors--------',vendors)
      }
    )
  }

  // Product Tab collection
  getCollectionProducts(collection) {
    return this.products.filter((item) => {
      if (item.collection.find(i => i === collection)) {
        return item
      }
    })
  }


  
}
