// src/app/components/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProductService, Product } from '../../../services/product.service';
import { ProductEditModalComponent } from '../product-edit-modal/product-edit-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductEditModalComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;
  error: string = '';
  activeTab: string = 'products';

  // Modal state
  showEditModal: boolean = false;
  selectedProduct: Product | null = null;
  updateSuccess: boolean = false;  

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

  openEditModal(product: Product): void {
    this.selectedProduct = { ...product }; // Create a copy to avoid direct mutation
    this.showEditModal = true;
  }
  
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProduct = null;
  }
  
  handleSaveProduct(data: {product: Product, imageFile: File | null}): void {
    this.loading = true;
    
    // If we have a new image file, upload it first
    if (data.imageFile) {
      this.productService.uploadProductImage(data.imageFile).subscribe({
        next: (imageUrl) => {
          // Update product with new image URL
          const updatedProduct = {
            ...data.product,
            image: imageUrl
          };
          
          // Now update the product
          this.updateProductData(updatedProduct);
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.loading = false;
          this.error = 'Failed to upload image. Please try again.';
        }
      });
    } else {
      // No new image, just update the product
      this.updateProductData(data.product);
    }
  }
  
  private updateProductData(product: Product): void {
    this.productService.updateProduct(product._id, product).subscribe({
      next: (updatedProduct) => {
        // Update product in the list
        const index = this.products.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        
        this.closeEditModal();
        this.loading = false;
        this.updateSuccess = true;
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.updateSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.loading = false;
        this.error = 'Failed to update product. Please try again.';
      }
    });
  }

}