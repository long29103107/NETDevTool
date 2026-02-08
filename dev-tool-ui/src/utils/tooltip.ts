/**
 * Formats property descriptions from Swagger/OpenAPI.
 * Specifically transforms "<example>Text</example>" into "\nEx: Text".
 */
export const formatDescription = (description: string | undefined): string => {
  if (!description) return "";
  
  return description
    .replace(/<example>(.*?)<\/example>/gi, "\nEx: $1")
    .trim();
};
