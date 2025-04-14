// Example for service testing
// src/app/services/product.service.spec.ts (improved)
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve products from the API', () => {
    // Test data
    const mockProducts = [
      {
        _id: '1',
        name: 'Test Product',
        description: 'Test description',
        price: 29.99,
        image: 'test.jpg',
        category: 'journals',
        isNew: true,
        isBestseller: false,
        createdAt: new Date()
      }
    ];

    // Make the service call
    service.getProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
      expect(products.length).toBe(1);
      expect(products[0].name).toBe('Test Product');
    });

    // Set up HTTP mock
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockProducts);
  });

  // Add more test cases for other methods
});