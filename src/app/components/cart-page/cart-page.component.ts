// src/app/components/cart-page/cart-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  
  constructor(private cartService: CartService) {}
  
  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
    });
  }
  
  updateQuantity(productId: string, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    } else {
      this.removeItem(productId);
    }
  }

  handleQuantityChange(productId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    this.updateQuantity(productId, value);
  }
  
  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }
  
  clearCart(): void {
    this.cartService.clearCart();
  }
}

