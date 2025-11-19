import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiClient, UserType } from '../../api/api-client';
import { ExtractErrorMessageService } from '../../shared/services/extract-error-message';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  userProfile: any;

  constructor(
    private fb: FormBuilder,
    private client: ApiClient,
    private errorService: ExtractErrorMessageService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  get form() {
    return this.profileForm.controls;
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      companyName: [''],
      taxNumber: [''],
      city: [''],
      street: [''],
      postCode: [''],
    });
  }

  private loadUserProfile(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;

    this.client
      .profileGET(parseInt(userId, 10))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.profileForm.patchValue(profile);
          this.handleCompanyFields(profile.userType === UserType._1);
        },
        error: (error) => {
          this.errorMessage =
            this.errorService.extractBackendErrorMessage(error);
        },
      });
  }

  private handleCompanyFields(isCompany: boolean): void {
    ['companyName', 'taxNumber', 'city', 'street', 'postCode'].forEach(
      (field) => {
        const control = this.profileForm.get(field);
        if (isCompany) {
          control?.setValidators(Validators.required);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      }
    );
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    const payload = {
      ...this.profileForm.value,
      userType: this.userProfile.userType,
    };

    this.client
      .profilePUT(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => {
          this.errorMessage =
            this.errorService.extractBackendErrorMessage(error);
        },
      });
  }

  private handleResponse(response: any): void {
    if (!response.isSuccess) {
      this.errorMessage = response.message;
      return;
    }

    this.successMessage = response.message || 'Sikeres módosítás!';
    this.submitted = false;
  }
}
