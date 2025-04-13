// src/app/components/admin/admin-login/admin-login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  returnUrl: string = '/admin/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect to dashboard if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/admin/dashboard']);
    }

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Get return url from route parameters or default to '/admin/dashboard'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.f['username'].value, this.f['password'].value)
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate([this.returnUrl]);
          } else {
            this.error = 'Invalid username or password';
            this.loading = false;
          }
        },
        error: (error) => {
          this.error = 'Authentication failed';
          this.loading = false;
        }
      });
  }
}