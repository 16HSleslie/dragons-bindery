// src/app/services/stripe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: Stripe | null = null;
  private apiUrl = 'http://localhost:5000/api/payment'; // Your backend API endpoint
  
  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {
    // Initialize Stripe
    this.initializeStripe();
  }
  
  private async initializeStripe(): Promise<void> {
    // Replace with your actual Stripe publishable key
    this.stripe = await loadStripe('pk_test_your_publishable_key_here');
  }
  
  getStripe(): Stripe | null {
    return this.stripe;
  }
  
  // Create a payment intent on the server
  createPaymentIntent(): Observable<{ clientSecret: string }> {
    const amount = this.cartService.getCartTotal();
    
    // Get cart items
    let cartItems: any[] = [];
    this.cartService.getCart().subscribe(items => {
      cartItems = items;
    });
    
    // Convert to a format suitable for the server
    const orderItems = cartItems.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));
    
    // Make the request to create a payment intent
    return this.http.post<{ clientSecret: string }>(
      `${this.apiUrl}/create-payment-intent`,
      {
        amount: Math.round(amount * 100), // Convert to cents for Stripe
        items: orderItems
      }
    );
  }
}