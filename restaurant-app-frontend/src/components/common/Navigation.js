// src/components/common/Navigation.js
// ---------------------------------------------------------------------
// Navigation component: renders the top navigation bar with links
// to different routes. Highlights the active link based on current URL.
// ---------------------------------------------------------------------

import React from "react";
// Link: clickable element for client-side navigation
// useLocation: hook to access current URL path
import { Link, useLocation } from "react-router-dom";

// Import component-specific styles
import "./Navigation.css";

/**
 * Navigation
 * A responsive navigation bar with branding and route links.
 * The active link is styled differently for user feedback.
 */
const Navigation = () => {
  // Get current location object to determine which link is active
  const location = useLocation();

  /**
   * isActive
   * Checks if the given path matches the start of current pathname.
   * Used to apply 'active' CSS class to links.
   *
   * @param {string} path - The route path to check (e.g. '/menu')
   * @returns {boolean}   - True if current location starts with path
   */
  const isActive = (path) => {
    // Strict match or prefix match for nested routes
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    // <nav> defines a navigation section
    <nav className="navbar">
      {/* Container to center nav content */}
      <div className="nav-container">
        {/* Brand/logo: clicking returns to home page */}
        <Link to="/" className="nav-brand">
          RestaurantApp
        </Link>

        {/* Link group */}
        <div className="nav-links">
          {/* Home link: active only on exact '/' */}
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>

          {/* About link: active on '/about' */}
          <Link
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            About
          </Link>

          {/* Menu link: active on '/menu' or '/menu_items' */}
          <Link
            to="/menu"
            className={`nav-link ${isActive("/menu") ? "active" : ""}`}
          >
            Menu
          </Link>

          {/* Book Table link: active on '/book' */}
          <Link
            to="/book"
            className={`nav-link ${isActive("/book") ? "active" : ""}`}
          >
            Book Table
          </Link>

          {/* Reservations link: active on '/reservations' */}
          <Link
            to="/reservations"
            className={`nav-link ${isActive("/reservations") ? "active" : ""}`}
          >
            Reservations
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
