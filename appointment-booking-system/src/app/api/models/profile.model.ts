import { UserType } from '../api-client';

// Profile related types
export interface ProfileResponse {
  isSuccess: boolean;
  message?: string;
  data?: UserProfile;
}

export interface UserProfile {
  userType: UserType;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
  companyName?: string;
  taxNumber?: string;
  city?: string;
  street?: string;
  postCode?: string;
}

export interface UpdateProfileRequest {
  userType: UserType;
  firstName: string;
  lastName: string;
  userName: string;
  emailAddress: string;
  companyName?: string;
  taxNumber?: string;
  city?: string;
  street?: string;
  postCode?: string;
}
