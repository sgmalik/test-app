// src/components/home/About.js
// ---------------------------------------------------------------------
// About Component
// ---------------------------------------------------------------------
// Renders the "About Us" page for RestaurantApp. This page provides:
//   • An overview of the restaurant’s mission and history
//   • Core values and community focus
//   • Technology stack used to build the application
// ---------------------------------------------------------------------

import React from "react";

/**
 * About
 * A stateless component that displays information about RestaurantApp.
 * Uses semantic HTML to structure content into meaningful sections.
 * @returns {JSX.Element}
 */
const About = () => {
  return (
    // Root container for About page with its own CSS scope
    <div className="about-page">
      {/* Main heading for the page */}
      <h1>About Us</h1>

      {/* Intro paragraph explaining the app's core purpose */}
      <p>
        RestaurantApp is dedicated to delivering delicious food and creating
        unforgettable dining experiences. Founded in 2020, our passion is to
        merge culinary creativity with warm hospitality.
      </p>

      {/* ----------------------------------------------------------------- */}
      {/* Section: Our Story                                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          What started as a neighborhood bistro has grown into a community
          staple. We pride ourselves on sourcing the freshest local ingredients
          and innovating on classic recipes.
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section: Our Values                                            */}
      {/* ----------------------------------------------------------------- */}
      <section className="about-section">
        <h2>Our Values</h2>
        <ul>
          {/* Each list item highlights a core value */}
          <li>
            <strong>Quality:</strong> Never compromise on flavor or
            presentation.
          </li>
          <li>
            <strong>Community:</strong> Support local farmers and artisans.
          </li>
          <li>
            <strong>Innovation:</strong> Continually experiment with new
            flavors.
          </li>
          <li>
            <strong>Hospitality:</strong> Treat every guest like family.
          </li>
        </ul>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section: Built With                                           */}
      {/* ----------------------------------------------------------------- */}
      <section className="about-section">
        <h2>Built With</h2>
        <p>
          Our platform is powered by <code>Ruby on Rails</code> on the backend
          and <code>React</code> on the frontend, delivering a responsive,
          modern experience.
        </p>
      </section>
    </div>
  );
};

export default About;
