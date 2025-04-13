// Make sure CartService handles the cart count properly
// The implementation in src/app/services/cart.service.ts looks good already, 
// but we should verify the cart dropdown component is using it correctly:

// src/app/components/cart-dropdown/cart-dropdown.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-dropdown.component.html',
  styleUrl: './cart-dropdown.component.scss'
})
export class CartDropdownComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  isOpen: boolean = false;
  
  constructor(private cartService: CartService) {}
  
  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
    });
  }
  
  // Close the cart when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const cartElement = (event.target as HTMLElement).closest('.cart-wrapper');
    if (!cartElement && this.isOpen) {
      this.isOpen = false;
    }
  }
  
  toggleCart(event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent the document click handler from triggering
    }
    this.isOpen = !this.isOpen;
  }
  
  removeItem(productId: string, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent the cart from closing
    }
    this.cartService.removeFromCart(productId);
  }
  
  updateQuantity(productId: string, quantity: number, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent the cart from closing
    }
    
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    } else {
      this.removeItem(productId);
    }
  }
}