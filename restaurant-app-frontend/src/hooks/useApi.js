// src/hooks/useApi.js
// ---------------------------------------------------------------------
// A custom React hook to fetch data from an asynchronous API function,
// managing loading, error, and data state in a standardized way.
// Components can use this hook to simplify data fetching logic.
// ---------------------------------------------------------------------

// Import React hooks for state and lifecycle management
import { useState, useEffect } from "react";

/**
 * useApi
 * @param {Function} apiFunction  - An async function that returns data when called (e.g., a service method).
 * @param {Array}   dependencies  - Array of values that, when changed, re-trigger the data fetch.
 * @returns {Object} { data, loading, error, refetch }
 *   - data:    The response data from apiFunction, or null before loaded.
 *   - loading: Boolean indicating whether the fetch is in progress.
 *   - error:   Error message string if the fetch failed, or null otherwise.
 *   - refetch: Function to manually re-run the fetch (useful for retrying on error).
 */
export const useApi = (apiFunction, dependencies = []) => {
  // ---------------------------------------------------------------
  // State variables
  // ---------------------------------------------------------------

  // Holds the data returned by the API. Initialized to null.
  const [data, setData] = useState(null);

  // Tracks whether the API call is currently in progress.
  // Initialized to true so that UI can show a loading state on first render.
  const [loading, setLoading] = useState(true);

  // Holds any error message if the API call fails. Initialized to null.
  const [error, setError] = useState(null);

  // ---------------------------------------------------------------
  // Side effect: Fetch data when component mounts or dependencies change
  // ---------------------------------------------------------------
  useEffect(() => {
    // Define an async function inside useEffect to allow using async/await
    const fetchData = async () => {
      // Before starting, indicate loading and clear previous errors
      setLoading(true);
      setError(null);

      try {
        // Call the provided API function and wait for its result
        const result = await apiFunction();
        // Save the result into `data` state
        setData(result);
      } catch (err) {
        // If an error occurs, capture its message (or a fallback)
        setError(err.message || "An unexpected error occurred");
      } finally {
        // In all cases (success or error), stop the loading state
        setLoading(false);
      }
    };

    // Invoke the async fetch function
    fetchData();

    // The effect re-runs whenever any value in `dependencies` changes
  }, dependencies);

  // ---------------------------------------------------------------
  // refetch function: allows manual re-trigger of the fetch
  // ---------------------------------------------------------------
  const refetch = async () => {
    // Similar logic to fetchData above; duplicate to allow manual trigger
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // Return values to the calling component
  // ---------------------------------------------------------------
  return {
    data, // The fetched data or null
    loading, // Boolean: true while fetching, false afterwards
    error, // Error message or null
    refetch, // Function to manually trigger the request again
  };
};
