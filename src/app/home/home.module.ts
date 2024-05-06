import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';

import { FashionOneComponent } from './fashion/fashion-one/fashion-one.component';

// Widgest Components
import { SliderComponent } from './widgets/slider/slider.component';
import { BlogComponent } from './widgets/blog/blog.component';
import { LogoComponent } from './widgets/logo/logo.component';
import { ServicesComponent } from './widgets/services/services.component';
import { CollectionComponent } from './widgets/collection/collection.component';
import { StoreComponent } from '../store/store.component';
import { SingleStoreComponent } from '../store/single-store/single-store.component';
import { SingleStoreBannerComponent } from '../store/single-store-banner/single-store-banner.component';
import { NewHomeComponent } from './new-home/new-home.component';
import { NewTermComponent } from './new-term/new-term.component';

@NgModule({
  declarations: [
    FashionOneComponent,
    // Widgest Components
    SliderComponent,
    BlogComponent,
    LogoComponent,
    ServicesComponent,
    CollectionComponent,
    StoreComponent,
    SingleStoreComponent,
    SingleStoreBannerComponent,
    NewHomeComponent,
    NewTermComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
