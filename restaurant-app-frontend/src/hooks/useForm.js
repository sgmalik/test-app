// src/hooks/useForm.js
// ---------------------------------------------------------------------
// A custom React hook for managing form state and validation logic.
// Designed to simplify handling field values, validation, touched flags,
// and error messages in your forms.
// ---------------------------------------------------------------------

import { useState } from "react";

/**
 * useForm - Hook to manage form state and validation.
 *
 * @param {Object} initialValues - Initial field values, e.g., { name: '', email: '' }.
 * @param {Object} validationRules - Map of field names to validation functions:
 *                                     { email: value => (value.includes('@') ? null : 'Invalid email') }
 *
 * @returns {Object} - Form state and handlers:
 *   values: current field values,
 *   errors: validation messages per field,
 *   touched: flags for fields that lost focus,
 *   handleChange: updates a field value,
 *   handleBlur: marks field as touched and runs validation,
 *   validate: runs all validations and returns a boolean,
 *   reset: resets form to initial state.
 */
export const useForm = (initialValues, validationRules = {}) => {
  // State for form field values
  const [values, setValues] = useState(initialValues);
  // State for validation error messages
  const [errors, setErrors] = useState({});
  // State to track which fields have been visited (onBlur)
  const [touched, setTouched] = useState({});

  /**
   * handleChange - update a single field's value
   *
   * @param {string} name - Name of the form field
   * @param {*} value     - New value for the field
   */
  const handleChange = (name, value) => {
    // Merge new value into the existing values object
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If this field had an error, clear it now that user is typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  /**
   * handleBlur - mark field as touched and validate it
   *
   * @param {string} name - Name of the form field
   */
  const handleBlur = (name) => {
    // Mark the field as having lost focus
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Run validation for this field if a rule exists
    if (validationRules[name]) {
      const error = validationRules[name](values[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  /**
   * validate - run all validation rules and update errors/touched
   *
   * @returns {boolean} - True if no validation errors, false otherwise
   */
  const validate = () => {
    const newErrors = {};
    let isValid = true;

    // Check each field against its validation function
    Object.keys(validationRules).forEach((field) => {
      const rule = validationRules[field];
      const value = values[field];
      const error = rule(value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Update errors state with all found errors
    setErrors(newErrors);

    // Mark all fields as touched so error messages show
    setTouched(
      Object.keys(validationRules).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {}),
    );

    return isValid;
  };

  /**
   * reset - clear form values, errors, and touched flags
   */
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  // Expose form state and handler functions
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
  };
};
