import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';


@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  selectedCategory: string = 'all';
  sortOption: string = 'default';
  
  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.extractCategories();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error('Error fetching products:', error);
      }
    });
  }

  addToCart(product: Product): void {
    this.productService.getProduct(product._id).subscribe({
      next: (fullProduct) => {
        this.cartService.addToCart(fullProduct, 1);
        
        // Create feedback notification
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'add-to-cart-feedback';
        feedbackElement.innerText = `Added ${fullProduct.name} to your cart!`;
        
        document.body.appendChild(feedbackElement);
        
        setTimeout(() => {
          feedbackElement.classList.add('show');
        }, 10);
        
        setTimeout(() => {
          feedbackElement.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(feedbackElement);
          }, 500);
        }, 3000);
      }
    });
  }
  
  extractCategories(): void {
    // Get unique categories
    const uniqueCategories = new Set(this.products.map(product => product.category));
    this.categories = Array.from(uniqueCategories);
  }
  
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.category === category
      );
    }
    
    this.applySorting();
  }
  
  sortProducts(option: string): void {
    this.sortOption = option;
    this.applySorting();
  }
  
  applySorting(): void {
    switch(this.sortOption) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        // Keep default order (as received from API)
        break;
    }
  }
}

