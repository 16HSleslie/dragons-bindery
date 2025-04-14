// src/app/components/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  isNewProduct: boolean = false;
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private router: Router
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
    // Navigate to the home page after logout
    this.router.navigate(['/']);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  handleQuickAction(action: string): void {
    if (action === 'addProduct') {
      this.openAddProductModal();
    }
    // Add other quick actions as needed
  }

  openAddProductModal(): void {
    // Create an empty product template
    this.selectedProduct = {
      _id: '', // This will be assigned by the backend
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      isNew: false,
      isBestseller: false,
      createdAt: new Date()
    };
    this.isNewProduct = true;
    this.showEditModal = true;
  }

  openEditModal(product: Product): void {
    this.selectedProduct = { ...product }; // Create a copy to avoid direct mutation
    this.isNewProduct = false;
    this.showEditModal = true;
  }
  
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProduct = null;
    this.isNewProduct = false;
  }
  
  handleSaveProduct(data: {product: Product, imageFile: File | null}): void {
    this.loading = true;
    this.error = ''; // Clear any previous errors
    
    // If we have a new image file, upload it first
    if (data.imageFile) {
      this.productService.uploadProductImage(data.imageFile).subscribe({
        next: (imageUrl) => {
          // Update product with new image URL
          const updatedProduct = {
            ...data.product,
            image: imageUrl
          };
          
          // Now save the product (create new or update existing)
          if (this.isNewProduct) {
            this.createNewProduct(updatedProduct);
          } else {
            this.updateProductData(updatedProduct);
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.loading = false;
          this.error = 'Failed to upload image. Please try again.';
          // Show the error message to the user
          alert('Failed to upload image: ' + (error.message || 'Unknown error'));
        }
      });
    } else {
      // No new image, just save the product
      if (this.isNewProduct) {
        if (!data.product.image) {
          // Require an image for new products
          this.loading = false;
          this.error = 'An image is required for new products.';
          alert('Please upload an image for the new product.');
          return;
        }
        this.createNewProduct(data.product);
      } else {
        this.updateProductData(data.product);
      }
    }
  }
  
  private createNewProduct(product: Omit<Product, '_id'>): void {
    this.productService.createProduct(product).subscribe({
      next: (newProduct) => {
        // Add the new product to the list
        this.products.unshift(newProduct);
        
        this.closeEditModal();
        this.loading = false;
        this.updateSuccess = true;
        this.successMessage = 'Product created successfully!';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.updateSuccess = false;
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.loading = false;
        this.error = 'Failed to create product. Please try again.';
        // Show the error message to the user
        alert('Failed to create product: ' + (error.message || 'Unknown error'));
      }
    });
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
        this.successMessage = 'Product updated successfully!';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.updateSuccess = false;
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.loading = false;
        this.error = 'Failed to update product. Please try again.';
        // Show the error message to the user
        alert('Failed to update product: ' + (error.message || 'Unknown error'));
      }
    });
  }
}