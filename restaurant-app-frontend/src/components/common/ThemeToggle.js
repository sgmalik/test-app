// src/components/common/ThemeToggle.js
// ---------------------------------------------------------------------
// ThemeToggle Component
// ---------------------------------------------------------------------
// Provides a button that lets the user switch between light and dark
// themes. It:
//   • Reads and persists the user’s choice in localStorage
//   • Respects the system preference on first load
//   • Applies the chosen theme by setting a `data-theme` attribute on
//     the <html> element, which our CSS uses to swap color variables.
// ---------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import "./ThemeToggle.css"; // Styles for the toggle button

/**
 * ThemeToggle
 *
 * Renders a single button that toggles between light and dark mode.
 * - On mount, checks localStorage for a saved theme.
 * - If none is found, falls back to the user’s OS preference.
 * - Stores any new selection back into localStorage.
 * - Updates the `data-theme` attribute on <html>, which our CSS reads
 *   to switch color variables.
 */
const ThemeToggle = () => {
	// Local component state: true = dark mode, false = light mode
	const [isDark, setIsDark] = useState(false);

	// On first render:
	// 1. Check if the user previously saved a theme in localStorage.
	// 2. If so, use that. Otherwise, fall back to the system preference.
	// 3. Apply the theme by setting data-theme on the <html> element.
	useEffect(() => {
		// Read stored theme, if any
		const savedTheme = localStorage.getItem("theme");
		// Detect OS preference for dark mode
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;

		if (savedTheme) {
			// If we have a saved value, use it
			const useDark = savedTheme === "dark";
			setIsDark(useDark);
			document.documentElement.setAttribute("data-theme", savedTheme);
		} else if (prefersDark) {
			// No saved value, but OS prefers dark
			setIsDark(true);
			document.documentElement.setAttribute("data-theme", "dark");
		}
		// Empty dependency array ⇒ run only once on mount
	}, []);

	/**
	 * toggleTheme
	 *
	 * Flips the isDark state and:
	 * 1. Updates the <html> attribute so CSS variables switch
	 * 2. Persists the new choice in localStorage
	 */
	const toggleTheme = () => {
		// Determine the new theme string based on current state
		const newTheme = isDark ? "light" : "dark";
		// Update React state
		setIsDark(!isDark);
		// Apply new theme to the document root
		document.documentElement.setAttribute("data-theme", newTheme);
		// Save user choice for next visit
		localStorage.setItem("theme", newTheme);
	};

	return (
		// A simple button with an accessible label
		// Using CSS classes to show sun/moon icons via background-image or pseudo-elements
		<button
			type="button" // Button type to prevent form submission
			onClick={toggleTheme} // Toggle on click
			className="theme-toggle" // Styled in ThemeToggle.css
			aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} // Screen-reader text
		>
			{isDark ? "🌙" : "☀️"} {/* Show a moon for dark mode, sun for light */}
		</button>
	);
};

export default ThemeToggle;
