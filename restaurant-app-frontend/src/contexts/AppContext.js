// src/contexts/AppContext.js
// ---------------------------------------------------------------------
// Application Context: Global State Management
// ---------------------------------------------------------------------
// This file creates a React Context and Provider to manage global
// application state using the useReducer hook. It centralizes data for:
//   • Loading & error indicators
//   • Menu items (CRUD operations)
//   • Reservations (CRUD, confirm/cancel)
//   • User authentication status
// It exposes `state` and `actions` via context, accessible through the
// `useApp` custom hook in any component.
// ---------------------------------------------------------------------

import React, { createContext, useContext, useReducer } from "react";
import { menuService } from "../services/menuService";
import { reservationService } from "../services/reservationService";

// ---------------------------------------------------------------------
// Action Types
// ---------------------------------------------------------------------
// Enumerate all actions to avoid typos and for easy refactoring.
export const actionTypes = {
  // Loading & error
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  // Menu items
  SET_MENU_ITEMS: "SET_MENU_ITEMS",
  ADD_MENU_ITEM: "ADD_MENU_ITEM",
  UPDATE_MENU_ITEM: "UPDATE_MENU_ITEM",
  REMOVE_MENU_ITEM: "REMOVE_MENU_ITEM",

  // Reservations
  SET_RESERVATIONS: "SET_RESERVATIONS",
  ADD_RESERVATION: "ADD_RESERVATION",
  UPDATE_RESERVATION: "UPDATE_RESERVATION",
  REMOVE_RESERVATION: "REMOVE_RESERVATION",

  // User auth
  SET_USER: "SET_USER",
  LOGOUT: "LOGOUT",
};

// ---------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------
// Defines the shape and default values of the global store.
const initialState = {
  loading: false, // true when async operations are ongoing
  error: null, // error message string or null

  menuItems: [], // array of menu item objects
  reservations: [], // array of reservation objects

  user: null, // authenticated user info or null
  isAuthenticated: false, // tracks login status
};

// ---------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------
// Pure function that updates state based on action type and payload.
const appReducer = (state, action) => {
  switch (action.type) {
    // ------ Loading & Error ------
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    // ------ Menu Items CRUD ------
    case actionTypes.SET_MENU_ITEMS:
      return { ...state, menuItems: action.payload, loading: false };

    case actionTypes.ADD_MENU_ITEM:
      return {
        ...state,
        menuItems: [...state.menuItems, action.payload],
        loading: false,
      };

    case actionTypes.UPDATE_MENU_ITEM:
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
        loading: false,
      };

    case actionTypes.REMOVE_MENU_ITEM:
      return {
        ...state,
        menuItems: state.menuItems.filter((item) => item.id !== action.payload),
        loading: false,
      };

    // ------ Reservations CRUD ------
    case actionTypes.SET_RESERVATIONS:
      return { ...state, reservations: action.payload, loading: false };

    case actionTypes.ADD_RESERVATION:
      return {
        ...state,
        reservations: [...state.reservations, action.payload],
        loading: false,
      };

    case actionTypes.UPDATE_RESERVATION:
      return {
        ...state,
        reservations: state.reservations.map((res) =>
          res.id === action.payload.id ? action.payload : res,
        ),
        loading: false,
      };

    case actionTypes.REMOVE_RESERVATION:
      return {
        ...state,
        reservations: state.reservations.filter(
          (res) => res.id !== action.payload,
        ),
        loading: false,
      };

    // ------ User Authentication ------
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };

    // ------ Default ------
    default:
      return state;
  }
};

// Create the Context object
const AppContext = createContext();

// ---------------------------------------------------------------------
// Context Provider
// ---------------------------------------------------------------------
// Wrap your app in <AppProvider> to give components access to global state.
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // -------------------------------------------------------------------
  // Action Creators
  // -------------------------------------------------------------------
  // Each function dispatches an action, often after an async API call.
  const actions = {
    // Loading & Error
    setLoading: (loading) =>
      dispatch({ type: actionTypes.SET_LOADING, payload: loading }),

    setError: (error) =>
      dispatch({ type: actionTypes.SET_ERROR, payload: error }),

    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),

    // ------ Menu Items ------
    loadMenuItems: async (filters) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await menuService.getMenuItems(filters);
        dispatch({
          type: actionTypes.SET_MENU_ITEMS,
          payload: response.data,
        });
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
      }
    },

    createMenuItem: async (data) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await menuService.createMenuItem(data);
        dispatch({
          type: actionTypes.ADD_MENU_ITEM,
          payload: response.data,
        });
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
        throw err;
      }
    },

    updateMenuItem: async (id, data) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await menuService.updateMenuItem(id, data);
        dispatch({
          type: actionTypes.UPDATE_MENU_ITEM,
          payload: response.data,
        });
        return response.data;
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
        throw err;
      }
    },

    deleteMenuItem: async (id) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        await menuService.deleteMenuItem(id);
        dispatch({ type: actionTypes.REMOVE_MENU_ITEM, payload: id });
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
        throw err;
      }
    },

    // ------ Reservations ------
    loadReservations: async (filters) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await reservationService.getReservations(filters);
        dispatch({
          type: actionTypes.SET_RESERVATIONS,
          payload: response.data,
        });
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
      }
    },

    createReservation: async (data) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await reservationService.createReservation(data);
        dispatch({
          type: actionTypes.ADD_RESERVATION,
          payload: response.data,
        });
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
        throw err;
      }
    },

    updateReservation: async (id, data) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await reservationService.updateReservation(id, data);
        dispatch({
          type: actionTypes.UPDATE_RESERVATION,
          payload: response.data,
        });
        return response.data;
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
        throw err;
      }
    },

    confirmReservation: async (id) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await reservationService.confirmReservation(id);
        dispatch({
          type: actionTypes.UPDATE_RESERVATION,
          payload: response.data,
        });
        return response.data;
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
        throw err;
      }
    },

    cancelReservation: async (id) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await reservationService.cancelReservation(id);
        dispatch({
          type: actionTypes.UPDATE_RESERVATION,
          payload: response.data,
        });
        return response.data;
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
        throw err;
      }
    },

    deleteReservation: async (id) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        await reservationService.deleteReservation(id);
        dispatch({ type: actionTypes.REMOVE_RESERVATION, payload: id });
      } catch (err) {
        dispatch({ type: actionTypes.SET_ERROR, payload: err.message });
        throw err;
      }
    },

    // ------ User Actions ------
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),

    logout: () => dispatch({ type: actionTypes.LOGOUT }),
  };

  // Provide state and actions to child components
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// ---------------------------------------------------------------------
// Custom Hook: useApp
// ---------------------------------------------------------------------
// Convenient hook to access AppContext. Throws if used outside provider.
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
