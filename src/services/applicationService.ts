import pb from "../lib/pocketbase";
import type {
  ApplicationFormData,
  UserRecord,
  ServiceResponse,
} from "../types/application";


/**
 * Submit an application to PocketBase users collection
 * @param formData - The application form data
 * @returns Promise with success status and data or error
 */
export async function submitApplication(
  formData: ApplicationFormData
): Promise<ServiceResponse<UserRecord>> {
  try {
    // Generate email from phone number or name
    const data = {
      name: `${formData.firstName} ${formData.lastName}`,
      phoneNumber: formData.phoneNumber.trim(),
      birthDate: formData.birthDate,
      educationDegree: formData.educationDegree,
      areaOfInterest: formData.areaOfInterest,
      favoriteGame: formData.favoriteGame || null,
      password: formData.phoneNumber.replace(/\D/g, "") + "TempPassword123!",
      passwordConfirm: formData.phoneNumber.replace(/\D/g, "") + "TempPassword123!",
    };

    // Create record in PocketBase "users" collection
    const record = await pb.collection("users").create<UserRecord>(data);

    return { success: true, data: record };
  } catch (error) {
    // Parse PocketBase error
    const errorResponse = parseError(error);
    return { success: false, error: errorResponse };
  }
}

/**
 * Parse PocketBase error response
 * @param error - The error object from PocketBase
 * @returns Parsed error with message and field-specific errors
 */
function parseError(error: unknown): {
  message: string;
  fields: Record<string, string>;
  code: number;
} {
  // Type guard for PocketBase errors
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const pbError = error as {
      response: { data: Record<string, { message?: string }> };
      status?: number;
    };

    const errors = pbError.response.data;
    const fieldErrors: Record<string, string> = {};
    let generalMessage = "Please check your input and try again.";

    // Extract field-specific errors
    Object.keys(errors).forEach((field) => {
      if (errors[field]?.message) {
        fieldErrors[field] = errors[field].message!;
      }
    });

    // Get first error message as general message
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      generalMessage = firstError.message;
    }

    return {
      message: generalMessage,
      fields: fieldErrors,
      code: pbError.status || 400,
    };
  }

  // Network error
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 0
  ) {
    return {
      message: "Network error. Please check your internet connection.",
      fields: {},
      code: 0,
    };
  }

  // 404 error
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 404
  ) {
    return {
      message: "Collection not found. Please contact support.",
      fields: {},
      code: 404,
    };
  }

  // Generic error
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "An unexpected error occurred.";

  const code =
    error && typeof error === "object" && "status" in error
      ? Number(error.status)
      : 500;

  return {
    message,
    fields: {},
    code,
  };
}

export default { submitApplication };
