import { countryCodes, CountryCode } from "./country-codes";

export interface PhoneValidationResult {
  isValid: boolean;
  reason?: string;
  originalPhone: string;
  formattedPhone?: string;
  country?: string;
}

export interface InvalidPhoneNumber {
  phoneNumber: string;
  reason: string;
}

/**
 * Validates a phone number against international standards
 * @param phoneNumber The phone number to validate
 * @returns PhoneValidationResult object with validation details
 */
export function validatePhoneNumber(phoneNumber: string): PhoneValidationResult {
  const originalPhone = phoneNumber;
  
  // Clean the phone number - remove all non-numeric characters except +
  const cleanedPhone = phoneNumber.replace(/[^\d+]/g, "");
  
  // Check if phone is empty after cleaning
  if (!cleanedPhone) {
    return {
      isValid: false,
      reason: "Phone number is empty or contains no digits",
      originalPhone,
    };
  }

  // Remove leading + if present
  const phoneWithoutPlus = cleanedPhone.replace(/^\+/, "");
  
  // Check if phone contains only digits after cleaning
  if (!/^\d+$/.test(phoneWithoutPlus)) {
    return {
      isValid: false,
      reason: "Phone number contains invalid characters",
      originalPhone,
    };
  }

  // Check minimum length (at least 4 digits)
  if (phoneWithoutPlus.length < 4) {
    return {
      isValid: false,
      reason: "Phone number is too short (minimum 4 digits)",
      originalPhone,
    };
  }

  // Check maximum length (no more than 15 digits as per ITU-T E.164)
  if (phoneWithoutPlus.length > 15) {
    return {
      isValid: false,
      reason: "Phone number is too long (maximum 15 digits)",
      originalPhone,
    };
  }

  // Try to match against country codes
  const matchedCountry = findMatchingCountry(phoneWithoutPlus);
  
  if (!matchedCountry) {
    return {
      isValid: false,
      reason: "No matching country code found",
      originalPhone,
    };
  }

  // Validate phone length for the matched country
  const phoneWithoutCountryCode = phoneWithoutPlus.substring(matchedCountry.code.replace(/[^\d]/g, "").length);
  const phoneLength = phoneWithoutCountryCode.length;

  const isLengthValid = validatePhoneLength(phoneLength, matchedCountry);
  
  if (!isLengthValid) {
    const expectedLength = getExpectedLengthDescription(matchedCountry);
    return {
      isValid: false,
      reason: `Invalid phone length for ${matchedCountry.country}. Expected ${expectedLength} digits after country code, got ${phoneLength}`,
      originalPhone,
      country: matchedCountry.country,
    };
  }

  return {
    isValid: true,
    originalPhone,
    formattedPhone: `+${phoneWithoutPlus}`,
    country: matchedCountry.country,
  };
}

/**
 * Finds the matching country for a phone number
 */
function findMatchingCountry(phoneNumber: string): CountryCode | null {
  // Sort countries by code length (longest first) to match the most specific code
  const sortedCountries = [...countryCodes].sort((a, b) => {
    const aCodeLength = a.code.replace(/[^\d]/g, "").length;
    const bCodeLength = b.code.replace(/[^\d]/g, "").length;
    return bCodeLength - aCodeLength;
  });

  for (const country of sortedCountries) {
    const countryCode = country.code.replace(/[^\d]/g, ""); // Remove non-digits from country code
    if (phoneNumber.startsWith(countryCode)) {
      return country;
    }
  }

  return null;
}

/**
 * Validates if the phone length is correct for the given country
 */
function validatePhoneLength(phoneLength: number, country: CountryCode): boolean {
  if (country.phoneLength) {
    if (Array.isArray(country.phoneLength)) {
      return country.phoneLength.includes(phoneLength);
    } else {
      return phoneLength === country.phoneLength;
    }
  }

  // If no specific length is defined, allow reasonable range (6-12 digits)
  return phoneLength >= 6 && phoneLength <= 12;
}

/**
 * Gets a human-readable description of expected phone length
 */
function getExpectedLengthDescription(country: CountryCode): string {
  if (country.phoneLength) {
    if (Array.isArray(country.phoneLength)) {
      return country.phoneLength.join(" or ");
    } else {
      return country.phoneLength.toString();
    }
  }

  return "6-12";
}

/**
 * Validates an array of phone numbers and returns invalid ones
 * @param phoneNumbers Array of phone numbers to validate
 * @returns Array of invalid phone numbers with reasons
 */
export function validatePhoneNumbers(phoneNumbers: string[]): InvalidPhoneNumber[] {
  const invalidNumbers: InvalidPhoneNumber[] = [];

  for (const phone of phoneNumbers) {
    const result = validatePhoneNumber(phone);
    if (!result.isValid) {
      invalidNumbers.push({
        phoneNumber: result.originalPhone,
        reason: result.reason || "Unknown validation error",
      });
    }
  }

  return invalidNumbers;
}