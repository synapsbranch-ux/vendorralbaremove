import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProductNew } from '../../../../shared/classes/product';

@Component({
  selector: 'app-size',
  templateUrl: './size.component.html',
  styleUrls: ['./size.component.scss']
})
export class SizeComponent implements OnInit {

  @Input() products: ProductNew[] = [];
  @Input() size: any[] = [];
  
  @Output() sizeFilter  : EventEmitter<any> = new EventEmitter<any>();

  public collapse: boolean = true;

  constructor() { 
  }

  ngOnInit(): void {

  }

  get filterbysize() {
    const uniqueSize = []
    this.products.filter((product) => {
      
      if(product.product_varient_options[0].size_options)
      {
      product.product_varient_options.filter((product_varient_color) => {
        if (product.product_varient_options[0].size_options) {
          const index = uniqueSize.indexOf(product.product_varient_options[0].size_options)
          if (index === -1) uniqueSize.push(product.product_varient_options[0].size_options)
        }
      })


    }
    })
    return uniqueSize
  }

  appliedFilter(event) {
    console.log('Apply Filter Value', event);
    let index = this.size.indexOf(event.target.value);  // checked and unchecked value
    // console.log('Apply Filter Value Index', this.size);
    if (event.target.checked) {
      this.size.push(event.target.value); // push in array cheked value
      console.log('Apply Filter Value Index', this.size);
    }  
    else 
    {
      this.size.splice(index,1);  // removed in array unchecked value  
    }
    
    let size = this.size.length ? { size: this.size.join(",") } : { size: null }; 
    this.sizeFilter.emit(size);
  }

  // check if the item are selected
  checked(item){
    if(this.size.indexOf(item) != -1){
      return true;
    }
  }

}
