// src/App.js
// ---------------------------------------------------------------------
// Entry point for the React application. Sets up client-side routing,
// global layout (navigation, footer), and toast notifications for user
// feedback. Each Route maps a URL path to a component.
// ---------------------------------------------------------------------

import React from "react";
// BrowserRouter: synchronizes the UI with the URL
// Routes & Route: declare which component renders for which path
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ToastContainer: global container to display toast (popup) notifications
// Styles import adds default styling for toasts
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ----- Common Layout Components -----
import Navigation from "./components/common/Navigation";
import Footer from "./components/common/Footer";

// ----- Page Components -----
import Home from "./components/home/Home";
import About from "./components/home/About";
import MenuList from "./components/menu/MenuList";
import MenuItemDetail from "./components/menu/MenuItemDetail";
import MenuItemForm from "./components/menu/MenuItemForm";
import ReservationList from "./components/reservations/ReservationList";
import ReservationDetail from "./components/reservations/ReservationDetail";
import ReservationForm from "./components/reservations/ReservationForm";

// ----- Global Styles -----
import "./styles/global.css";

/**
 * App
 * The root component that sets up router, shared UI elements,
 * and top-level routes for the application.
 */
function App() {
  return (
    // Router wraps the entire app to enable client-side routing
    <Router>
      {/*
        Navigation appears at the top of every page. It typically contains
        links to Home, Menu, Reservations, About, etc.
      */}
      <Navigation />

      {/* Main content area. Use semantic <main> for accessibility. */}
      <main className="main-content">
        {/* Container to center and add horizontal padding */}
        <div className="container">
          {/*
            Routes declares all the application routes. Each Route maps a URL
            `path` to a React component via the `element` prop.
          */}
          <Routes>
            {/* Home pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* Menu-related pages */}
            <Route path="/menu" element={<MenuList />} />
            <Route path="/menu_items" element={<MenuList />} />
            <Route path="/menu_items/new" element={<MenuItemForm />} />
            <Route path="/menu_items/:id" element={<MenuItemDetail />} />
            <Route path="/menu_items/:id/edit" element={<MenuItemForm />} />

            {/* Reservation-related pages */}
            <Route path="/reservations" element={<ReservationList />} />
            <Route path="/reservations/new" element={<ReservationForm />} />
            <Route
              path="/book"
              element={<ReservationForm />} /* alias for new */
            />
            <Route path="/reservations/:id" element={<ReservationDetail />} />
            <Route
              path="/reservations/:id/edit"
              element={<ReservationForm />}
            />

            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>

          {/*
            ToastContainer displays toast notifications anywhere in the app.
            Props configure position, auto-close timeout, interactivity, etc.
          */}
          <ToastContainer
            position="top-right" // Show toasts in the top-right corner
            autoClose={5000} // Auto-dismiss after 5 seconds
            hideProgressBar={false} // Show progress bar
            newestOnTop={false} // Stack newest at the bottom
            closeOnClick // Dismiss on click
            rtl={false} // Left-to-right text
            pauseOnFocusLoss // Pause timer when window loses focus
            draggable // Allow dragging to dismiss
            pauseOnHover // Pause timer on hover
          />
        </div>
      </main>

      {/* Footer appears at the bottom of every page */}
      <Footer />
    </Router>
  );
}

// Export App as the default export so index.js can render it
export default App;
