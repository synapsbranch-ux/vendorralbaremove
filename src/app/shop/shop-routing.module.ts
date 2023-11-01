import { SettingsComponent } from './../shared/components/settings/settings.component';
import { AuthGuard } from './../shared/services/auth-guard.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductNoSidebarComponent } from './product/sidebar/product-no-sidebar/product-no-sidebar.component';
import { CollectionComponent } from './collection/collection.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CompareComponent } from './compare/compare.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SuccessComponent } from './checkout/success/success.component';

import { Resolver } from '../shared/services/resolver.service';

const routes: Routes = [

  {
    path: 'product/:slug',
    component: ProductNoSidebarComponent,
  },

  {
    path: '2d-products/:slug/:page',
    component: CollectionComponent
  },
  {
    path: 'cart',
    component: CartComponent,  canActivate: [AuthGuard]
  },
  {
    path: 'wishlist',
    component: WishlistComponent,  canActivate: [AuthGuard]
  },
  {
    path: 'compare',
    component: CompareComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent,  canActivate: [AuthGuard]
  },
  {
    path: 'settings-header',
    component: SettingsComponent
  }
  // {
  //   path: 'checkout/success/:id',
  //   component: SuccessComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
