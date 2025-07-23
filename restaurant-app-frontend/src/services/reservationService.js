// src/services/reservationService.js
// ---------------------------------------------------------------------
// reservationService: A collection of methods for interacting with the "reservations"
// endpoints of your Rails API. This module handles:
//   1. Building and serializing query parameters.
//   2. Sending HTTP requests via a shared Axios instance.
//   3. Centralized error handling and descriptive log messages.
// ---------------------------------------------------------------------

import api from "./api"; // Reuse the preconfigured Axios instance (baseURL, headers, interceptors)

/**
 * reservationService
 * Provides methods to list, retrieve, create, update, confirm, cancel,
 * and delete Reservation resources from the backend API.
 */
export const reservationService = {
  /**
   * Fetches a list of reservations with optional filtering and pagination.
   * @param {Object} filters                   - Optional query parameters.
   * @param {string} [filters.status]          - Filter by reservation status (e.g., 'pending').
   * @param {string} [filters.date]            - Filter by a specific date (YYYY-MM-DD).
   * @param {string} [filters.start_date]      - Filter from this start date.
   * @param {string} [filters.end_date]        - Filter up to this end date.
   * @param {string} [filters.customer_email]  - Filter by customer email address.
   * @param {number} [filters.page=1]          - Page number (1-indexed).
   * @param {number} [filters.per_page=20]     - Items per page (max defined by API).
   * @returns {Promise<Object>}                - The API response payload: { data: [...], meta: {...} }.
   * @throws {Error}                           - Contains the API's error or a fallback message.
   */
  getReservations: async (filters = {}) => {
    try {
      // Destructure filters with defaults
      const {
        status,
        date,
        start_date,
        end_date,
        customer_email,
        page = 1,
        per_page = 20,
      } = filters;

      // Serialize the query parameters
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (date) params.append("date", date);
      if (start_date) params.append("start_date", start_date);
      if (end_date) params.append("end_date", end_date);
      if (customer_email) params.append("customer_email", customer_email);
      params.append("page", String(page));
      params.append("per_page", String(per_page));

      // Send GET request to /reservations
      const response = await api.get(`/reservations?${params.toString()}`);
      return response.data;
    } catch (err) {
      // Extract server error message if provided
      const apiMessage =
        err.response?.data?.error || err.response?.data?.errors?.join(", ");
      console.error("reservationService.getReservations:", err);
      throw new Error(apiMessage || "Failed to fetch reservations");
    }
  },

  /**
   * Retrieves a single reservation by ID.
   * @param {number|string} id - The ID of the reservation to fetch.
   * @returns {Promise<Object>} - The API response payload: { data: { id, attributes } }.
   * @throws {Error}           - If the reservation is not found or network fails.
   */
  getReservation: async (id) => {
    if (!id) throw new Error("Reservation ID is required");
    try {
      const response = await api.get(`/reservations/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("reservationService.getReservation:", err);
      throw new Error(apiMessage || "Failed to fetch reservation");
    }
  },

  /**
   * Creates a new reservation on the server.
   * @param {Object} reservationData - Attributes for the new reservation.
   * @returns {Promise<Object>}      - The created resource payload.
   * @throws {Error}                - Validation errors or network issues.
   */
  createReservation: async (reservationData) => {
    if (!reservationData || typeof reservationData !== "object") {
      throw new Error("Valid reservation data is required");
    }
    try {
      const payload = { reservation: reservationData };
      const response = await api.post("/reservations", payload);
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("reservationService.createReservation:", err);
      throw new Error(apiMessage || "Failed to create reservation");
    }
  },

  /**
   * Updates an existing reservation by ID.
   * @param {number|string} id         - The ID of the reservation to update.
   * @param {Object} reservationData   - Updated attributes for the reservation.
   * @returns {Promise<Object>}        - The updated resource payload.
   * @throws {Error}                  - Validation errors or network issues.
   */
  updateReservation: async (id, reservationData) => {
    if (!id) throw new Error("Reservation ID is required");
    if (!reservationData || typeof reservationData !== "object") {
      throw new Error("Valid reservation data is required");
    }
    try {
      const payload = { reservation: reservationData };
      const response = await api.put(
        `/reservations/${encodeURIComponent(id)}`,
        payload,
      );
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("reservationService.updateReservation:", err);
      throw new Error(apiMessage || "Failed to update reservation");
    }
  },

  /**
   * Deletes a reservation by ID.
   * @param {number|string} id - The ID of the reservation to delete.
   * @returns {Promise<Object>} - The server response message.
   * @throws {Error}           - If deletion fails or network issues occur.
   */
  deleteReservation: async (id) => {
    if (!id) throw new Error("Reservation ID is required");
    try {
      const response = await api.delete(
        `/reservations/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("reservationService.deleteReservation:", err);
      throw new Error(apiMessage || "Failed to delete reservation");
    }
  },

  /**
   * Confirms a pending reservation by ID.
   * @param {number|string} id - The ID of the reservation to confirm.
   * @returns {Promise<Object>} - The updated reservation payload.
   * @throws {Error}           - If confirmation fails or network issues occur.
   */
  confirmReservation: async (id) => {
    if (!id) throw new Error("Reservation ID is required");
    try {
      const response = await api.patch(
        `/reservations/${encodeURIComponent(id)}/confirm`,
      );
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("reservationService.confirmReservation:", err);
      throw new Error(apiMessage || "Failed to confirm reservation");
    }
  },

  /**
   * Cancels a reservation by ID, if business rules allow.
   * @param {number|string} id - The ID of the reservation to cancel.
   * @returns {Promise<Object>} - The updated reservation payload.
   * @throws {Error}           - If cancellation fails or network issues occur.
   */
  cancelReservation: async (id) => {
    if (!id) throw new Error("Reservation ID is required");
    try {
      const response = await api.patch(
        `/reservations/${encodeURIComponent(id)}/cancel`,
      );
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("reservationService.cancelReservation:", err);
      throw new Error(apiMessage || "Failed to cancel reservation");
    }
  },
};
