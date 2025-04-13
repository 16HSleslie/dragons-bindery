import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartDropdownComponent } from '../cart-dropdown/cart-dropdown.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, CartDropdownComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  cartCount: number = 0;
  
  constructor(private cartService: CartService) {
    this.cartService.getCart().subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
    });
  }
}