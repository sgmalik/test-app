// src/components/menu/MenuItemForm.js
// ---------------------------------------------------------------------
// MenuItemForm Component
// ---------------------------------------------------------------------
// This component renders a form for both creating and editing a menu item.
// It encapsulates:
//   • Mode detection (create vs. edit) based on URL parameter `id`
//   • Initial data loading for editing existing items
//   • Controlled form inputs for name, description, price, category, availability
//   • Real-time validation with descriptive error messages
//   • Submission handler that calls create or update via menuService
//   • User feedback through loading spinners and toast notifications
//   • Programmatic navigation to the menu list on success or cancel
//
// Dependencies:
//   - React hooks: useState, useEffect
//   - react-router-dom: useNavigate (redirect), useParams (read URL params)
//   - react-toastify: toast (notifications)
//   - menuService: API layer for CRUD operations on menu items
//   - useForm: custom hook for managing form state and validation
//   - LoadingSpinner: visual indicator during async operations
// ---------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// menuService provides methods: getMenuItem(id), createMenuItem(data), updateMenuItem(id, data)
import { menuService } from "../../services/menuService";
// useForm manages values, errors, touched flags, and validation logic for form fields
import { useForm } from "../../hooks/useForm";
// LoadingSpinner displays a centered spinner while data is loading
import LoadingSpinner from "../common/LoadingSpinner";
import "./MenuItemForm.css";

// Hardcoded categories array for the category select input
const CATEGORIES = [
  "Appetizers", // Starters to whet the appetite
  "Main Courses", // Hearty and filling dishes
  "Desserts", // Sweet treats to end the meal
  "Beverages", // Drinks, both alcoholic and non-alcoholic
];

/**
 * MenuItemForm
 * Renders a form for adding or editing a menu item.
 * Determines mode (edit/create) via URL param `id`.
 * @returns {JSX.Element}
 */
