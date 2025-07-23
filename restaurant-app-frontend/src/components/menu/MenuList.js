// src/components/menu/MenuList.js
// ---------------------------------------------------------------------
// MenuList Component
// ---------------------------------------------------------------------
// This component fetches and displays a list of menu items from the Rails API.
// It allows users to:
//   • Filter by category, availability, and sort order
//   • View items grouped by category
//   • Add, edit, and delete menu items
//   • See loading and error states during data operations
//
// React, React Router, and custom hooks are used to manage state,
// perform side-effects, and navigate between pages without full reloads.
// ---------------------------------------------------------------------

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { menuService } from "../../services/menuService";
import { useApi } from "../../hooks/useApi";
import LoadingSpinner from "../common/LoadingSpinner";
import "./MenuList.css";

/**
 * MenuList
 * @returns {JSX.Element} The complete menu management page
 *
 * 1. Initializes `filters` state for category, availability, sort
 * 2. Uses `useApi` to fetch menu items whenever `filters` change
 * 3. Renders filter controls and a grouped list of items
 * 4. Provides Add/Edit/Delete actions on each item
 * 5. Handles loading spinner and error messages gracefully
 */
const MenuList = () => {
  // -------------------------------------------------------------------
  // Filters State
  // -------------------------------------------------------------------
  // Holds current filter values to pass to the API call
  const [filters, setFilters] = useState({
    category: "", // '' = all categories
    available: "", // '' = all, 'true' = only available, 'false' = only unavailable
    sort: "category", // default sort by category
  });

  // -------------------------------------------------------------------
  // Data Fetching: useApi Hook
  // -------------------------------------------------------------------
  // useApi takes a function returning a Promise and an array of dependencies
  // It returns { data, loading, error, refetch }
  const { data, loading, error, refetch } = useApi(
    () => menuService.getMenuItems(filters), // dynamic API call
    [filters], // re-run when filters change
  );

  // -------------------------------------------------------------------
  // Event Handlers
  // -------------------------------------------------------------------

  /**
   * Updates a single filter value in state and triggers data re-fetch.
   * @param {string} field - One of 'category', 'available', or 'sort'
   * @param {string} value - The new value for that filter field
   */
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Deletes a menu item after user confirmation.
   * Shows a toast notification on success or error, then refreshes list.
   * @param {string|number} id   - The unique ID of the item
   * @param {string} name        - The item name used in the confirmation dialog
   */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await menuService.deleteMenuItem(id);
      toast.success("Menu item deleted successfully");
      refetch(); // Refresh list
    } catch (err) {
      toast.error(err.message || "Failed to delete menu item");
    }
  };

  // -------------------------------------------------------------------
  // Data Transformation: Group Items by Category
  // -------------------------------------------------------------------
  // Safely reduce the fetched data into an object: { categoryName: [items...] }
  const groupedMenuItems = (data?.data || []).reduce((groups, item) => {
    const category = item.attributes.category || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  // -------------------------------------------------------------------
  // Conditional Rendering: Loading & Error States
  // -------------------------------------------------------------------
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  // -------------------------------------------------------------------
  // Main Render: Filters Control, Grouped Items, or Empty State
  // -------------------------------------------------------------------
  return (
    <div className="menu-list">
      {/* Page Header */}
      <header className="page-header">
        <h1>Our Menu</h1>
        <p>
          Discover our carefully crafted dishes with the finest ingredients.
        </p>
      </header>

      {/* Controls: Add Item & Filters */}
      <div className="menu-controls card">
        <div className="card-body">
          <div className="controls-row">
            <Link to="/menu_items/new" className="btn btn-primary">
              Add New Item
            </Link>
            <div className="filters">
              {/* Category Filter Dropdown */}
              <select
                className="form-control"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {data?.meta?.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Availability Filter */}
              <select
                className="form-control"
                value={filters.available}
                onChange={(e) =>
                  handleFilterChange("available", e.target.value)
                }
              >
                <option value="">All Items</option>
                <option value="true">Available Only</option>
                <option value="false">Unavailable Only</option>
              </select>

              {/* Sort Order Filter */}
              <select
                className="form-control"
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                <option value="category">Sort by Category</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Display Items or Empty Placeholder */}
      <div className="menu-display">
        {Object.keys(groupedMenuItems).length > 0 ? (
          // Map each category to a section
          Object.entries(groupedMenuItems).map(([category, items]) => (
            <section key={category} className="menu-category-section">
              {/* Category Header with Decorative Line */}
              <div className="category-header">
                <h2>{category}</h2>
                <div className="category-line" />
              </div>

              {/* Grid of Menu Item Cards */}
              <div className="menu-items-grid">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`menu-item-card ${!item.attributes.available ? "unavailable" : ""
                      }`}
                  >
                    <div className="item-content">
                      {/* Item Title & Price Row */}
                      <div className="item-header">
                        <h3>
                          <Link to={`/menu_items/${item.id}`}>
                            {item.attributes.name}
                          </Link>
                        </h3>
                        <span className="price">
                          {item.attributes.formatted_price}
                        </span>
                      </div>

                      {/* Item Description */}
                      <p className="description">
                        {item.attributes.description}
                      </p>

                      {/* Unavailable Badge if item not in stock */}
                      {!item.attributes.available && (
                        <span className="badge badge-warning">
                          Currently Unavailable
                        </span>
                      )}

                      {/* Action Buttons: View, Edit, Delete */}
                      <div className="item-actions">
                        <Link
                          to={`/menu_items/${item.id}`}
                          className="btn btn-sm btn-info"
                        >
                          View
                        </Link>
                        <Link
                          to={`/menu_items/${item.id}/edit`}
                          className="btn btn-sm btn-secondary"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDelete(item.id, item.attributes.name)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          // Empty state: No items found
          <div className="empty-state card">
            <div className="card-body text-center">
              <div className="empty-icon" aria-hidden="true">
                😕
              </div>
              <h3>No menu items found</h3>
              <p>No menu items match your current filters.</p>
              <Link to="/menu_items/new" className="btn btn-primary">
                Add Menu Item
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuList;
