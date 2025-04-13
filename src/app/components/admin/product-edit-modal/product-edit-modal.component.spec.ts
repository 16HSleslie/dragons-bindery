import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductEditModalComponent } from './product-edit-modal.component';

describe('ProductEditModalComponent', () => {
  let component: ProductEditModalComponent;
  let fixture: ComponentFixture<ProductEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
