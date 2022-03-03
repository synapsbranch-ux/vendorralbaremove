import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, startWith, delay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ProductNew } from '../classes/product';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';

const state = {

  products: JSON.parse(localStorage['products'] || '[]'),
  wishlist: JSON.parse(localStorage['wishlistItems'] || '[]'),
  compare: JSON.parse(localStorage['compareItems'] || '[]'),
  cart: JSON.parse(localStorage['cartItems'] || '[]')
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  public Currency = { name: 'Dollar', currency: 'USD', price: 1 } // Default Currency
  public OpenCart: boolean = false;
  public Products
  catagories:any="";
  public catagoriesalt;
  token:any;
  catarr={};
  

  constructor(private http: HttpClient, private route: ActivatedRoute,
    private toastrService: ToastrService) {
      
     }

  /*
    ---------------------------------------------
    ---------------  Product  -------------------
    ---------------------------------------------
  */

    
//  resolve(route: ActivatedRouteSnapshot){
//   console.log('Current Slug Products ===== ',route.params.slug);
// }


  // Product


   private get products(): Observable<ProductNew[]> {
    this.catagories = this.route.snapshot.paramMap.get('slug');

    if(this.catagories != null)
    {
        this.catarr = {     
          'category': this.catagories,
      };
    }
    if(this.catagories === null)
    {
      if(localStorage.getItem("product_slug"))
      {
        this.getproductsBySlugs(localStorage.getItem("product_slug")).subscribe(
          res =>
          {
           console.log('Product Service Product Cat search Slug ===>',res);
 
           this.catagoriesalt = res['data'].product_category.category_slug;
           console.log('product Slug catagories ======', res['data'].product_category.category_slug)
           this.catarr = {     
             'category': this.catagoriesalt,
         };
          }
        )
      }
      else
      {
        this.catarr = {     
          'category': localStorage.getItem("cat_slug"),
      };
      }

    }

    console.log('Product Category Name arr === ',this.catarr);

    this.Products = this.http.post<ProductNew[]>(environment.baseUrl+'product/list',this.catarr).pipe(map((data:any)=>{
      console.log('Product Data === ',data.data);
      
      return data.data;
    }));
    


    this.Products.subscribe((next: any) => { 
     
      localStorage['products'] = JSON.stringify(next)

    });
    this.Products = this.Products.pipe(startWith(JSON.parse(localStorage['products'] || '[]')));
    return this.Products; 
  }



  // Get Products
  public get getProducts(): Observable<ProductNew[]> {
    
    return this.products;
  } 

  getProductsBycat(catdata: any): Observable<any> {
      return this.http.post<ProductNew[]>(environment.baseUrl+'product/list',catdata);
  } 

    // Get Products BY categoriess
   getProductscat(data: any): Observable<any> {
    return this.http.post<ProductNew[]>(environment.baseUrl+'product/list',data);
    } 

    getSettingsDetails(): Observable<any> {
      return this.http.get(environment.baseUrl+'settings');
  } 

  // Get Products By Slug

  public getProductBySlug(slug: string): Observable<ProductNew> {
    return this.products.pipe(map(items => { 
      return items.find((item: any) => { 
        return item.product_slug === slug; 
      }); 
    }));
  }

  getproductsBySlugs(data: any): Observable<any>{

    return this.http.get(environment.baseUrl+'product/'+data);
  }

  /*
    ---------------------------------------------
    ---------------  Wish List  -----------------
    ---------------------------------------------
  */

  // Get Wishlist Items
  public get wishlistItems(): Observable<ProductNew[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.wishlist);
      observer.complete();
    });
    return <Observable<ProductNew[]>>itemsStream;
  }

  // Add to Wishlist
  public addToWishlist(product): any {
    const wishlistItem = state.wishlist.find(item => item._id === product._id);
    if (!wishlistItem) {
      state.wishlist.push({
        ...product
      })
    }
    this.toastrService.success('Product has been added in wishlist.');
    localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
    console.log('Wishlist added Localstorage',localStorage.getItem('wishlistItems'));
    return true
  }

  // Remove Wishlist items
  public removeWishlistItem(product: ProductNew): any {
    const index = state.wishlist.indexOf(product);
    state.wishlist.splice(index, 1);
    localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
    return true
  }

  /*
    ---------------------------------------------
    -------------  Compare Product  -------------
    ---------------------------------------------
  */

  // Get Compare Items
  public get compareItems(): Observable<ProductNew[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.compare);
      observer.complete();
    });
    return <Observable<ProductNew[]>>itemsStream;
  }

  // Add to Compare
  public addToCompare(product): any {
    const compareItem = state.compare.find(item => item.id === product._id)
    if (!compareItem) {
      state.compare.push({
        ...product
      })
    }
    this.toastrService.success('Product has been added in compare.');
    localStorage.setItem("compareItems", JSON.stringify(state.compare));
    return true
  }

  // Remove Compare items
  public removeCompareItem(product: ProductNew): any {
    const index = state.compare.indexOf(product);
    state.compare.splice(index, 1);
    localStorage.setItem("compareItems", JSON.stringify(state.compare));
    return true
  }

  /*
    ---------------------------------------------
    -----------------  Cart  --------------------
    ---------------------------------------------
  */

  // Get Cart Items
  public get cartItems(): Observable<ProductNew[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.cart);
      observer.complete();
    });
    return <Observable<ProductNew[]>>itemsStream;
  }

  // Add to Cart
  public addToCart(product): any {
    const cartItem = state.cart.find(item => item._id === product._id);
    const qty = product.quantity ? product.quantity : 1;
    const items = cartItem ? cartItem : product;

    if (cartItem) {
        cartItem.quantity += qty    
    } else {
      state.cart.push({
        ...product,
        quantity: qty
      })
    }

    this.OpenCart = true; // If we use cart variation modal

    const currentUser = localStorage.getItem("user_id");
    if (currentUser) {
      localStorage.setItem("cartItems", JSON.stringify(state.cart));
      this.addToCartItemDb(product)
      console.log('Add to cart User Login === ',state.cart);
    }
    else
    {
      localStorage.setItem("cartItems", JSON.stringify(state.cart));
      console.log('Add to cart User Not Login === ',state.cart);
    }

    
    console.log('Add to cart === ',state.cart);
    return true;
  }

  // Update Cart Quantity
  public updateCartQuantity(product: ProductNew, quantity: number): ProductNew | boolean {
    return state.cart.find((items, index) => {
      if (items._id === product._id) {
       
        const qty = state.cart[index].quantity + quantity
        const stock = this.calculateStockCounts(state.cart[index], quantity)
        if (qty !== 0 && stock) {
          state.cart[index].quantity = qty
        }
        else
        {
          this.removeCartItem(product);
        }
        const currentUser = localStorage.getItem("user_id");
        if (currentUser) {
          localStorage.setItem("cartItems", JSON.stringify(state.cart));
          this.addToCartItemDb(product)
          console.log('Add to cart User Login === ',state.cart);
        }
        else
        {
          localStorage.setItem("cartItems", JSON.stringify(state.cart));
          console.log('Add to cart User Not Login === ',state.cart);
        }
        return true
      }
    })
  }

    // Calculate Stock Counts
  public calculateStockCounts(product, quantity) {
    const qty = product.quantity + quantity
    const stock = product.stock
    if (stock < qty || stock == 0) {
      this.toastrService.error('You can not add more items than available. In stock '+ stock +' items.');
      return false
    }
    return true
  }

  // Remove Cart items
  public removeCartItem(product: ProductNew): any {
    const index = state.cart.indexOf(product);
    state.cart.splice(index, 1);
    localStorage.setItem("cartItems", JSON.stringify(state.cart));
    return true
  }

  // Total amount 

  public cartTotalAmount(): Observable<number> {
    return this.cartItems.pipe(map((product: ProductNew[]) => {
      return product.reduce((prev, curr: ProductNew) => {
        let price = curr.product_sale_price;
        return (prev + price * curr.quantity) * this.Currency.price;
      }, 0);
    }));
  }


    /*
    ---------------------------------------------
    ---------------  ADD To CART DATABASE  -----------------
    ---------------------------------------------
  */

  // Get Cart Items

  public get cartItemsDb(): Observable<ProductNew[]> {
    const itemsStream = new Observable(observer => {
      observer.next(state.cart);
      observer.complete();
    });
    return <Observable<ProductNew[]>>itemsStream;
  }

  // Add to Cart
  public addToCartItemDb(product): any {
    const cartItem = state.cart.find(item => item._id === product._id);
    console.log('check add to cart DB', cartItem);

    for (const element of state.cart) {
      console.log(element);

      let data = 
      {
        "pro_id": element._id,
        "pro_name": element.product_name,
        "pro_slug": element.product_slug,
        "qty": element.quantity,
        "price": element.product_sale_price,
        "options":[
            {"size": element.product_varient_options[0].size_options},
            {"color": element.product_varient_options[1].color_options}
        ]
    }

    this.addToCartDb(data).subscribe(
      res => {

        console.log('Cart Added',res);  
      },
      error => {
        // .... HANDLE ERROR HERE 
        console.log(error.message);
   }
    );      

    }

  this.allCartProducts().subscribe(
    res =>{
      console.log('Return Cart Products',res);
    }
  )
    return true;
  }

  // // Remove Cart items
  // public removeCartItemDb(product: ProductNew): any {
  //   const index = state.wishlist.indexOf(product);
  //   state.wishlist.splice(index, 1);
  //   localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
  //   return true
  // }

  /*
    ---------------------------------------------
    ------------  Filter Product  ---------------
    ---------------------------------------------
  */

  // Get Product Filter
  public filterProducts(filter: any): Observable<ProductNew[]> {
    
    return this.products.pipe(map((product) => 
      product.filter((item: ProductNew) => {
        console.log('Service. Filter ==>',item);
        if (!filter.length) return true
      })
    ));
  }

  // Sorting Filter
  public sortProducts(products: ProductNew[], payload: string): any {

    if(payload === 'ascending') {
      return products.sort((a, b) => {
        if (a._id < b._id) {
          return -1;
        } else if (a._id > b._id) {
          return 1;
        }
        return 0;
      })
    } else if (payload === 'a-z') {
      return products.sort((a, b) => {
        if (a.product_name < b.product_name) {
          return -1;
        } else if (a.product_name > b.product_name) {
          return 1;
        }
        return 0;
      })
    } else if (payload === 'z-a') {
      return products.sort((a, b) => {
        if (a.product_name > b.product_name) {
          return -1;
        } else if (a.product_name < b.product_name) {
          return 1;
        }
        return 0;
      })
    } else if (payload === 'low') {
      return products.sort((a, b) => {
        if (a.product_sale_price < b.product_sale_price) {
          return -1;
        } else if (a.product_sale_price > b.product_sale_price) {
          return 1;
        }
        return 0;
      })
    } else if (payload === 'high') {
      return products.sort((a, b) => {
        if (a.product_sale_price > b.product_sale_price) {
          return -1;
        } else if (a.product_sale_price < b.product_sale_price) {
          return 1;
        }
        return 0;
      })
    } 
  }

  /*
    ---------------------------------------------
    ------------- Product Pagination  -----------
    ---------------------------------------------
  */
  public getPager(totalItems: number, currentPage: number = 1, pageSize: number = 16) {
    // calculate total pages
    let totalPages = Math.ceil(totalItems / pageSize);

    // Paginate Range
    let paginateRange = 3;

    // ensure current page isn't out of range
    if (currentPage < 1) { 
      currentPage = 1; 
    } else if (currentPage > totalPages) { 
      currentPage = totalPages; 
    }
    
    let startPage: number, endPage: number;
    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else if(currentPage < paginateRange - 1){
      startPage = 1;
      endPage = startPage + paginateRange - 1;
    } else {
      startPage = currentPage - 1;
      endPage =  currentPage + 1;
    }

    // calculate start and end item indexes
    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    };
  }

  ////////////////////////////////////////
// API Call For ADD TO CArt
////////////////////////////////////////

addToCartDb(data: any): Observable<any>{
  this.token = localStorage.getItem('user_token') // Will return if it is not set 

this.token = "Bearer " + this.token
let httpOptions = {
headers: new HttpHeaders({
  'Authorization': this.token
})
}

  return this.http.post(environment.baseUrl+'cart/add',data,httpOptions);
} 

allCartProducts(){
  this.token = localStorage.getItem('user_token') // Will return if it is not set 
  
  let httpOptionsroom = {
    headers: new HttpHeaders({
      'Authorization': "Bearer " + this.token
    })
  }
  
  return this.http.get(environment.baseUrl+'cart/list',httpOptionsroom);

}

productSearch(data:any)
{
  return this.http.post(environment.baseUrl+'productsearch',data);
}

}




