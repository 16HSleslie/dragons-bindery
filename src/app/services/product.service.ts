// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';

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
  private apiUrl = 'http://localhost:5000/api/products';
  
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
}