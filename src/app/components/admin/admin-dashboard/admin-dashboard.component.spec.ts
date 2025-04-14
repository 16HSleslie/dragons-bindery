// src/app/components/admin/admin-dashboard/admin-dashboard.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { ProductEditModalComponent } from '../product-edit-modal/product-edit-modal.component';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Test Product',
      description: 'Test description',
      price: 19.99,
      image: '/assets/images/test.jpg',
      category: 'journals',
      isNew: true,
      isBestseller: false,
      createdAt: new Date()
    },
    {
      _id: '2',
      name: 'Another Product',
      description: 'Another description',
      price: 29.99,
      image: '/assets/images/test2.jpg',
      category: 'grimoires',
      isNew: false,
      isBestseller: true,
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    // Create spies for services
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getProducts', 
      'updateProduct', 
      'createProduct', 
      'deleteProduct', 
      'uploadProductImage'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        AdminDashboardComponent,
        ProductEditModalComponent
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Mock the getProducts method to return test data
    productService.getProducts.and.returnValue(of(mockProducts));

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products.length).toBe(2);
    expect(component.products[0].name).toBe('Test Product');
  });

  it('should logout and navigate to home', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should set active tab', () => {
    component.setActiveTab('orders');
    expect(component.activeTab).toBe('orders');
  });

  it('should open edit modal with product data', () => {
    const product = mockProducts[0];
    component.openEditModal(product);
    
    expect(component.showEditModal).toBeTrue();
    expect(component.selectedProduct).toBeDefined();
    expect(component.selectedProduct?._id).toBe(product._id);
    expect(component.isNewProduct).toBeFalse();
  });

  it('should open add product modal with empty product', () => {
    component.openAddProductModal();
    
    expect(component.showEditModal).toBeTrue();
    expect(component.selectedProduct).toBeDefined();
    expect(component.isNewProduct).toBeTrue();
    expect(component.selectedProduct?.name).toBe('');
  });

  it('should close edit modal', () => {
    component.showEditModal = true;
    component.selectedProduct = mockProducts[0];
    
    component.closeEditModal();
    
    expect(component.showEditModal).toBeFalse();
    expect(component.selectedProduct).toBeNull();
    expect(component.isNewProduct).toBeFalse();
  });

  it('should handle quick action for adding product', () => {
    spyOn(component, 'openAddProductModal');
    
    component.handleQuickAction('addProduct');
    
    expect(component.openAddProductModal).toHaveBeenCalled();
  });

  it('should create a new product', fakeAsync(() => {
    const newProduct = {
      _id: '',
      name: 'New Product',
      description: 'New description',
      price: 39.99,
      image: '/test-image.jpg',
      category: 'journals',
      isNew: true,
      isBestseller: false,
      createdAt: new Date()
    };
    
    const createdProduct = { ...newProduct, _id: '3' };
    productService.createProduct.and.returnValue(of(createdProduct));
    
    component.isNewProduct = true;
    component.createNewProduct(newProduct);
    
    expect(productService.createProduct).toHaveBeenCalledWith(newProduct);
    tick();
    
    expect(component.loading).toBeFalse();
    expect(component.updateSuccess).toBeTrue();
    expect(component.successMessage).toContain('created');
    expect(component.products.length).toBe(3);
    expect(component.products[0]._id).toBe('3'); // New products added to start of array
  }));

  it('should handle product creation error', fakeAsync(() => {
    const newProduct = {
      _id: '',
      name: 'New Product',
      description: 'New description',
      price: 39.99,
      image: '/test-image.jpg',
      category: 'journals',
      isNew: true,
      isBestseller: false,
      createdAt: new Date()
    };
    
    const errorResponse = { message: 'Server error' };
    productService.createProduct.and.returnValue(throwError(() => errorResponse));
    
    spyOn(window, 'alert');
    component.isNewProduct = true;
    component.createNewProduct(newProduct);
    
    tick();
    
    expect(component.loading).toBeFalse();
    expect(component.error).toBeTruthy();
    expect(window.alert).toHaveBeenCalled();
  }));

  it('should upload image before creating product', fakeAsync(() => {
    const newProduct = {
      _id: '',
      name: 'New Product',
      description: 'New description',
      price: 39.99,
      image: '',
      category: 'journals',
      isNew: true,
      isBestseller: false,
      createdAt: new Date()
    };
    
    const imageFile = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    const imageUrl = '/uploads/test-image.jpg';
    const productWithImage = { ...newProduct, image: imageUrl };
    const createdProduct = { ...productWithImage, _id: '3' };
    
    productService.uploadProductImage.and.returnValue(of(imageUrl));
    productService.createProduct.and.returnValue(of(createdProduct));
    
    spyOn(component, 'createNewProduct').and.callThrough();
    
    component.isNewProduct = true;
    component.handleSaveProduct({ product: newProduct, imageFile });
    
    tick();
    
    expect(productService.uploadProductImage).toHaveBeenCalledWith(imageFile);
    expect(component.createNewProduct).toHaveBeenCalledWith(jasmine.objectContaining({
      image: imageUrl
    }));
  }));

  it('should update an existing product', fakeAsync(() => {
    const existingProduct = { ...mockProducts[0] };
    const updatedProduct = { 
      ...existingProduct,
      name: 'Updated Name',
      price: 49.99 
    };
    
    productService.updateProduct.and.returnValue(of(updatedProduct));
    
    component.updateProductData(updatedProduct);
    
    tick();
    
    expect(productService.updateProduct).toHaveBeenCalledWith(
      existingProduct._id,
      updatedProduct
    );
    expect(component.loading).toBeFalse();
    expect(component.updateSuccess).toBeTrue();
    expect(component.successMessage).toContain('updated');
    
    // Check that the product was updated in the array
    const index = component.products.findIndex(p => p._id === '1');
    expect(component.products[index].name).toBe('Updated Name');
    expect(component.products[index].price).toBe(49.99);
  }));
});
