// src/components/common/LoadingSpinner.js
// ---------------------------------------------------------------------
// LoadingSpinner Component
// ---------------------------------------------------------------------
// A simple, reusable component that displays a centered spinner
// and an optional message while asynchronous operations are in progress.
// Use this anywhere you need to show a loading state in your UI.
// ---------------------------------------------------------------------

import React from "react";

/**
 * LoadingSpinner
 *
 * @param {Object} props
 * @param {string} [props.message='Loading...']
 *   - The text message displayed below the spinner.
 *   - Defaults to “Loading...” if no message is provided.
 *
 * @returns {JSX.Element}
 *   - A div containing a spinning indicator and a text message,
 *     both centered on the page or within their parent container.
 */
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    // Wrapper that centers spinner + message vertically & horizontally
    <div className="loading">
      {/* 
        The spinner itself. The CSS class .spinner should define:
          • A fixed width and height (e.g. 40px)
          • A circular border with a contrasting segment
          • A CSS animation (e.g. @keyframes spin) that rotates 360°
      */}
      <div className="spinner" />

      {/*
        A descriptive message beneath the spinner.
        Helps convey what is loading (e.g. “Saving...”, “Fetching data...”, etc.)
      */}
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
