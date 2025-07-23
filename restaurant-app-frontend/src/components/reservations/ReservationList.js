// src/components/reservations/ReservationList.js
// ---------------------------------------------------------------------
// ReservationList Component
// ---------------------------------------------------------------------
// Renders a list of restaurant reservations with filtering,
// grouping by date, and actions to confirm, cancel, or delete.
// Utilizes React hooks for state, the custom useApi hook for data fetching,
// and date-fns for formatting dates.
// Provides loading and error states with a LoadingSpinner and toast messages.
// ---------------------------------------------------------------------

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

// reservationService contains methods to interact with the API
import { reservationService } from "../../services/reservationService";
// useApi is a custom hook that wraps data fetching, loading, and error state
import { useApi } from "../../hooks/useApi";
// LoadingSpinner displays while waiting for data
import LoadingSpinner from "../common/LoadingSpinner";

// Component-specific CSS for styling the reservation list
import "./ReservationList.css";

// Define the possible statuses for filtering and display
const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

/**
 * ReservationList
 * Fetches reservations from the API and displays them grouped by date.
 * Allows the user to:
 *   - Filter by status or date range
 *   - Confirm pending reservations
 *   - Cancel or delete reservations
 * @returns {JSX.Element}
 */
const ReservationList = () => {
  // ---------------------------------------------------------------
  // Local state: filter criteria
  // ---------------------------------------------------------------
  const [filters, setFilters] = useState({
    status: "", // Filter by reservation status
    date: "", // Filter for a single date
    start_date: "", // Filter from this date (inclusive)
    end_date: "", // Filter until this date (inclusive)
  });

  // ---------------------------------------------------------------
  // Data Fetching: useApi handles async call, loading, error
  // ---------------------------------------------------------------
  const { data, loading, error, refetch } = useApi(
    () => reservationService.getReservations(filters),
    [filters], // Re-run fetch whenever filters change
  );

  // ---------------------------------------------------------------
  // Handlers: update filter criteria based on user input
  // ---------------------------------------------------------------
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // ---------------------------------------------------------------
  // Action Handlers: confirm, cancel, delete reservations
  // Each calls the service, shows a toast, then refetches the list
  // ---------------------------------------------------------------
  const handleConfirm = async (id, customerName) => {
    try {
      await reservationService.confirmReservation(id);
      toast.success(`Reservation for ${customerName} confirmed successfully`);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (id, customerName) => {
    if (window.confirm(`Cancel reservation for ${customerName}?`)) {
      try {
        await reservationService.cancelReservation(id);
        toast.success(`Reservation for ${customerName} cancelled successfully`);
        refetch();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async (id, customerName) => {
    if (window.confirm(`Delete reservation for ${customerName}?`)) {
      try {
        await reservationService.deleteReservation(id);
        toast.success("Reservation deleted successfully");
        refetch();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  // ---------------------------------------------------------------
  // Group reservations by date string (YYYY-MM-DD)
  // data.data is the JSONAPI response array
  // ---------------------------------------------------------------
  const groupedReservations = data?.data
    ? data.data.reduce((groups, res) => {
      // Parse and format the reservation date into a key
      const dateKey = format(
        parseISO(res.attributes.reservation_date),
        "yyyy-MM-dd",
      );
      // Initialize array for this date if needed
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(res);
      return groups;
    }, {})
    : {};

  // ---------------------------------------------------------------
  // Render loading or error states
  // ---------------------------------------------------------------
  if (loading) return <LoadingSpinner message="Loading reservations..." />;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  // ---------------------------------------------------------------
  // Main render: header, filter controls, and grouped list
  // ---------------------------------------------------------------
  return (
    <div className="reservation-list">
      {/* Page header with title and subtitle */}
      <div className="page-header">
        <h1>Reservations</h1>
        <p>Manage restaurant reservations and bookings</p>
      </div>

      {/* Controls: New button and filter dropdowns/inputs */}
      <div className="reservation-controls card">
        <div className="card-body">
          <div className="controls-row">
            {/* Link to reservation creation form */}
            <Link to="/reservations/new" className="btn btn-primary">
              New Reservation
            </Link>

            {/* Filter inputs */}
            <div className="filters">
              {/* Status dropdown */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="form-control"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              {/* Single-date filter input */}
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="form-control"
                placeholder="Filter by date"
              />

              {/* Start date filter */}
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
                className="form-control"
                placeholder="From date"
              />

              {/* End date filter */}
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                className="form-control"
                placeholder="To date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display reservations grouped by date */}
      <div className="reservations-display">
        {Object.keys(groupedReservations).length > 0 ? (
          Object.entries(groupedReservations)
            // Sort groups by date ascending
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([dateKey, reservations]) => (
              <div key={dateKey} className="date-group">
                {/* Human-friendly date header */}
                <h3>{format(parseISO(dateKey), "EEEE, MMMM d, yyyy")}</h3>

                {/* Grid of reservation cards for this date */}
                <div className="reservations-grid">
                  {reservations.map((res) => {
                    const { id, attributes: attr } = res;
                    return (
                      <div
                        key={id}
                        className={`reservation-card status-${attr.status}`}
                      >
                        {/* Header: customer name and status badge */}
                        <div className="reservation-header">
                          <h4>
                            <Link to={`/reservations/${id}`}>
                              "{attr.customer_name}"
                            </Link>
                          </h4>
                          <span
                            className={`status-badge status-${attr.status}`}
                          >
                            {attr.status.charAt(0).toUpperCase() +
                              attr.status.slice(1)}
                          </span>
                        </div>

                        {/* Details: time, party size, contact, notes */}
                        <div className="reservation-details">
                          <p>
                            <strong>Time:</strong>{" "}
                            {format(parseISO(attr.reservation_date), "h:mm a")}
                          </p>
                          <p>
                            <strong>Party Size:</strong> {attr.party_size}{" "}
                            people
                          </p>
                          <p>
                            <strong>Email:</strong> {attr.customer_email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {attr.customer_phone}
                          </p>
                          {attr.special_requests && (
                            <p>
                              <strong>Special Requests:</strong>{" "}
                              {attr.special_requests}
                            </p>
                          )}
                        </div>

                        {/* Action buttons based on status and permissions */}
                        <div className="reservation-actions">
                          <Link
                            to={`/reservations/${id}`}
                            className="btn btn-sm btn-info"
                          >
                            View
                          </Link>
                          {attr.status === "pending" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleConfirm(id, attr.customer_name)
                              }
                              className="btn btn-sm btn-success"
                            >
                              Confirm
                            </button>
                          )}
                          {attr.can_be_cancelled && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancel(id, attr.customer_name)
                              }
                              className="btn btn-sm btn-warning"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(id, attr.customer_name)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        ) : (
          /* Empty state when no reservations match filters */
          <div className="empty-state card">
            <div className="card-body text-center">
              <div className="empty-icon" />
              <h3>No reservations found</h3>
              <p>No reservations match your current filters.</p>
              <Link to="/reservations/new" className="btn btn-primary">
                Make a Reservation
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationList;
