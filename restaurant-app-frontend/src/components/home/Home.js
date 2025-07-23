// src/components/home/Home.js
// ---------------------------------------------------------------------
// Home Component
// ---------------------------------------------------------------------
// The Home component serves as the landing page for the RestaurantApp.
// It is divided into three main sections:
//  1. Hero section: a prominent welcome banner with primary calls to action.
//  2. Features section: a grid highlighting key selling points of the restaurant.
//  3. Call-to-Action (CTA) section: final prompt encouraging users to make a reservation.
//
// This component uses React for rendering, react-router for link navigation,
// and pulls in component-specific CSS for styling.
// ---------------------------------------------------------------------

import React from "react";
// Link enables client-side navigation without full page reload
import { Link } from "react-router-dom";
// Import the Home-specific stylesheet to apply layout and design rules
import "./Home.css";

/**
 * Home
 * @returns {JSX.Element} The rendered home page layout
 *
 * This functional component defines the structure and content of the home page.
 * It uses semantic HTML elements and CSS utility classes to organize content
 * and ensure responsive, accessible design.
 */
const Home = () => {
  // The component returns a single JSX tree representing the home page
  return (
    // Root container for the home page, applying page-wide padding and background
    <div className="home-page">
      {/* ----------------------------------------------------------------- */}
      {/* Hero Section: Welcome Banner with Main Actions                  */}
      {/* ----------------------------------------------------------------- */}
      <section className="hero-section">
        {/* Main Heading: greets the user by name of the app                */}
        <h1>Welcome to RestaurantApp</h1>
        {/* Subheading: brief tagline describing the experience              */}
        <p>Where culinary excellence meets warm hospitality</p>

        {/* Button Group: primary actions with visual prominence             */}
        <div className="hero-buttons">
          {/* Button: Navigate to the menu listing page                       */}
          <Link to="/menu" className="btn btn-primary btn-large">
            View Our Menu
          </Link>

          {/* Button: Navigate to the booking form                            */}
          <Link to="/book" className="btn btn-secondary btn-large">
            Book a Table
          </Link>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Features Section: Key Selling Points                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="features">
        {/* Section Title: centered and spaced from below                     */}
        <h2 className="text-center mb-5">Why Choose Us</h2>

        {/* Grid Container: lays out feature cards in a responsive grid       */}
        <div className="feature-grid">
          {/* Card 1: Fresh Ingredients                                      */}
          <div className="card">
            <div className="card-body text-center">
              {/* Icon or emoji representing freshness                        */}
              <div className="feature-icon" aria-hidden="true">
                🌱
              </div>
              {/* Feature Title                                              */}
              <h3>Fresh Ingredients</h3>
              {/* Description text explaining this feature                     */}
              <p>
                We source only the finest, locally-grown ingredients to ensure
                every dish bursts with flavor and nutrition.
              </p>
            </div>
          </div>

          {/* Card 2: Expert Chefs                                          */}
          <div className="card">
            <div className="card-body text-center">
              <div className="feature-icon" aria-hidden="true">
                👨‍🍳
              </div>
              <h3>Expert Chefs</h3>
              <p>
                Our experienced culinary team brings passion and creativity to
                every dish, creating memorable dining experiences.
              </p>
            </div>
          </div>

          {/* Card 3: Cozy Atmosphere                                       */}
          <div className="card">
            <div className="card-body text-center">
              <div className="feature-icon" aria-hidden="true">
                🏠
              </div>
              <h3>Cozy Atmosphere</h3>
              <p>
                Whether it's a romantic dinner, family celebration, or business
                meeting, our ambiance sets the perfect mood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CTA Section: Final Prompt to Make a Reservation                 */}
      {/* ----------------------------------------------------------------- */}
      <section className="cta-section">
        <div className="card">
          {/* CTA Header: stands out with gradient background               */}
          <div className="card-header text-center">
            <h2>Ready to Dine With Us?</h2>
          </div>

          {/* CTA Body: explanatory text and action buttons                  */}
          <div className="card-body text-center">
            <p>
              Experience the perfect blend of exceptional cuisine and
              outstanding service. Book your table today!
            </p>

            {/* CTA Buttons: direct navigation for booking or browsing menu   */}
            <div className="cta-buttons">
              <Link to="/book" className="btn btn-primary btn-large">
                Make Reservation
              </Link>
              <Link to="/menu" className="btn btn-secondary btn-large">
                Browse Menu
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
