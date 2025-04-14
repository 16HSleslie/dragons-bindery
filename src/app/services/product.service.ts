// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isNew: boolean;
  isBestseller: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  
  // Fallback mock data
  private mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Dragon Scale Journal',
      description: 'Genuine leather journal with dragon scale pattern and hand-stitched binding.',
      price: 65.00,
      image: 'assets/images/placeholder.jpg',
      category: 'journals',
      isNew: true,
      isBestseller: false,
      createdAt: new Date()
    },
    {
      _id: '2',
      name: 'Ancient Grimoire',
      description: 'Handcrafted grimoire with antique paper, leather binding, and metal clasps.',
      price: 89.00,
      image: 'assets/images/placeholder.jpg',
      category: 'grimoires',
      isNew: false,
      isBestseller: false,
      createdAt: new Date()
    },
    {
      _id: '3',
      name: 'Wildflower Diary',
      description: 'Delicate journal with pressed wildflowers and cotton pages bound with natural thread.',
      price: 48.00,
      image: 'assets/images/placeholder.jpg',
      category: 'journals',
      isNew: false,
      isBestseller: true,
      createdAt: new Date()
    },
    {
      _id: '4',
      name: 'Herbal Spellbook',
      description: 'Medieval-inspired recipe book with hand-drawn herb illustrations and oak cover.',
      price: 72.00,
      image: 'assets/images/placeholder.jpg',
      category: 'spellbooks',
      isNew: false,
      isBestseller: false,
      createdAt: new Date()
    },
    {
      _id: '5',
      name: 'Celestial Star Atlas',
      description: 'Luxurious star chart journal with gold foil constellations and deep blue leather binding.',
      price: 95.00,
      image: 'assets/images/placeholder.jpg',
      category: 'atlas',
      isNew: true,
      isBestseller: false,
      createdAt: new Date()
    },
    {
      _id: '6',
      name: 'Enchanted Quill Set',
      description: 'Hand-carved wooden quill with brass nib and artisanal ink in a leather pouch.',
      price: 38.00,
      image: 'assets/images/placeholder.jpg',
      category: 'accessories',
      isNew: false,
      isBestseller: true,
      createdAt: new Date()
    }
  ];

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.log('API error, using mock data:', error);
          return of(this.mockProducts);
        })
      );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.log('API error, using mock data:', error);
          const product = this.mockProducts.find(p => p._id === id);
          return of(product as Product);
        })
      );
  }

  createProduct(product: Omit<Product, '_id'>): Observable<Product> {
    console.log('ProductService: Creating product', product);
    
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(
        tap(response => console.log('ProductService: Product created successfully', response)),
        catchError(error => {
          console.error('API error creating product:', error);
          
          // In development mode, create a mock response with an ID
          if (!environment.production) {
            console.log('Using mock response for development');
            const mockProduct: Product = {
              ...product,
              _id: 'new-' + Date.now(),
              createdAt: new Date()
            };
            return of(mockProduct);
          }
          
          return throwError(() => error);
        })
      );
  }

  
updateProduct(id: string, product: Partial<Product>): Observable<Product> {
  return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
    catchError(error => {
      console.log('API error, using mock response:', error);
      
      // Mock implementation for development
      const updatedProduct = {...this.mockProducts.find(p => p._id === id), ...product} as Product;
      const index = this.mockProducts.findIndex(p => p._id === id);
      if (index !== -1) {
        this.mockProducts[index] = updatedProduct as Product;
      }
      
      return of(updatedProduct);
    })
  );
}

  deleteProduct(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        // Map to true on success
        map(() => true),
        catchError(error => {
          console.log('API error, using mock response:', error);
          // Remove from mock data and return success
          this.mockProducts = this.mockProducts.filter(p => p._id !== id);
          return of(true);
        })
      );
  }

  uploadProductImage(file: File): Observable<string> {
    console.log('ProductService: Uploading image', file.name, file.size, file.type);
    
    const formData = new FormData();
    formData.append('image', file);
    
    // Try to use the real API
    return this.http.post<{imageUrl: string}>(`${environment.apiUrl}/products/upload`, formData).pipe(
      tap(response => console.log('ProductService: Image uploaded successfully', response)),
      map(response => response.imageUrl),
      catchError(error => {
        console.error('API error uploading image:', error);
        
        // For development without a backend, return a mock URL
        if (!environment.production) {
          console.log('Using mock image URL for development');
          return of(`assets/images/placeholder.jpg?mock=${Date.now()}`);
        }
        
        return throwError(() => error);
      })
    );
  }
}