const MenuItemForm = () => {
  // --- Router and Mode Detection --------------------------------------
  const navigate = useNavigate();
  const { id } = useParams();
  // If an `id` exists in the route, we're editing; otherwise, we're creating
  const isEditing = Boolean(id);

  // --- Loading State ---------------------------------------------------
  // `initialLoading` is true when fetching existing item data for edit mode
  const [initialLoading, setInitialLoading] = useState(isEditing);
  // `loading` is true during form submission
  const [loading, setLoading] = useState(false);

  // --- Validation Rules ------------------------------------------------
  // Each rule returns a string message if invalid, or null if valid.
  const validationRules = {
    name: (value) => {
      if (!value || value.trim().length < 2) {
        return "Name must be at least 2 characters";
      }
      if (value.length > 100) {
        return "Name cannot exceed 100 characters";
      }
      return null;
    },
    description: (value) => {
      if (!value || value.trim().length < 10) {
        return "Description must be at least 10 characters";
      }
      if (value.length > 500) {
        return "Description cannot exceed 500 characters";
      }
      return null;
    },
    price: (value) => {
      const num = parseFloat(value);
      if (!value || isNaN(num) || num <= 0) {
        return "Enter a valid positive price";
      }
      return null;
    },
    category: (value) => {
      if (!value) {
        return "Please select a category";
      }
      return null;
    },
  };

  // --- useForm Hook Setup ----------------------------------------------
  // Destructure the return object from useForm:
  //   values: current form values object
  //   errors: current validation error messages per field
  //   touched: flags indicating which fields have lost focus
  //   handleChange: function(name, value) -> updates form value + clears errors
  //   handleBlur: function(name) -> marks field touched + runs its validation rule
  //   validate: function() -> runs all field validations, returns boolean
  //   reset: function() -> resets form to initialValues
  const { values, errors, touched, handleChange, handleBlur, validate, reset } =
    useForm(
      {
        name: "",
        description: "",
        price: "",
        category: "",
        available: true,
      },
      validationRules,
    );

  // --- Load Existing Item Data for Editing -----------------------------
  useEffect(() => {
    if (isEditing) {
      loadMenuItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Runs only when `id` changes

  /**
   * loadMenuItem
   * Fetches the menu item by `id` and populates form fields.
   * Shows error toast + navigates back on failure.
   */
  const loadMenuItem = async () => {
    setInitialLoading(true);
    try {
      const response = await menuService.getMenuItem(id);
      const attrs = response.data.attributes;
      // Populate each form field that matches a key in `values`
      Object.keys(attrs).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
          handleChange(key, attrs[key]);
        }
      });
    } catch (err) {
      toast.error(err.message || "Error loading menu item");
      navigate("/menu");
    } finally {
      setInitialLoading(false);
    }
  };

  // --- Form Submission Handler -----------------------------------------
  /**
   * handleSubmit
   * Called when the form is submitted. Prevents default behavior,
   * validates all fields, then calls create or update on the API.
   * Displays toast messages and redirects back to /menu on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validations; abort if any rule fails
    if (!validate()) {
      toast.error("Please correct validation errors");
      return;
    }

    setLoading(true);
    // Build payload, ensuring trimmed strings and numeric price
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: parseFloat(values.price),
      category: values.category,
      available: values.available,
    };

    try {
      if (isEditing) {
        await menuService.updateMenuItem(id, payload);
        toast.success("Menu item updated");
      } else {
        await menuService.createMenuItem(payload);
        toast.success("Menu item created");
      }
      navigate("/menu"); // Redirect after successful save
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Conditional Rendering: Initial Loading --------------------------
  // Show spinner while fetching existing data
  if (initialLoading) {
    return <LoadingSpinner />;
  }

  // --- Render Form -----------------------------------------------------
  return (
    <div className="menu-item-form">
      {/* Header: dynamic title + subtitle based on mode */}
      <div className="page-header">
        <h1>{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</h1>
        <p>
          {isEditing
            ? `Updating “${values.name || "..."}”` // placeholder until name loads
            : "Enter details to add a new dish to your menu"}
        </p>
      </div>

      {/* Form Container with structured layout and spacing */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="menu-item-form-content">
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">
              Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`form-control ${errors.name && touched.name ? "error" : ""
                }`}
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="e.g. Classic Margherita Pizza"
            />
            {errors.name && touched.name && (
              <div className="error-message" role="alert">
                {errors.name}
              </div>
            )}
          </div>

          {/* Category Field */}
          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              className={`form-control ${errors.category && touched.category ? "error" : ""
                }`}
              value={values.category}
              onChange={(e) => handleChange("category", e.target.value)}
              onBlur={() => handleBlur("category")}
            >
              <option value="">-- Select Category --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && touched.category && (
              <div className="error-message" role="alert">
                {errors.category}
              </div>
            )}
          </div>

          {/* Price Field */}
          <div className="form-group">
            <label htmlFor="price">
              Price <span className="required">*</span>
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              className={`form-control ${errors.price && touched.price ? "error" : ""
                }`}
              value={values.price}
              onChange={(e) => handleChange("price", e.target.value)}
              onBlur={() => handleBlur("price")}
              placeholder="0.00"
            />
            {errors.price && touched.price && (
              <div className="error-message" role="alert">
                {errors.price}
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              rows="4"
              className={`form-control ${errors.description && touched.description ? "error" : ""
                }`}
              value={values.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              placeholder="Describe the dish, its ingredients, and flavor profile"
            />
            {errors.description && touched.description && (
              <div className="error-message" role="alert">
                {errors.description}
              </div>
            )}
          </div>

          {/* Availability Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={values.available}
                onChange={(e) => handleChange("available", e.target.checked)}
              />
              <span className="checkmark" aria-hidden="true" />
              Available for ordering
            </label>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..." // indicates in-flight submission
                : isEditing
                  ? "Update Item"
                  : "Create Item"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/menu")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;
