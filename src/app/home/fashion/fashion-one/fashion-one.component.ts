import { Component, OnInit } from '@angular/core';
import { ProductSlider } from '../../../shared/data/slider';
import { Product } from '../../../shared/classes/product';
import { ProductService } from '../../../shared/services/product.service';
import { StoreService } from 'src/app/shared/services/store.service';
import { Store } from 'src/app/shared/classes/store';

@Component({
  selector: 'app-fashion-one',
  templateUrl: './fashion-one.component.html',
  styleUrls: ['./fashion-one.component.scss']
})
export class FashionOneComponent implements OnInit {

  public products: Product[] = [];
  public productCollections: any[] = [];
  public stores: Store[] = [];
  
  constructor(public productService: ProductService,public storeService: StoreService) {
    this.productService.getProducts.subscribe(response => {
      console.log('Product Received!', response);
      this.products = response.filter(item => item.type == 'fashion');
      // Get Product Collection
      this.products.filter((item) => {
        item.collection.filter((collection) => {
          const index = this.productCollections.indexOf(collection);
          if (index === -1) this.productCollections.push(collection);
        })
      })
    });
  }
  public ProductSliderConfig: any = ProductSlider;

  public sliders = [{
    title: 'Shop The New',
    subTitle: 'Signature Collection',
    discription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non porttitor leo, a.',
    image: 'assets/images/slider/home_slider.png'
  }, 
  {
    title: 'welcome to fashion',
    subTitle: 'Women fashion',
    discription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non porttitor leo, a.',
    image: 'assets/images/slider/home_slider.png'
  }]

  get(): void {
    this.storeService.getStores.subscribe(response => {

      if(response["error"] === 0){
        this.stores = response["data"];
        console.log(this.stores);
      }
    });
  }

  ngOnInit(): void {
    this.get();
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
