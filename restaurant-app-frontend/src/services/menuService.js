// src/services/menuService.js
// ---------------------------------------------------------------------
// menuService: A collection of methods for interacting with the "menu_items"
// endpoints of your Rails API. This module handles:
//   1. Constructing HTTP requests via a centralized Axios instance.
//   2. Serializing query parameters and request bodies.
//   3. Consistent error handling with descriptive messages.
// ---------------------------------------------------------------------

import api from "./api"; // Reuse the preconfigured Axios instance (baseURL, headers, interceptors)

/**
 * menuService
 * Provides CRUD operations and list-fetching for MenuItem resources.
 */
export const menuService = {
  /**
   * Fetches a list of menu items with optional filtering, sorting, and pagination.
   * @param {Object} filters                - Optional parameters to refine the query.
   * @param {string} [filters.category]     - Category slug to filter (e.g., 'Appetizer').
   * @param {boolean} [filters.available]   - true for only available items, false for unavailable.
   * @param {string} [filters.sort]         - Sort key: 'name', 'price', or 'category'.
   * @param {number} [filters.page=1]       - Page number (1-indexed).
   * @param {number} [filters.per_page=20]  - Items per page (API caps at 100).
   * @returns {Promise<Object>}             - The entire response payload: { data: [...], meta: {...} }.
   * @throws {Error}                       - Contains the API's error or a fallback message.
   */
  getMenuItems: async (filters = {}) => {
    try {
      // Destructure filters with sensible defaults
      const { category, available, sort, page = 1, per_page = 20 } = filters;

      // Build a URLSearchParams instance to serialize query parameters
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (available !== undefined)
        params.append("available", String(available));
      if (sort) params.append("sort", sort);
      // Always include pagination values, converting to string
      params.append("page", String(page));
      params.append("per_page", String(per_page));

      // Perform a GET request to /menu_items with the query string
      const response = await api.get(`/menu_items?${params.toString()}`);

      // Return the JSON payload directly; contains `data` and `meta`
      return response.data;
    } catch (err) {
      // Extract a user-friendly error message if available
      const apiMessage =
        err.response?.data?.error || err.response?.data?.errors?.join(", ");
      const fallback = "Failed to fetch menu items";
      // Log the raw error for debugging purposes
      console.error("menuService.getMenuItems:", err);
      throw new Error(apiMessage || fallback);
    }
  },

  /**
   * Retrieves a single menu item by its unique ID.
   * @param {number|string} id       - The ID of the menu item to fetch.
   * @returns {Promise<Object>}      - The response payload: { data: { id, attributes } }.
   * @throws {Error}                - If the menu item is not found or network fails.
   */
  getMenuItem: async (id) => {
    if (!id) throw new Error("Menu item ID is required");
    try {
      const response = await api.get(`/menu_items/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("menuService.getMenuItem:", err);
      throw new Error(apiMessage || "Failed to fetch menu item");
    }
  },

  /**
   * Creates a new menu item on the server.
   * @param {Object} menuItemData    - Attributes for the new item (e.g., name, price).
   * @returns {Promise<Object>}      - The created resource payload.
   * @throws {Error}                - Validation errors or network issues.
   */
  createMenuItem: async (menuItemData) => {
    if (!menuItemData || typeof menuItemData !== "object") {
      throw new Error("Valid menu item data is required");
    }
    try {
      // Wrap in the `menu_item` key to satisfy Rails strong params
      const payload = { menu_item: menuItemData };
      const response = await api.post("/menu_items", payload);
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("menuService.createMenuItem:", err);
      throw new Error(apiMessage || "Failed to create menu item");
    }
  },

  /**
   * Updates an existing menu item by ID.
   * @param {number|string} id       - The ID of the item to update.
   * @param {Object} menuItemData    - New attribute values for the item.
   * @returns {Promise<Object>}      - The updated resource payload.
   * @throws {Error}                - Validation errors or network issues.
   */
  updateMenuItem: async (id, menuItemData) => {
    if (!id) throw new Error("Menu item ID is required");
    if (!menuItemData || typeof menuItemData !== "object") {
      throw new Error("Valid menu item data is required");
    }
    try {
      const payload = { menu_item: menuItemData };
      const response = await api.put(
        `/menu_items/${encodeURIComponent(id)}`,
        payload,
      );
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("menuService.updateMenuItem:", err);
      throw new Error(apiMessage || "Failed to update menu item");
    }
  },

  /**
   * Deletes a menu item by its ID.
   * @param {number|string} id      - The ID of the item to delete.
   * @returns {Promise<Object>}     - Server response (often just a success message).
   * @throws {Error}               - If deletion fails or network issues occur.
   */
  deleteMenuItem: async (id) => {
    if (!id) throw new Error("Menu item ID is required");
    try {
      const response = await api.delete(
        `/menu_items/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.error;
      console.error("menuService.deleteMenuItem:", err);
      throw new Error(apiMessage || "Failed to delete menu item");
    }
  },
};
