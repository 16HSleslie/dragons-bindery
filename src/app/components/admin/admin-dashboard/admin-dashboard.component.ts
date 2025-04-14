// src/app/components/admin/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Add this import
import { AuthService } from '../../../services/auth.service';
import { ProductService, Product } from '../../../services/product.service';
import { ProductEditModalComponent } from '../product-edit-modal/product-edit-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductEditModalComponent, FormsModule], // Add FormsModule
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading: boolean = true;
  error: string = '';
  activeTab: string = 'products';
  
  // Page and product meta data
  productCount: number = 0;
  orderCount: number = 0;
  customerCount: number = 0;
  totalRevenue: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  
  // Filter and sort properties
  productSearchTerm: string = '';
  productCategoryFilter: string = '';
  productStatusFilter: string = '';
  productViewMode: string = 'grid';
  productSortField: string = 'name';
  productSortDirection: string = 'asc';
  productCategories: string[] = [];

  // Modal state
  showEditModal: boolean = false;
  showDeleteConfirmation: boolean = false;
  showHelpModal: boolean = false;
  helpModalTitle: string = '';
  helpModalContent: string = '';
  selectedProduct: Product | null = null;
  productToDelete: Product | null = null;
  isNewProduct: boolean = false;
  updateSuccess: boolean = false;
  successMessage: string = '';
  
  // Sample recent activities
  recentActivities: any[] = [];

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.setupDashboardData();
  }

  setupDashboardData(): void {
    // Set sample counts for dashboard
    this.productCount = this.products.length;
    this.orderCount = 5;
    this.customerCount = 12;
    this.totalRevenue = 1245.50;
    
    // Set sample activities
    this.recentActivities = [
      {
        icon: 'shopping_bag',
        description: 'New order received for 3 items',
        time: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        icon: 'inventory_2',
        description: 'Product "Dragon Scale Journal" updated',
        time: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.productCount = products.length;
        this.extractCategories();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load products';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }
  
  extractCategories(): void {
    // Get unique categories
    const uniqueCategories = new Set(this.products.map(product => product.category));
    this.productCategories = Array.from(uniqueCategories);
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

  // Product view, filter and sort methods
  setProductViewMode(mode: string): void {
    this.productViewMode = mode;
  }
  
  filterProducts(): void {
    let filtered = [...this.products];
    
    // Apply search filter
    if (this.productSearchTerm) {
      const search = this.productSearchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) || 
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search)
      );
    }
    
    // Apply category filter
    if (this.productCategoryFilter) {
      filtered = filtered.filter(product => product.category === this.productCategoryFilter);
    }
    
    // Apply status filter
    if (this.productStatusFilter) {
      filtered = filtered.filter(product => product[this.productStatusFilter as keyof Product] === true);
    }
    
    this.filteredProducts = filtered;
    this.currentPage = 1;
  }
  
  clearProductSearch(): void {
    this.productSearchTerm = '';
    this.filterProducts();
  }
  
  resetProductFilters(): void {
    this.productSearchTerm = '';
    this.productCategoryFilter = '';
    this.productStatusFilter = '';
    this.filteredProducts = [...this.products];
    this.currentPage = 1;
  }
  
  sortProducts(field: string): void {
    if (this.productSortField === field) {
      // Toggle sort direction
      this.productSortDirection = this.productSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.productSortField = field;
      this.productSortDirection = 'asc';
    }
    
    // Sort the products
    this.filteredProducts.sort((a, b) => {
      const aValue = a[field as keyof Product];
      const bValue = b[field as keyof Product];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.productSortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.productSortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });
  }

  // Pagination methods
  changePage(page: number): void {
    this.currentPage = page;
  }
  
  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  // Modal methods
  openAddProductModal(): void {
    // Create an empty product template
    this.selectedProduct = {
      _id: '',
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
    this.selectedProduct = { ...product };
    this.isNewProduct = false;
    this.showEditModal = true;
  }
  
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedProduct = null;
    this.isNewProduct = false;
  }
  
  confirmDeleteProduct(product: Product): void {
    this.productToDelete = product;
    this.showDeleteConfirmation = true;
  }
  
  cancelDeleteProduct(): void {
    this.showDeleteConfirmation = false;
    this.productToDelete = null;
  }
  
  deleteProduct(): void {
    if (!this.productToDelete) return;
    
    const productId = this.productToDelete._id;
    this.loading = true;
    
    this.productService.deleteProduct(productId).subscribe({
      next: (success) => {
        if (success) {
          // Remove product from lists
          this.products = this.products.filter(p => p._id !== productId);
          this.filteredProducts = this.filteredProducts.filter(p => p._id !== productId);
          
          this.showDeleteConfirmation = false;
          this.productToDelete = null;
          this.loading = false;
          this.updateSuccess = true;
          this.successMessage = 'Product deleted successfully!';
          
          // Hide success message after 3 seconds
          setTimeout(() => {
            this.updateSuccess = false;
            this.successMessage = '';
          }, 3000);
        }
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.loading = false;
        this.error = 'Failed to delete product. Please try again.';
        this.showDeleteConfirmation = false;
      }
    });
  }
  
  handleSaveProduct(data: {product: Product, imageFile: File | null}): void {
    this.loading = true;
    this.error = '';
    
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
        }
      });
    } else {
      // No new image, just save the product
      if (this.isNewProduct) {
        if (!data.product.image) {
          // Require an image for new products
          this.loading = false;
          this.error = 'An image is required for new products.';
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
        this.filteredProducts.unshift(newProduct);
        
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
        
        // Update in filtered list too
        const filteredIndex = this.filteredProducts.findIndex(p => p._id === updatedProduct._id);
        if (filteredIndex !== -1) {
          this.filteredProducts[filteredIndex] = updatedProduct;
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
      }
    });
  }

  // Help functions
  showHelp(): void {
    this.helpModalTitle = 'Dragon\'s Bindery Admin Help';
    this.helpModalContent = `
      <h4>Getting Started</h4>
      <p>Welcome to the Dragon's Bindery Admin Panel. This dashboard helps you manage your products, orders, customers, and store settings.</p>
      
      <h4>Navigation</h4>
      <p>Use the sidebar menu to navigate between different sections of the admin panel:</p>
      <ul>
        <li><strong>Dashboard</strong> - Overview of store performance</li>
        <li><strong>Products</strong> - Manage your product catalog</li>
        <li><strong>Orders</strong> - View and process customer orders</li>
        <li><strong>Customers</strong> - Manage customer accounts</li>
        <li><strong>Settings</strong> - Configure store settings</li>
      </ul>
    `;
    this.showHelpModal = true;
  }
  
  showTabHelp(tab: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    switch(tab) {
      case 'dashboard':
        this.helpModalTitle = 'Dashboard Help';
        this.helpModalContent = `
          <h4>Dashboard Overview</h4>
          <p>The dashboard provides a quick overview of your store's performance with key metrics and recent activity.</p>
          
          <h4>Statistics Cards</h4>
          <p>These cards show your total products, orders, customers, and revenue.</p>
          
          <h4>Quick Actions</h4>
          <p>Use these buttons to quickly perform common tasks like adding products or checking orders.</p>
          
          <h4>Recent Activity</h4>
          <p>Shows the latest actions and events in your store.</p>
        `;
        break;
        
      case 'products':
        this.helpModalTitle = 'Products Help';
        this.helpModalContent = `
          <h4>Managing Products</h4>
          <p>The Products section allows you to add, edit, and delete products in your store.</p>
          
          <h4>Adding a Product</h4>
          <p>Click the "Add New Product" button to create a new product. Fill in the required fields and upload an image.</p>
          
          <h4>Editing Products</h4>
          <p>Click the edit icon on any product to modify its details.</p>
          
          <h4>Deleting Products</h4>
          <p>Use the delete icon to remove a product. You'll be asked to confirm this action.</p>
        `;
        break;
        
      case 'orders':
        this.helpModalTitle = 'Orders Help';
        this.helpModalContent = `
          <h4>Managing Orders</h4>
          <p>This section will allow you to view and process customer orders.</p>
          
          <p>This feature is coming soon. Check back for updates!</p>
        `;
        break;
        
      case 'customers':
        this.helpModalTitle = 'Customers Help';
        this.helpModalContent = `
          <h4>Managing Customers</h4>
          <p>This section will allow you to view and manage customer accounts.</p>
          
          <p>This feature is coming soon. Check back for updates!</p>
        `;
        break;
        
      case 'settings':
        this.helpModalTitle = 'Settings Help';
        this.helpModalContent = `
          <h4>Store Settings</h4>
          <p>This section will allow you to configure your store settings including payment methods, shipping options, and more.</p>
          
          <p>This feature is coming soon. Check back for updates!</p>
        `;
        break;
        
      default:
        this.helpModalTitle = 'Help';
        this.helpModalContent = `<p>Select a specific section to get more detailed help.</p>`;
    }
    
    this.showHelpModal = true;
  }
  
  closeHelpModal(): void {
    this.showHelpModal = false;
  }
}