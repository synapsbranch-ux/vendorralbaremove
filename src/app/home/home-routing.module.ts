import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FashionOneComponent } from './fashion/fashion-one/fashion-one.component';
import { StoreComponent } from './store/store.component';

const routes: Routes = [
  {
    path: 'fashion',
    component: FashionOneComponent
  },{
    path: 'store',
    component: StoreComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
