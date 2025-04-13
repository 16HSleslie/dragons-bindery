// src/app/components/cart-dropdown/cart-dropdown.component.ts
import { Component, OnInit } from '@angular/core';
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
  
  toggleCart(): void {
    this.isOpen = !this.isOpen;
  }
  
  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }
  
  updateQuantity(productId: string, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    } else {
      this.removeItem(productId);
    }
  }
}