import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ShopComponent } from './components/shop/shop.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartPageComponent } from './components/cart-page/cart-page.component';
import { CheckoutComponent } from './components/checkout/checkout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: '**', redirectTo: '' }
];