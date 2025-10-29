/**
 * Detects if a string is in Arabic or English
 * Returns 'ar' for Arabic, 'en' for English
 */
export function detectLanguage(text: string): 'ar' | 'en' {
  if (!text) return 'en';
  
  // Arabic Unicode range: \u0600-\u06FF
  const arabicRegex = /[\u0600-\u06FF]/g;
  const englishRegex = /[a-zA-Z]/g;
  
  const arabicMatches = (text.match(arabicRegex) || []).length;
  const englishMatches = (text.match(englishRegex) || []).length;
  
  // If more Arabic characters detected, it's Arabic
  if (arabicMatches > englishMatches) {
    return 'ar';
  }
  
  return 'en';
}
