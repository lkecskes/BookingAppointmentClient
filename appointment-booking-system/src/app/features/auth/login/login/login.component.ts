import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ApiClient,
  LoginRequest,
  LoginResponse,
} from '../../../../api/api-client';
import { ExtractErrorMessageService } from '../../../../shared/services/extract-error-message';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  get emailAddress() {
    return this.loginForm.get('emailAddress');
  }

  get password() {
    return this.loginForm.get('password');
  }

  constructor(
    private fb: FormBuilder,
    private client: ApiClient,
    private errorService: ExtractErrorMessageService
  ) {
    this.loginForm = this.fb.group({
      emailAddress: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const payload: LoginRequest = this.loginForm.getRawValue();

    this.client
      .login(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => {
          this.errorMessage =
            this.errorService.extractBackendErrorMessage(error);
        },
      });
  }

  private handleResponse(response: LoginResponse): void {
    if (!response.isSuccess) {
      this.errorMessage = response?.message ?? '';
      return;
    }

    this.successMessage = response.message || 'Sikeres belépés';
    this.loginForm.reset();
    this.submitted = false;
  }
}
