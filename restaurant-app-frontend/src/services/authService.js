// src/services/authService.js
// ---------------------------------------------------------------------
// Authentication Service
//
// This module centralizes all client-side authentication logic.
// It uses our axios instance (`api`) to communicate with the Rails API,
// handles JWT tokens and user data in localStorage, and exposes helper
// methods for logging in, registering, logging out, and querying
// authentication state.
// ---------------------------------------------------------------------

import api from "./api"; // Preconfigured axios with baseURL, JSON headers, and auth interceptor

export const authService = {
	/**
	 * login(email, password)
	 *
	 * 1. Sends a POST request to '/auth/login' with the user’s email and password.
	 * 2. Expects the response JSON to include `{ data: { user: {…}, token: '…' } }`.
	 * 3. Persists the JWT under 'authToken' and the user object under 'user' in localStorage.
	 * 4. Returns an object containing `{ user, token }` for immediate use.
	 *
	 * @param {string} email    - The user’s email credential
	 * @param {string} password - The user’s plain-text password
	 * @returns {Promise<{ user: Object, token: string }>}
	 * @throws {Error} With a backend‐provided message or generic 'Login failed'
	 */
	login: async (email, password) => {
		try {
			// Send credentials to the server
			const response = await api.post("/auth/login", { email, password });

			// Destructure the returned user object and JWT
			const { user, token } = response.data.data;

			// Store token so axios interceptor can add Authorization header automatically
			localStorage.setItem("authToken", token);

			// Store user profile for easy retrieval (e.g., displaying user name)
			localStorage.setItem("user", JSON.stringify(user));

			// Return data to caller (e.g., UI component) for immediate state update
			return { user, token };
		} catch (error) {
			// Attempt to extract a meaningful error message from API response
			const msg = error.response?.data?.error || "Login failed";
			// Throw so UI logic can catch and display to the user
			throw new Error(msg);
		}
	},

	/**
	 * register(email, password, passwordConfirmation)
	 *
	 * 1. Sends a POST request to '/auth/register' with user signup data.
	 * 2. Server validates uniqueness, password length, etc., and returns JWT + user.
	 * 3. Persists token and user data to localStorage just like login().
	 * 4. Returns `{ user, token }` on success.
	 *
	 * @param {string} email                 - New user’s email address
	 * @param {string} password              - New user’s chosen password
	 * @param {string} passwordConfirmation  - Must match the password
	 * @returns {Promise<{ user: Object, token: string }>}
	 * @throws {Error} With a backend‐provided validation message or generic 'Registration failed'
	 */
	register: async (email, password, passwordConfirmation) => {
		try {
			// Send registration details to the server
			const response = await api.post("/auth/register", {
				email,
				password,
				password_confirmation: passwordConfirmation,
			});

			// Destructure the returned user object and JWT
			const { user, token } = response.data.data;

			// Persist token for authenticated API calls
			localStorage.setItem("authToken", token);

			// Persist user profile for UI state
			localStorage.setItem("user", JSON.stringify(user));

			return { user, token };
		} catch (error) {
			const msg = error.response?.data?.error || "Registration failed";
			throw new Error(msg);
		}
	},

	/**
	 * logout()
	 *
	 * Clears all authentication-related data from localStorage:
	 *  • Removes JWT token so further requests will be unauthenticated.
	 *  • Removes stored user object.
	 * Note: Since the backend is stateless (JWT), no API call is needed.
	 */
	logout: () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("user");
	},

	/**
	 * getCurrentUser()
	 *
	 * Reads and parses the stored user JSON from localStorage.
	 * Returns null if no user is found, or if parsing fails.
	 *
	 * @returns {Object|null} The logged‐in user object, or null if not logged in.
	 */
	getCurrentUser: () => {
		const userStr = localStorage.getItem("user");
		if (!userStr) return null;

		try {
			// Parse the JSON string back into an object
			return JSON.parse(userStr);
		} catch {
			// If parsing fails, remove corrupt data and return null
			localStorage.removeItem("user");
			return null;
		}
	},

	/**
	 * getToken()
	 *
	 * Retrieves the JWT from localStorage, or returns null if missing.
	 * This is used by the axios interceptor in api.js to set the
	 * Authorization header on each request.
	 *
	 * @returns {string|null} The JWT, or null if not present.
	 */
	getToken: () => {
		return localStorage.getItem("authToken");
	},

	/**
	 * isAuthenticated()
	 *
	 * Quick boolean check to see if a JWT exists in localStorage.
	 * Can be used to guard UI routes or conditionally render components.
	 *
	 * @returns {boolean} True if a token is present, false otherwise.
	 */
	isAuthenticated: () => {
		return Boolean(localStorage.getItem("authToken"));
	},
};
