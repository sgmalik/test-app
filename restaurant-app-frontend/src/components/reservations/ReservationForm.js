// src/components/reservations/ReservationForm.js
// ---------------------------------------------------------------------
// ReservationForm Component
// ---------------------------------------------------------------------
// Renders a form for creating or editing a restaurant reservation.
// Features:
//   • Uses React Router's useParams to detect edit mode (presence of ID)
//   • Validates user input with custom rules (name, email, phone, party size, date/time)
//   • Formats default reservation date/time to tomorrow at 7 PM
//   • Handles form submission: create or update via reservationService
//   • Shows loading states and error messages via LoadingSpinner and toast
// ---------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { reservationService } from "../../services/reservationService";
import { useForm } from "../../hooks/useForm";
import LoadingSpinner from "../common/LoadingSpinner";
import "./ReservationForm.css";

/**
 * ReservationForm
 * @returns {JSX.Element}
 *
 * A form component for both creating a new reservation and editing
 * an existing one. It manages its own validation rules, form state,
 * and handles API calls on submit.
 */
const ReservationForm = () => {
  // Navigation helper to programmatically change routes
  const navigate = useNavigate();
  // Grab `id` from URL params; if present, we're in edit mode
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Local loading states:
  // - initialLoading: while fetching existing reservation for edit
  // - loading: during form submission
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------
  // Validation Rules Object
  // Each field maps to a function that returns an error string or null
  // -------------------------------------------------------------------
  const validationRules = {
    customer_name: (value) => {
      if (!value || value.trim().length < 2)
        return "Name must be at least 2 characters long";
      if (value.length > 100) return "Name must be less than 100 characters";
      return null;
    },
    customer_email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) return "Email is required";
      if (!emailRegex.test(value)) return "Please enter a valid email address";
      return null;
    },
    customer_phone: (value) => {
      if (!value || value.trim().length < 10)
        return "Please enter a valid phone number";
      return null;
    },
    party_size: (value) => {
      const num = parseInt(value, 10);
      if (!value || isNaN(num) || num < 1 || num > 12) {
        return "Party size must be between 1 and 12 people";
      }
      return null;
    },
    reservation_date: (value) => {
      if (!value) return "Please select a date and time";
      const selected = new Date(value);
      const now = new Date();
      if (selected <= now) return "Reservation must be in the future";
      const hour = selected.getHours();
      if (hour < 17 || hour >= 22)
        return "Reservations must be between 5:00 PM and 10:00 PM";
      return null;
    },
  };

  // -------------------------------------------------------------------
  // useForm Hook: manages form state, errors, touched, and provides handlers
  // -------------------------------------------------------------------
  const { values, errors, touched, handleChange, handleBlur, validate, reset } =
    useForm(
      {
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        party_size: "",
        reservation_date: "",
        special_requests: "",
      },
      validationRules,
    );

  // -------------------------------------------------------------------
  // Effect: on mount (and if ID changes), either load existing data or
  // set default date/time (tomorrow at 7 PM)
  // -------------------------------------------------------------------
  useEffect(() => {
    if (isEditing) {
      // Fetch reservation from API to pre-fill the form
      const loadReservation = async () => {
        try {
          setInitialLoading(true);
          const response = await reservationService.getReservation(id);
          const res = response.data.attributes;
          // Populate fields
          Object.keys(res).forEach((key) => {
            if (key in values) {
              const val = res[key];
              // Format reservation_date for <input type="datetime-local">
              if (key === "reservation_date") {
                handleChange(key, format(new Date(val), "yyyy-MM-dd'T'HH:mm"));
              } else {
                handleChange(key, val);
              }
            }
          });
        } catch (err) {
          toast.error(err.message);
          navigate("/reservations"); // Redirect on error
        } finally {
          setInitialLoading(false);
        }
      };
      loadReservation();
    } else {
      // Default date: tomorrow at 7:00 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(19, 0, 0, 0);
      handleChange("reservation_date", format(tomorrow, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [id]);

  // Show spinner while loading existing data
  if (initialLoading)
    return <LoadingSpinner message="Loading reservation..." />;

  // -------------------------------------------------------------------
  // Submit Handler: validate fields, then call create or update API
  // -------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields; if invalid, show error
    if (!validate()) {
      toast.error("Please fix the errors below");
      return;
    }

    try {
      setLoading(true);
      // Build payload for API
      const payload = {
        customer_name: values.customer_name.trim(),
        customer_email: values.customer_email.trim(),
        customer_phone: values.customer_phone.trim(),
        party_size: parseInt(values.party_size, 10),
        reservation_date: new Date(values.reservation_date).toISOString(),
        special_requests: values.special_requests.trim(),
      };

      if (isEditing) {
        await reservationService.updateReservation(id, payload);
        toast.success("Reservation updated successfully");
      } else {
        await reservationService.createReservation(payload);
        toast.success(
          "Reservation created successfully. Confirmation email sent.",
        );
      }

      // After success, redirect back to list
      navigate("/reservations");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // Render form
  // -------------------------------------------------------------------
  return (
    <div className="reservation-form">
      <div className="page-header">
        <h1>{isEditing ? "Edit Reservation" : "Make a Reservation"}</h1>
        <p>
          {isEditing
            ? `Update reservation for ${values.customer_name}`
            : "Book your table for an unforgettable dining experience"}
        </p>
      </div>

      <div className="reservation-container">
        {/* Informational sidebar about restaurant hours, contact, etc. */}
        <div className="reservation-info card">
          <div className="card-header">
            <h3>Restaurant Information</h3>
          </div>
          <div className="card-body">
            {/* Hours section */}
            <div className="info-item">
              <strong>Hours</strong>
              <p>Mon–Thu: 5:00 PM – 10:00 PM</p>
              <p>Fri–Sat: 5:00 PM – 11:00 PM</p>
              <p>Sun: 4:00 PM – 9:00 PM</p>
            </div>
            {/* Contact section */}
            <div className="info-item">
              <strong>Contact</strong>
              <p>Phone: (555) 123-4567</p>
              <p>Email: reservations@restaurantapp.com</p>
            </div>
            {/* Party size guidelines */}
            <div className="info-item">
              <strong>Party Size</strong>
              <p>Up to 12 people. For larger groups, please call us.</p>
            </div>
          </div>
        </div>

        {/* Main form card */}
        <div className="reservation-form-card card">
          <div className="card-header">
            <h3>Reservation Details</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Customer Name Field */}
              <div className="form-group">
                <label htmlFor="customer_name">Your Name *</label>
                <input
                  type="text"
                  id="customer_name"
                  className={`form-control ${errors.customer_name && touched.customer_name ? "error" : ""
                    }`}
                  value={values.customer_name}
                  onChange={(e) =>
                    handleChange("customer_name", e.target.value)
                  }
                  onBlur={() => handleBlur("customer_name")}
                  placeholder="Enter your full name"
                />
                {errors.customer_name && touched.customer_name && (
                  <div className="error-message">{errors.customer_name}</div>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="customer_email">Email Address *</label>
                <input
                  type="email"
                  id="customer_email"
                  className={`form-control ${errors.customer_email && touched.customer_email
                      ? "error"
                      : ""
                    }`}
                  value={values.customer_email}
                  onChange={(e) =>
                    handleChange("customer_email", e.target.value)
                  }
                  onBlur={() => handleBlur("customer_email")}
                  placeholder="your@email.com"
                />
                {errors.customer_email && touched.customer_email && (
                  <div className="error-message">{errors.customer_email}</div>
                )}
              </div>

              {/* Phone & Party Size Row */}
              <div className="form-row">
                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="customer_phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="customer_phone"
                    className={`form-control ${errors.customer_phone && touched.customer_phone
                        ? "error"
                        : ""
                      }`}
                    value={values.customer_phone}
                    onChange={(e) =>
                      handleChange("customer_phone", e.target.value)
                    }
                    onBlur={() => handleBlur("customer_phone")}
                    placeholder="(555) 123-4567"
                  />
                  {errors.customer_phone && touched.customer_phone && (
                    <div className="error-message">{errors.customer_phone}</div>
                  )}
                </div>

                {/* Party Size */}
                <div className="form-group">
                  <label htmlFor="party_size">Party Size *</label>
                  <input
                    type="number"
                    id="party_size"
                    min="1"
                    max="12"
                    className={`form-control ${errors.party_size && touched.party_size ? "error" : ""
                      }`}
                    value={values.party_size}
                    onChange={(e) => handleChange("party_size", e.target.value)}
                    onBlur={() => handleBlur("party_size")}
                    placeholder="Number of guests"
                  />
                  {errors.party_size && touched.party_size && (
                    <div className="error-message">{errors.party_size}</div>
                  )}
                </div>
              </div>

              {/* Date & Time Field */}
              <div className="form-group">
                <label htmlFor="reservation_date">
                  Preferred Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="reservation_date"
                  className={`form-control ${errors.reservation_date && touched.reservation_date
                      ? "error"
                      : ""
                    }`}
                  value={values.reservation_date}
                  onChange={(e) =>
                    handleChange("reservation_date", e.target.value)
                  }
                  onBlur={() => handleBlur("reservation_date")}
                />
                <div className="form-text">
                  Select a date & time during our hours
                </div>
                {errors.reservation_date && touched.reservation_date && (
                  <div className="error-message">{errors.reservation_date}</div>
                )}
              </div>

              {/* Special Requests (Optional) */}
              <div className="form-group">
                <label htmlFor="special_requests">
                  Special Requests (Optional)
                </label>
                <textarea
                  id="special_requests"
                  rows="4"
                  className="form-control"
                  value={values.special_requests}
                  onChange={(e) =>
                    handleChange("special_requests", e.target.value)
                  }
                  placeholder="Any dietary restrictions or special notes"
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                      ? "Update Reservation"
                      : "Submit Reservation"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/reservations")}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
