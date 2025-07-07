import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { catchError, EMPTY, finalize, firstValueFrom, tap } from 'rxjs';
import { ApiClient, RegisterRequest, RegisterResponse } from '../../../../api/api-client';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private client: ApiClient
  ) {
    this.registerForm = this.fb.group(
      {
        userType: [1, Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        userName: ['', Validators.required],
        emailAddress: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  async onSubmit() {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    const request: RegisterRequest = {
      userType: this.f['userType'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      userName: this.f['userName'].value,
      emailAddress: this.f['emailAddress'].value,
      password: this.f['password'].value
    };

    this.loading = true;

    this.client.register(request).pipe(
      tap(response => {
        if (!response.isSuccess) {
          throw new Error(response.message || 'Hiba történt regisztráció közben.');
        }
      }),
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: (response) => {
        this.successMessage = response.message ?? 'Sikeres regisztráció!';
        this.registerForm.reset({ userType: 1 });
        this.submitted = false;
      },
      error: (error) => {
        if (error && error.response) {
          try {
            // Parse the JSON error body (if response is string)
            const errObj = typeof error.response === 'string'
              ? JSON.parse(error.response)
              : error.response;

            this.errorMessage = errObj.message || 'Hiba történt regisztráció közben.';
          } catch {
            // fallback if parsing fails
            this.errorMessage = 'Hiba történt regisztráció közben.';
          }
        } else {
          // fallback for unknown error shape
          this.errorMessage = error.message || 'Hiba történt regisztráció közben.';
        }
      }
    });
  }
}
