import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import {
  ApiClient,
  RegisterRequest,
  UserType,
} from '../../../../api/api-client';
import { ExtractErrorMessageService } from '../../../../shared/services/extract-error-message';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  /**
   * 1 : Company
   * 2 : User
   * 3 : Admin
   */
  UserType = UserType;

  constructor(
    private fb: FormBuilder,
    private client: ApiClient,
    private errorService: ExtractErrorMessageService
  ) {
    this.registerForm = this.fb.group(
      {
        userType: [UserType._2, Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        userName: ['', Validators.required],
        emailAddress: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        companyName: [''],
        taxNumber: [''],
        city: [''],
        street: [''],
        postCode: [''],
      },
      { validators: this.matchPasswords }
    );
  }

  ngOnInit(): void {
    this.handleUserTypeChanges();
  }

  private handleUserTypeChanges(): void {
    this.registerForm
      .get('userType')
      ?.valueChanges.subscribe((type: UserType) => {
        const isCompany = type === UserType._1;
        ['companyName', 'taxNumber', 'city', 'street', 'postCode'].forEach(
          (field) => {
            const control = this.registerForm.get(field);
            if (isCompany) {
              control?.setValidators(Validators.required);
            } else {
              control?.clearValidators();
            }
            control?.updateValueAndValidity();
          }
        );
      });
  }

  private matchPasswords(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const payload: RegisterRequest = this.buildRequest();

    this.client
      .register(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => {
          this.errorMessage =
            this.errorService.extractBackendErrorMessage(error);
        },
      });
  }

  private buildRequest(): RegisterRequest {
    const { userType, firstName, lastName, userName, emailAddress, password } =
      this.registerForm.value;
    return { userType, firstName, lastName, userName, emailAddress, password };
  }

  private handleResponse(response: any): void {
    if (!response.isSuccess) {
      this.errorMessage = response.message;
      return;
    }

    this.successMessage = response.message || 'Sikeres regisztráció!';
    this.registerForm.reset({ userType: UserType._2 });
    this.submitted = false;
  }
}
