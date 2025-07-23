// src/components/common/Footer.js
// ---------------------------------------------------------------------
// Footer Component
// ---------------------------------------------------------------------
// A site-wide footer that appears at the bottom of every page. It includes:
//   • Branding section with app description and technology stack
//   • Contact information with address, phone, and email
//   • Hours of operation for each day of the week
//   • Quick navigation links for common pages
//
// Uses React Router's <Link> for client-side navigation and
// pulls in component-specific CSS for styling.
// ---------------------------------------------------------------------

import React from "react";
import { Link } from "react-router-dom";
// Import CSS styles scoped to the Footer component
import "./Footer.css";

/**
 * Footer
 * @returns {JSX.Element}
 *
 * Renders the application footer with multiple informational sections.
 * Designed to be placed at the bottom of the layout.
 */
const Footer = () => {
  return (
    // <footer> semantic element indicates page footer
    <footer className="footer">
      {/* Wrapper to constrain width and layout the sections */}
      <div className="footer-content">
        {/* ----------------------------------------------------------------- */}
        {/* Branding Section                                                 */}
        {/* ----------------------------------------------------------------- */}
        <div className="footer-section">
          <h3>RestaurantApp</h3>
          {/* Description of the service and founding date */}
          <p>
            Bringing you delicious food and unforgettable dining experiences
            since 2020.
          </p>
          {/* Technology stack note */}
          <p>Made with ❤️ using Ruby on Rails & React</p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Contact Information                                               */}
        {/* ----------------------------------------------------------------- */}
        <div className="footer-section">
          <h3>Contact Info</h3>
          {/* Address block with line breaks */}
          <p>
            123 Main Street
            <br />
            Your City, State 12345
          </p>
          {/* Phone number */}
          <p>(555) 123-4567</p>
          {/* Email link (could be mailto:) */}
          <p>info@restaurantapp.com</p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Hours of Operation                                                */}
        {/* ----------------------------------------------------------------- */}
        <div className="footer-section">
          <h3>Hours</h3>
          {/* Weekday hours */}
          <p>
            <strong>Monday - Thursday</strong>
            <br />
            5:00 PM - 10:00 PM
          </p>
          {/* Weekend hours */}
          <p>
            <strong>Friday - Saturday</strong>
            <br />
            5:00 PM - 11:00 PM
          </p>
          {/* Sunday hours */}
          <p>
            <strong>Sunday</strong>
            <br />
            4:00 PM - 9:00 PM
          </p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Quick Links                                                       */}
        {/* ----------------------------------------------------------------- */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          {/* Use <Link> for SPA navigation without page reload */}
          <p>
            <Link to="/">Home</Link>
          </p>
          <p>
            <Link to="/about">About Us</Link>
          </p>
          <p>
            <Link to="/menu">Menu</Link>
          </p>
          <p>
            <Link to="/book">Reservations</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
