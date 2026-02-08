import type { SchemaObject } from "@/types/openapi";

/**
 * Validates a field value against its OpenAPI schema.
 * Returns an error message string or undefined if valid.
 */
export const validateField = (
  value: unknown,
  schema: SchemaObject | undefined,
  isRequired: boolean = false
): string | undefined => {
  const strVal = value !== undefined && value !== null ? String(value) : "";
  const isEmpty = strVal.trim() === "";

  if (isRequired && isEmpty) {
    return schema?.["x-requiredMessage"] || "Required";
  }

  if (isEmpty) return undefined;

  if (!schema) return undefined;

  const { type, minLength, maxLength, minimum, maximum, pattern } = schema;
  const customError = schema["x-errorMessage"];

  // Helper to check if schema is of a certain type
  const isType = (t: string) => {
    if (Array.isArray(type)) return type.includes(t);
    return type === t;
  };

  // Pattern validation (apply to string representation of any value)
  if (pattern !== undefined && !isEmpty) {
    try {
      const regex = new RegExp(pattern);
      if (!regex.test(strVal)) {
        return customError || "Invalid format";
      }
    } catch (err) {
      console.error("Invalid regex pattern:", pattern, err);
    }
  }

  // String validation (length checks)
  if (isType("string")) {
    if (minLength !== undefined && strVal.length < minLength) {
      return customError || `Min length: ${minLength}`;
    }
    if (maxLength !== undefined && strVal.length > maxLength) {
      return customError || `Max length: ${maxLength}`;
    }
  }

  // Number validation (range checks)
  if (isType("integer") || isType("number")) {
    const numVal = Number(value);
    if (!isEmpty && isNaN(numVal)) {
      return "Invalid number";
    }
    if (!isEmpty) {
      if (minimum !== undefined && numVal < minimum) {
        return customError || `Min value: ${minimum}`;
      }
      if (maximum !== undefined && numVal > maximum) {
        return customError || `Max value: ${maximum}`;
      }
    }
  }

  return undefined;
};

/**
 * Generates a descriptive placeholder based on schema constraints.
 */
export const getFieldPlaceholder = (schema: SchemaObject | undefined): string => {
  if (!schema) return "";
  const parts: string[] = [];
  
  const { minLength, maxLength, minimum, maximum } = schema;

  if (minLength !== undefined || maxLength !== undefined) {
    if (minLength !== undefined && maxLength !== undefined) {
      parts.push(`Len: ${minLength}-${maxLength}`);
    } else if (minLength !== undefined) {
      parts.push(`Min len: ${minLength}`);
    } else if (maxLength !== undefined) {
      parts.push(`Max len: ${maxLength}`);
    }
  }

  if (minimum !== undefined || maximum !== undefined) {
    if (minimum !== undefined && maximum !== undefined) {
      parts.push(`Range: ${minimum}-${maximum}`);
    } else if (minimum !== undefined) {
      parts.push(`Min: ${minimum}`);
    } else if (maximum !== undefined) {
      parts.push(`Max: ${maximum}`);
    }
  }

  return parts.length > 0 ? parts.join(", ") : "";
};
