// src/contexts/AuthContext.js
// =====================================================================
// AuthContext
//
// Provides global authentication state and methods (login, register,
// logout) via React Context and useReducer. Components can call
// useAuth() to access the user object, token, loading flag, and
// auth actions.
// =====================================================================

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/authService"; // Handles API calls + localStorage

// ---------------------------------------------------------------------
// 1. Context and Reducer
// ---------------------------------------------------------------------

// Create the context object
const AuthContext = createContext();

/**
 * authReducer
 * -----------
 * Manages authentication state transitions based on dispatched actions.
 *
 * State shape:
 *   {
 *     user:           Object|null, // The logged-in user
 *     token:          string|null, // JWT string
 *     isAuthenticated: boolean,    // true when user & token are set
 *     loading:        boolean      // true while an auth request is in progress
 *   }
 *
 * Actions:
 *   - LOGIN_SUCCESS: sets user, token, isAuthenticated=true, loading=false
 *   - LOGOUT:        clears user, token, sets isAuthenticated=false, loading=false
 *   - SET_LOADING:   sets loading flag (true/false)
 */
const authReducer = (state, action) => {
	switch (action.type) {
		case "LOGIN_SUCCESS":
			return {
				...state,
				user: action.payload.user,
				token: action.payload.token,
				isAuthenticated: true,
				loading: false,
			};

		case "LOGOUT":
			return {
				...state,
				user: null,
				token: null,
				isAuthenticated: false,
				loading: false,
			};

		case "SET_LOADING":
			return {
				...state,
				loading: action.payload,
			};

		default:
			// No matching action type: return current state unchanged
			return state;
	}
};

// ---------------------------------------------------------------------
// 2. Provider Component
// ---------------------------------------------------------------------

/**
 * AuthProvider
 * ------------
 * Wrap your application with this provider to supply auth state & actions.
 */
export const AuthProvider = ({ children }) => {
	// Initialize reducer with default state:
	//   - no user/token
	//   - loading=true while we check localStorage
	const [state, dispatch] = useReducer(authReducer, {
		user: null,
		token: null,
		isAuthenticated: false,
		loading: true,
	});

	// On mount, check if a token + user are already in localStorage
	// If found, dispatch LOGIN_SUCCESS to populate state
	// Otherwise, clear loading flag
	useEffect(() => {
		const token = authService.getToken();
		const user = authService.getCurrentUser();

		if (token && user) {
			dispatch({
				type: "LOGIN_SUCCESS",
				payload: { user, token },
			});
		} else {
			dispatch({ type: "SET_LOADING", payload: false });
		}
		// [] ensures this runs only once, on initial render
	}, []);

	// -------------------------------------------------------------------
	// Auth Action Wrappers
	// -------------------------------------------------------------------

	/**
	 * login(email, password)
	 * ----------------------
	 * Calls authService.login, updates state on success,
	 * and returns the { user, token }. Throws on failure.
	 */
	const login = async (email, password) => {
		dispatch({ type: "SET_LOADING", payload: true });
		try {
			const { user, token } = await authService.login(email, password);
			dispatch({
				type: "LOGIN_SUCCESS",
				payload: { user, token },
			});
			return { user, token };
		} catch (error) {
			// Stop loading if login fails
			dispatch({ type: "SET_LOADING", payload: false });
			throw error; // Let caller handle display
		}
	};

	/**
	 * register(email, password, passwordConfirmation)
	 * -----------------------------------------------
	 * Calls authService.register, updates state on success,
	 * and returns the { user, token }. Throws on failure.
	 */
	const register = async (email, password, passwordConfirmation) => {
		dispatch({ type: "SET_LOADING", payload: true });
		try {
			const { user, token } = await authService.register(
				email,
				password,
				passwordConfirmation,
			);
			dispatch({
				type: "LOGIN_SUCCESS",
				payload: { user, token },
			});
			return { user, token };
		} catch (error) {
			dispatch({ type: "SET_LOADING", payload: false });
			throw error;
		}
	};

	/**
	 * logout()
	 * --------
	 * Clears client-side storage and resets auth state.
	 */
	const logout = () => {
		authService.logout(); // Remove token & user from localStorage
		dispatch({ type: "LOGOUT" }); // Reset state
	};

	// -------------------------------------------------------------------
	// Provide context value: spread state and include action functions
	// -------------------------------------------------------------------
	return (
		<AuthContext.Provider
			value={{
				// State values
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated,
				loading: state.loading,
				// Actions
				login,
				register,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// ---------------------------------------------------------------------
// 3. Custom Hook
// ---------------------------------------------------------------------

/**
 * useAuth()
 * ---------
 * Custom hook for components to access auth context.
 * Throws an error if used outside of AuthProvider.
 */
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
