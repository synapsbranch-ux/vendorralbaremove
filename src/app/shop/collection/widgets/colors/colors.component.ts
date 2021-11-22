import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductNew } from '../../../../shared/classes/product';

@Component({
  selector: 'app-colors',
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.scss']
})
export class ColorsComponent implements OnInit {

  @Input() products: ProductNew[] = [];
  @Input() colors: any[] = [];

  @Output() colorsFilter  : EventEmitter<any> = new EventEmitter<any>();
  
  public collapse: boolean = true;

  constructor() { 
  }

  ngOnInit(): void {
  }

  get filterbycolor() {
    const uniqueColors = []
    this.products.filter((product) => {
      if(product.product_varient_options[1])
      {
      product.product_varient_options[1].color_options.filter((product_varient_options) => {
        if (product_varient_options[1].color_options) {
          const index = uniqueColors.indexOf(product_varient_options[1].color_options)
          if (index === -1) uniqueColors.push(product_varient_options[1].color_options)
        }
      })
    }
    })
    return uniqueColors
  }

  appliedFilter(event) {
    let index = this.colors.indexOf(event.target.value);  // checked and unchecked value
    if (event.target.checked)   
        this.colors.push(event.target.value); // push in array cheked value
    else 
        this.colors.splice(index,1);  // removed in array unchecked value
    
    let colors = this.colors.length ? { color: this.colors.join(",") } : { color: null };    
    this.colorsFilter.emit(colors);
  }

  // check if the item are selected
  checked(item){
    if(this.colors.indexOf(item) != -1){
      return true;
    }
  }

}
