/**
 * Form data structure
 */
export interface ApplicationFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  educationDegree: string;
  areaOfInterest: string;
  favoriteGame: string;
}

/**
 * PocketBase user record (for users collection)
 */
export interface UserRecord {
  id: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  educationDegree: string;
  areaOfInterest: string;
  favoriteGame: string | null;
  created: string;
  updated: string;
  verified: boolean;
}

/**
 * Service response types
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    fields: Record<string, string>;
    code: number;
  };
}

export type ServiceResponse<T> = SuccessResponse<T> | ErrorResponse;
