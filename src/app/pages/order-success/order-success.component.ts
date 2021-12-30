import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductNew } from 'src/app/shared/classes/product';
import { ProductSlider } from 'src/app/shared/data/slider';
import { ProductService } from 'src/app/shared/services/product.service';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
  public today: number = Date.now();
  public products: ProductNew[] = [];
  public ProductSliderConfig: any = ProductSlider;
  cartproducts=[];
  product_img:any;


  constructor(public product_service: ProductService) {
    this.product_service.cartItems.subscribe(response => this.products = response);
  }

  ngOnInit(): void {
  }

  public get getTotal(): Observable<number> {
    return this.product_service.cartTotalAmount();
  }

}
