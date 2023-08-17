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
    private toastrService: ToastrService, private router: Router) {
      
     }

  /*
    ---------------------------------------------
    ---------------  Product  -------------------
    ---------------------------------------------
  */

    
//  resolve(route: ActivatedRouteSnapshot){
//   //console.log('Current Slug Products ===== ',route.params.slug);
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
          //  //console.log('Product Service Product Cat search Slug ===>',res);
 
           this.catagoriesalt = res['data'].product_category.category_slug;
          //  //console.log('product Slug catagories ======', res['data'].product_category.category_slug)
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




    // //console.log('Product Category Name arr === ',this.catarr);

    this.Products = this.http.post<ProductNew[]>(environment.baseUrl+'product/list',this.catarr).pipe(map((data:any)=>{
      // //console.log('Product Data === ',data.data);
      
      return data.data;
    }));
    


    this.Products.subscribe((next: any) => { 
     
      localStorage['products'] = JSON.stringify(next)

    });
    this.Products = this.Products.pipe(startWith(JSON.parse(localStorage['products'] || '[]')));
    return this.Products; 
  }

    //// Get all Categories List

  getallCategories()
  {
    return this.http.get(environment.baseUrl+'category');
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

  uploadImage(fileToUpload: File): Observable<any>
  {
    const formData: FormData = new FormData();
    formData.append('image', fileToUpload, fileToUpload.name);
    return this.http.post(environment.baseUrl+'user/upload',formData);
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
    //console.log('Wishlist added Localstorage',localStorage.getItem('wishlistItems'));
    return true
  }

  // Remove Wishlist items
  public removeWishlistItem(product: ProductNew): any {
    console.log('removeWishlistItem    product ==========================================>',product);
    console.log('removeWishlistItem     state.wishlist ==========================================>',state.wishlist);
    const index = state.wishlist.indexOf(product);
    console.log('removeWishlistItem    index ==========================================>',index);
    state.wishlist.splice(index, 1);
    localStorage.setItem("wishlistItems", JSON.stringify(state.wishlist));
    return true
  }

  public wishlistProductCheck(product: ProductNew): any
  {
    const wishlistItem = state.wishlist.find(item => item._id === product._id);

    console.log('wishlistProductCheck     product ==========================================>',product);
    console.log('wishlistProductCheck     state.wishlist ==========================================>',state.wishlist);
    console.log('wishlistProductCheck    wishlistItem ==========================================>',wishlistItem);
    if(wishlistItem)
    {
      return true
    }
    else
    {
      return false
    }
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
    const qty = product.quantity ? product.quantity : 0;
    const items = cartItem ? cartItem : product;
    const stock = this.calculateStockCounts(items, qty);
    
    if(!stock) return false

    console.log('Cart Product',product);

    if (cartItem) {
        cartItem.quantity += qty    
    } else {
      console.log('user Login')
          if(localStorage.getItem('user_id'))
          {
            let product_price=0;
            if(product.product_sale_price == null)
            {
              product_price=product.product_retail_price
            }
            else
            {
              product_price=product.product_sale_price
            }
            let cdata=
        {
          products:[{  "pro_id": product._id,
              "pro_name": product.product_name,
              "pro_image": product.product_image[0].pro_image,
              "pro_slug": product.product_slug,
              "qty": product.quantity,
              "price": product_price,
              "addons": product.addons,
              "addonsprice": product.addonsprice
            }]
        }
        //console.log('full Product Cart Data for Submit',cdata);
      
        this.addToCartDbBulk(cdata).subscribe(
        res =>  {  
          let bodydata=res['data'];
          if(bodydata.hasOwnProperty('products'))
          {
            console.log('element.products ======================>',res['data'].products)
           let cartproducts=[];
           let product_img
          for (const element of res['data'].products) {   
            console.log('element.pro_slug ======================>',element.pro_slug)
            this.getproductsBySlugs(element.pro_slug).subscribe(product => {
              console.log('product[data].product_image',product)
                product_img=product['data'].product_image[0].pro_image;
                let data = 
                {
                  "_id": element.pro_id,
                  "product_image": [
                    {
                        "pro_image": product_img,
                        "status": "active"
                    },
                  ],
                  "cart_id": res['data']._id,
                  "product_name": element.pro_name,
                  "product_slug": element.pro_slug,
                  "quantity": element.qty,
                  "stock":(product['data'].stock - element.qty),
                  "product_sale_price": element.price,
                  "addons": element.addons,
                  "addonsprice": element.addonsprice
                }
              console.log('Before Push Cart Items List',cartproducts)
              cartproducts.push(data);
              console.log('After Push Cart Items List',cartproducts)
              localStorage.setItem("cartItems", JSON.stringify(cartproducts));
              console.log('Return LocalStorage Product Service',localStorage.getItem("cartItems"));
              
            })    
            
            state.cart.push({
              ...product,
              quantity: qty,
              stock:product.stock,
              cart_id: res['data']._id,
              product_owner: product.product_owner._id
            })
          
      }
    }
          }
        )
      }
      else
      {

        console.log('user Not Login')

        state.cart.push({
          ...product,
          quantity: qty,
          product_owner: product.product_owner._id,
        })

        console.log('Cart item added from Without login Retain local ',state.cart);
      }


    }

    this.OpenCart = true; // If we use cart variation modal
    localStorage.setItem("cartItems", JSON.stringify(state.cart));
    //console.log('Local Storage Cart Item',state.cart);

    return true;
  }

  // Update Cart Quantity
  public updateCartQuantity(product: ProductNew, quantity: number): ProductNew | boolean {
    return state.cart.find((items, index) => {
      if (items._id === product._id) {
        
        const qty = product.quantity
        const stock = this.calculateStockCounts(state.cart[index], quantity)
        if (qty !== 0 && stock) { 
          state.cart[index].quantity = qty
        }

        const currentUser = localStorage.getItem("user_id");
        
        if(currentUser)
        {

          let product_price=0;
          if(product.product_sale_price == null)
          {
            product_price=product.product_retail_price
          }
          else
          {
            product_price=product.product_sale_price
          }

          let cdata=
      {
        products: [{
           "pro_id": product._id,
            "pro_name": product.product_name,
            "pro_image": product.product_image[0].pro_image,
            "pro_slug": product.product_slug,
            "qty": quantity,
            "price": product_price,
            "addons": product.addons

          }]
      }
      //console.log('full Product Cart Data for Submit',cdata);
    
      this.addToCartDbBulk(cdata).subscribe(
      res =>  {   
        let bodydata=res['data'];
        console.log('bodydata Cart Return',bodydata);
        if(bodydata.hasOwnProperty('products'))
        {
         let cartproducts=[];
         let product_img
        for (const element of res['data'].products) {   
          this.getproductsBySlugs(element.pro_slug).subscribe(product => {
              product_img=product['data'].product_image[0].pro_image;
              let data = 
              {
                "_id": element.pro_id,
                "product_image": [
                  {
                      "pro_image": product_img,
                      "status": "active"
                  },
                ],
                "cart_id": res['data']._id,
                "product_name": element.pro_name,
                "product_slug": element.pro_slug,
                "quantity": element.qty,
                "stock":(product['data'].stock - element.qty),
                "product_sale_price": element.price,
              }
            cartproducts.push(data);         
            localStorage.setItem("cartItems", JSON.stringify(cartproducts));
            console.log('Return LocalStorage Product Service',localStorage.getItem("cartItems"));
            
          })                          
        
    }
  }
        }
      )
    }
    return true;
      }
    })
  }

    // Calculate Stock Counts
  public calculateStockCounts(product, quantity) {
    const qty = product.quantity + quantity
    const stock = product.stock
    if (stock < 0) {
      this.toastrService.error('You can not add more items than available. In stock '+ stock +' items.');
      return false
    }
    return true
  }

  // Remove Cart items
  public removeCartItem(product: ProductNew): any {
    const index = state.cart.indexOf(product);
    // //console.log('Befor Structure Delete Cart',product);
    if(localStorage.getItem('user_id'))
    {
      const index2 = state.cart.indexOf(product);
      //console.log('Remove Cart User Login :',index2);
      state.cart.splice(index2, 1);
      localStorage.setItem("cartItems", JSON.stringify(state.cart));

      let dcDAta=
      {
        "cart_id": product.cart_id,
        "pro_id": product._id,
      }
      this.deleteToCartDb(dcDAta).subscribe(
        res =>
        {
          console.log('Delete Cart From DB Return',res);
        }
      )
    }
      else
      {
        //console.log('Remove Cart User Without Login :',index);

        state.cart.splice(index, 1);
        localStorage.setItem("cartItems", JSON.stringify(state.cart));
      }
   

    return true
  }

  // Total amount 
  public cartTotalAmount(): Observable<number> {
    return this.cartItems.pipe(map((product: ProductNew[]) => {

      return product.reduce((prev, curr: ProductNew) => {
        let product_price=0;
        if(curr.addonsprice)
        {
          if(curr.product_sale_price == null)
          {
            product_price=curr.product_retail_price + curr.addonsprice
          }
          else
          {
            product_price=curr.product_sale_price + curr.addonsprice
          }
        }else
        {
          if(curr.product_sale_price == null)
          {
            product_price=curr.product_retail_price
          }
          else
          {
            product_price=curr.product_sale_price
          }
        }
        
        let price = product_price;
        return prev + (price * curr.quantity) * this.Currency.price;
      }, 0);
    }));
  }



  /*
    ---------------------------------------------
    ------------  Filter Product  ---------------
    ---------------------------------------------
  */

  // Get Product Filter
  public filterProducts(filter: any): Observable<ProductNew[]> {
    return this.products.pipe(map(product => 
      product.filter((item: ProductNew) => {
        if (!filter.length) return true
        const Tags = filter.some((prev) => { // Match Tags
          if (item) {
            //console.log('Product Service YTags',item)
            return prev
          }
        })
        return Tags
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

addToCartDbBulk(data: any): Observable<any>{
  this.token = localStorage.getItem('user_token') // Will return if it is not set 

this.token = "Bearer " + this.token
let httpOptions = {
headers: new HttpHeaders({
  'Authorization': this.token
})
}

  return this.http.post(environment.baseUrl+'cart/bulkadd',data,httpOptions);
}

deleteToCartDb(data: any): Observable<any>{
this.token = localStorage.getItem('user_token') // Will return if it is not set 
this.token = "Bearer " + this.token
let httpOptions = {
headers: new HttpHeaders({
  'Authorization': this.token
})
}
  return this.http.post(environment.baseUrl+'cart/delete',data,httpOptions);
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




