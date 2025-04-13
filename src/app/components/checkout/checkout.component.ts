// src/app/components/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { StripeService } from '../../services/stripe.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  cartTotal: number = 0;
  cartItems: any[] = [];
  shippingForm: FormGroup;
  paymentStep: number = 1; // 1: Shipping, 2: Payment, 3: Review
  loading: boolean = false;
  error: string = '';
  clientSecret: string = '';
  
  // For the Stripe Elements
  cardElement: any;
  cardErrors: string = '';
  
  constructor(
    private cartService: CartService,
    private stripeService: StripeService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.shippingForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['United States', [Validators.required]],
      phone: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
      
      // If cart is empty, redirect to cart page
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }
  
  nextStep(): void {
    if (this.paymentStep === 1 && this.shippingForm.valid) {
      this.paymentStep = 2;
      
      // Initialize Stripe elements after a short delay to ensure DOM is ready
      setTimeout(() => {
        this.initializeStripeElements();
      }, 100);
    } else if (this.paymentStep === 2) {
      this.paymentStep = 3;
    }
  }
  
  previousStep(): void {
    if (this.paymentStep > 1) {
      this.paymentStep--;
    }
  }
  
  async initializeStripeElements(): Promise<void> {
    try {
      this.loading = true;
      
      // Create a payment intent and get client secret
      this.stripeService.createPaymentIntent().subscribe({
        next: (response) => {
          this.clientSecret = response.clientSecret;
          
          // Get stripe instance
          const stripe = this.stripeService.getStripe();
          
          if (!stripe) {
            this.error = 'Payment system is not available. Please try again later.';
            this.loading = false;
            return;
          }
          
          // Create Elements instance
          const elements = stripe.elements();
          
          // Create and mount the card element
          this.cardElement = elements.create('card', {
            style: {
              base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                  color: '#aab7c4'
                }
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
              }
            }
          });
          
          this.cardElement.mount('#card-element');
          
          // Listen for card errors
          this.cardElement.on('change', (event: any) => {
            this.cardErrors = event.error ? event.error.message : '';
          });
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating payment intent:', error);
          this.error = 'Failed to set up payment. Please try again.';
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      this.loading = false;
      this.error = 'Failed to initialize payment system. Please try again.';
    }
  }
  
  async handleSubmit(): Promise<void> {
    if (this.paymentStep !== 3) return;
    
    try {
      this.loading = true;
      
       // Get stripe instance
        const stripe = this.stripeService.getStripe();
        
        if (!stripe) {
          this.error = 'Payment system is not available. Please try again later.';
          this.loading = false;
          return;
        }
      
      // Confirm the payment with shipping details
      const result = await stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.shippingForm.get('name')?.value,
            email: this.shippingForm.get('email')?.value,
            address: {
              line1: this.shippingForm.get('address')?.value,
              city: this.shippingForm.get('city')?.value,
              state: this.shippingForm.get('state')?.value,
              postal_code: this.shippingForm.get('zipCode')?.value,
              country: this.shippingForm.get('country')?.value
            }
          }
        },
        receipt_email: this.shippingForm.get('email')?.value
      });
      
      if (result.error) {
        this.error = result.error.message || 'An error occurred during payment. Please try again.';
        this.loading = false;
      } else if (result.paymentIntent.status === 'succeeded') {
        // Payment successful - redirect to confirmation page
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation'], { 
          state: { 
            orderId: result.paymentIntent.id,
            orderDetails: {
              items: this.cartItems,
              total: this.cartTotal,
              shipping: this.shippingForm.value
            }
          } 
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.loading = false;
      this.error = 'An unexpected error occurred. Please try again.';
    }
  }
}