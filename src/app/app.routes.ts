import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ShopComponent } from './components/shop/shop.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartPageComponent } from './components/cart-page/cart-page.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'shop/product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'checkout', component: CheckoutComponent },
  // Admin routes
  { path: 'admin/login', component: AdminLoginComponent },
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  // Redirect /admin to the dashboard if authenticated
  { 
    path: 'admin', 
    redirectTo: 'admin/dashboard', 
    pathMatch: 'full' 
  },
  { path: '**', redirectTo: '' }
];