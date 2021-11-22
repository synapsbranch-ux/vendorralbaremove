import { Component, OnInit } from '@angular/core';
import { NavService, Menu } from '../../services/nav.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public menuItems: Menu[];

  constructor(private router: Router, public navServices: NavService) {
   /* this.navServices.items.subscribe(menuItems => this.menuItems = menuItems );
    this.router.events.subscribe((event) => {
      this.navServices.mainMenuToggle = false;
    }); */
  }

  ngOnInit(): void {
    
   let menuarr= this.navServices.genMenu();
 

   //this.menuItems
    menuarr.subscribe(result=> {

      console.log('Menu item print ==== >',result);

      this.menuItems = result['data'].map(function(items) {
        let menuChild;
        if(items.category_child.length > 0){
          menuChild = items.category_child.map(function(childItems){
            
            console.log('Menu item child print ==== >',childItems.category_slug);

             return { path: 'shop/collection?category='+childItems.category_slug, title: childItems.category_name, type: 'link' }
          });
        }
        return {
          title: items.category_name, path: 'shop/collection?category='+items.category_slug, type: 'link', active: false, children: menuChild
        }
      });
    });
    
  }

  mainMenuToggle(): void {
   
    this.navServices.mainMenuToggle = !this.navServices.mainMenuToggle;
  }

  // Click Toggle menu (Mobile)
  toggletNavActive(item) {
    item.active = !item.active;
  }

}
