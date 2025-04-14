import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartDropdownComponent } from '../cart-dropdown/cart-dropdown.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, CartDropdownComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartCount: number = 0;
  isAdmin: boolean = false;
  private authSubscription: Subscription | null = null;
  
  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    this.cartService.getCart().subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
    });
  }
  
  // Add a logout method that can be called from the header
  logout(): void {
    this.authService.logout();
    // Navigate to the home page after logout
    this.router.navigate(['/']);
  }
  
  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authSubscription = this.authService.isAuthenticated().subscribe(isAuthenticated => {
      this.isAdmin = isAuthenticated;
    });
    
    // Set initial state
    this.isAdmin = this.authService.isLoggedIn;
  }
  
  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}