// src/app/components/admin/product-edit-modal/product-edit-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../services/product.service';

@Component({
  selector: 'app-product-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-edit-modal.component.html',
  styleUrl: './product-edit-modal.component.scss'
})
export class ProductEditModalComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Input() show: boolean = false;
  @Input() isNewProduct: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{product: Product, imageFile: File | null}>();
  
  editForm: FormGroup;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  loading: boolean = false;
  error: string = '';
  modalTitle: string = 'Edit Product';
  
  // File upload constraints
  maxFileSize = 5 * 1024 * 1024; // 5 MB
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  constructor(private fb: FormBuilder) {
    this.editForm = this.createForm();
  }
  
  ngOnInit(): void {
    this.updateForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['isNewProduct']) {
      this.updateForm();
      this.updateModalTitle();
    }
  }
  
  updateForm(): void {
    if (this.product) {
      this.editForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        category: this.product.category,
        isNew: this.product.isNew,
        isBestseller: this.product.isBestseller
      });
      
      this.imagePreview = this.product.image;
    }
  }
  
  updateModalTitle(): void {
    this.modalTitle = this.isNewProduct ? 'Add New Product' : 'Edit Product';
  }
  
  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      isNew: [false],
      isBestseller: [false]
    });
  }
  
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    
    // Validate file type
    if (!this.allowedFileTypes.includes(file.type)) {
      this.error = 'Invalid file type. Please upload an image (JPEG, PNG, GIF, or WEBP).';
      return;
    }
    
    // Validate file size
    if (file.size > this.maxFileSize) {
      this.error = `File size too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB.`;
      return;
    }
    
    this.error = '';
    this.imageFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  
  onSubmit(): void {
    if (this.editForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    if (!this.product) {
      return;
    }
    
    // Check if image is required for new products
    if (this.isNewProduct && !this.imagePreview && !this.imageFile) {
      this.error = 'An image is required for new products.';
      return;
    }
    
    this.loading = true;
    
    const updatedProduct = {
      ...this.product,
      name: this.editForm.value.name,
      description: this.editForm.value.description,
      price: this.editForm.value.price,
      category: this.editForm.value.category,
      isNew: this.editForm.value.isNew,
      isBestseller: this.editForm.value.isBestseller
    };
    
    this.save.emit({
      product: updatedProduct,
      imageFile: this.imageFile
    });
  }
  
  onClose(): void {
    this.close.emit();
  }
  
  resetForm(): void {
    this.editForm.reset({
      name: '',
      description: '',
      price: 0,
      category: '',
      isNew: false,
      isBestseller: false
    });
    this.imagePreview = null;
    this.imageFile = null;
    this.error = '';
  }
}