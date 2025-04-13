// src/app/components/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;
  error: string = '';
  activeTab: string = 'products';

  constructor(
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load products';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}