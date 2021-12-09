import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StoreService } from 'src/app/shared/services/store.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-box-one',
  templateUrl: './single-store.component.html',
  styleUrls: ['./single-store.component.scss']
})
export class SingleStoreComponent implements OnInit {

  public ImageSrc : string

  public stores;

  storename:string
  storeimgUrl:any
  store_id:any
  vendor_id:any

  StoreLists=[];

  DepartmentsList=[];


  constructor( private storeService: StoreService , private route: ActivatedRoute ) { 


  }

  ngOnInit() {
   
    this.route.params.subscribe(params => {      
      this.store_id=params['id'];
    });

    this.storeService.getStoresMore.subscribe(response => {
      console.log('Single Store response  =>', response['data']);
      this.StoreLists=response['data'];
      const child = this.StoreLists.map((store_l) => {
        if(store_l._id == this.store_id){    
          this.storename=store_l.store_name;
          this.storeimgUrl=store_l.store_image
          this.vendor_id=store_l.store_owner._id;
          return store_l.store_department;
        }
      });

      const filterItem = child.filter(item => item != undefined);
      if(filterItem.length > 0){
        this.DepartmentsList=filterItem[0];
      console.log(this.DepartmentsList);
      }

    });

  }

  stordepartment(departmenbt_id)
  {
    console.log('Department Id',departmenbt_id);
    console.log('Vendor Id', this.vendor_id);
    window.open("http://ralba3decommerce.s3-website-us-east-1.amazonaws.com?d_id="+departmenbt_id+"&v_id="+this.vendor_id , "_blank");
  }


}
