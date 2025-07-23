// src/components/menu/MenuItemDetail.js
// ---------------------------------------------------------------------
// MenuItemDetail Component
// ---------------------------------------------------------------------
// Fetches and displays detailed information for one menu item.
// Features:
//   • Dynamic URL param extraction via react-router's useParams
//   • Asynchronous data fetch with loading and error handling
//   • Displays: name, category, price, availability badge, description
//   • Action buttons: Edit, Delete, and Back to Menu
// ---------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../common/LoadingSpinner";
import { menuService } from "../../services/menuService";
import "./MenuItemDetail.css";

/**
 * MenuItemDetail
 * @returns {JSX.Element}
 *
 * A detail view for a single menu item. Reads `id` from the URL,
 * fetches the item from the API, and renders all its attributes.
 */
const MenuItemDetail = () => {
  // Extract `id` from route parameters and navigate function
  const { id } = useParams();
  const navigate = useNavigate();

  // Local state: item attributes, loading status, and error message
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the menu item when component mounts or `id` changes
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await menuService.getMenuItem(id);
        // JSONAPI: response.data.attributes holds the fields
        setItem(response.data.attributes);
      } catch (err) {
        setError(err.message || "Failed to load menu item");
        toast.error(err.message || "Error fetching menu item");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Show spinner while loading
  if (loading) {
    return <LoadingSpinner message={`Loading item ${id}...`} />;
  }

  // Show error state if fetch failed
  if (error) {
    return (
      <div className="alert alert-danger">
        <p>Error: {error}</p>
        {/* Button to navigate back to menu list */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/menu")}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  // Destructure the fetched item fields
  const { name, category, description, formatted_price, available } = item;

  return (
    <div className="menu-item-detail">
      {/* Title */}
      <h1>{name}</h1>

      {/* Category label */}
      <p className="category">
        <em>Category:</em> {category}
      </p>

      {/* Price and availability badge */}
      <p className="price">
        <strong>Price:</strong> {formatted_price}
        {!available && <span className="badge badge-warning">Unavailable</span>}
      </p>

      {/* Full description */}
      <div className="description">
        <p>{description}</p>
      </div>

      {/* Action buttons */}
      <div className="actions">
        {/* Navigate to edit form */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/menu_items/${id}/edit`)}
        >
          Edit
        </button>
        {/* Delete with confirmation and redirect */}
        <button
          type="button"
          className="btn btn-danger"
          onClick={async () => {
            if (window.confirm(`Delete "${name}"?`)) {
              try {
                await menuService.deleteMenuItem(id);
                toast.success("Menu item deleted");
                navigate("/menu");
              } catch (err) {
                toast.error(err.message || "Delete failed");
              }
            }
          }}
        >
          Delete
        </button>
        {/* Back link styled as button */}
        <button
          type="button"
          className="btn btn-link"
          onClick={() => navigate("/menu")}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default MenuItemDetail;
