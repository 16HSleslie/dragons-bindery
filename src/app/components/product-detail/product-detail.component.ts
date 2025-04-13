import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  quantity: number = 1;
  activeTab: string = 'description';
  loading: boolean = true;
  errorMessage: string = '';
  activeImageIndex: number = 0;
  
  // Mock product images for gallery
  productImages: string[] = [];
  
  // Mock reviews - in a real app, these would come from an API
  reviews = [
    {
      id: 1,
      author: 'Lady Morgana',
      rating: 5,
      date: new Date(2024, 3, 5),
      title: 'Absolutely Magical',
      comment: 'The dragon-embossed journal I received is absolutely breathtaking. The attention to detail and craftsmanship makes it feel like an artifact from another realm. It\'s become my most treasured possession for recording my alchemical experiments!',
      avatar: 'assets/images/placeholder.jpg'
    },
    {
      id: 2,
      author: 'Willow Thornheart',
      rating: 4,
      date: new Date(2024, 2, 18),
      title: 'Beautiful, but could use more pages',
      comment: 'I commissioned a custom grimoire for my herb collection, and The Dragon\'s Bindery exceeded all expectations. The leather binding, aged paper, and hand-drawn decorations make it feel genuinely magical. My spells have never been more potent! I just wish it came with more pages.',
      avatar: 'assets/images/placeholder.jpg'
    }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.errorMessage = 'Product ID not found.';
        this.loading = false;
      }
    });
  }
  
  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.setupProductImages();
        this.loadRelatedProducts();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product. Please try again later.';
        this.loading = false;
        console.error('Error fetching product:', error);
      }
    });
  }
  
  setupProductImages(): void {
    // In a real app, these would come from the product data
    // For now, we'll use the product image 4 times to simulate a gallery
    if (this.product) {
      this.productImages = [
        this.product.image,
        this.product.image,
        this.product.image,
        this.product.image
      ];
    }
  }
  
  loadRelatedProducts(): void {
    if (!this.product) return;
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Filter for products in the same category, excluding the current product
        this.relatedProducts = products
          .filter(p => p.category === this.product?.category && p._id !== this.product?._id)
          .slice(0, 3);
      },
      error: (error) => {
        console.error('Error fetching related products:', error);
      }
    });
  }
  
  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  increaseQuantity(): void {
    this.quantity++;
  }
  
// Update the addToCart method
addToCart(): void {
  if (this.product) {
    this.cartService.addToCart(this.product, this.quantity);
    // Show feedback
    alert(`Added ${this.quantity} x ${this.product.name} to your cart!`);
  }
}
  
  // Helper for displaying stars in the template
  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
  
  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}