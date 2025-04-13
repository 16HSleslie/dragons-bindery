// src/app/services/cart.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only access localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Load cart from localStorage if available
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.cartItems = JSON.parse(savedCart);
          this.cartSubject.next(this.cartItems);
        } catch (e) {
          console.error('Error parsing cart from localStorage:', e);
          this.cartItems = [];
          this.cartSubject.next([]);
        }
      }
    }
  }
  
  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }
  
  addToCart(product: Product, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.product._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }
    
    this.updateCart();
  }
  
  updateQuantity(productId: string, quantity: number): void {
    const item = this.cartItems.find(item => item.product._id === productId);
    
    if (item) {
      item.quantity = quantity;
      this.updateCart();
    }
  }
  
  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.product._id !== productId);
    this.updateCart();
  }
  
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }
  
  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }
  
  getCartCount(): number {
    return this.cartItems.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  }
  
  private updateCart(): void {
    this.cartSubject.next([...this.cartItems]);
    
    // Only access localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }
  }
}