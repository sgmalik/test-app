# app/controllers/api/v1/docs_controller.rb
# ------------------------------------------------------
# Controller providing API documentation endpoints for version 1
# of the RestaurantApp. Returns meta-information, endpoint definitions,
# parameter descriptions, and JSON schemas for resources.
class Api::V1::DocsController < Api::V1::BaseController
  # ---------------------------------------------------------------------
  # GET /api/v1/docs
  # ---------------------------------------------------------------------
  # Renders a high-level overview of the API, including version, description,
  # available endpoints, and accepted query parameters per resource.
  def index
    render json: {
      # The current API version
      api_version: 'v1',
      # A brief textual description of the API
      description: 'RestaurantApp API',
      # Define all top-level resources and their RESTful routes
      endpoints: {
        # Menu items resource routes
        menu_items: {
          index:   'GET    /api/v1/menu_items',        # List all menu items
          show:    'GET    /api/v1/menu_items/:id',    # Retrieve a single menu item
          create:  'POST   /api/v1/menu_items',        # Create a new menu item
          update:  'PUT/PATCH /api/v1/menu_items/:id', # Update an existing menu item
          destroy: 'DELETE /api/v1/menu_items/:id'     # Delete a menu item
        },
        # Reservations resource routes
        reservations: {
          index:   'GET    /api/v1/reservations',            # List all reservations
          show:    'GET    /api/v1/reservations/:id',        # Retrieve a single reservation
          create:  'POST   /api/v1/reservations',            # Create a new reservation
          update:  'PUT/PATCH /api/v1/reservations/:id',     # Update reservation details
          destroy: 'DELETE /api/v1/reservations/:id',       # Cancel/delete a reservation
          confirm: 'PATCH  /api/v1/reservations/:id/confirm',# Confirm a pending reservation
          cancel:  'PATCH  /api/v1/reservations/:id/cancel'  # Cancel a confirmed reservation
        }
      },
      # Descriptions for accepted query parameters on index routes
      parameters: {
        menu_items: {
          index: {
            category:  'Filter by category (e.g., Appetizer, Entree)',
            available: 'Filter by availability (true or false)',
            sort:      'Sort by name, price, or category',
            page:      'Page number for pagination (default: 1)',
            per_page:  'Items per page (max: 100, default: 20)'
          }
        },
        reservations: {
          index: {
            status:         'Filter by reservation status (pending, confirmed, cancelled)',
            date:           'Filter by specific date (YYYY-MM-DD)',
            start_date:     'Filter from this date (YYYY-MM-DD)',
            end_date:       'Filter up to this date (YYYY-MM-DD)',
            customer_email: 'Filter by customer email address',
            page:           'Page number for pagination (default: 1)',
            per_page:       'Items per page (max: 100, default: 20)'
          }
        }
      }
    }
  end

  # ---------------------------------------------------------------------
  # GET /api/v1/docs/menu_items_schema
  # ---------------------------------------------------------------------
  # Returns a JSON Schema definition for the menu_items resource,
  # detailing required fields, types, and any enumerations or defaults.
  def menu_items_schema
    render json: {
      menu_item: {
        type: 'object',    # Indicates this schema defines an object
        properties: {
          name:        { type: 'string', required: true },              # Dish name
          description: { type: 'string', required: true },              # Brief summary
          price:       { type: 'number', required: true },              # Numeric price value
          category:    { type: 'string', required: true, enum: MenuItem::CATEGORIES },
            # Must be one of the allowed category strings
          available:   { type: 'boolean', default: true }               # Availability flag
        }
      }
    }
  end

  # ---------------------------------------------------------------------
  # GET /api/v1/docs/reservations_schema
  # ---------------------------------------------------------------------
  # Returns a JSON Schema definition for the reservations resource,
  # describing each field, its type, constraints, and formatting.
  def reservations_schema
    render json: {
      reservation: {
        type: 'object',  # Schema for a reservation payload
        properties: {
          customer_name:    { type: 'string',  required: true },
            # Full name of the person booking
          customer_email:   { type: 'string',  required: true, format: 'email' },
            # Must be a valid email address
          customer_phone:   { type: 'string',  required: true },
            # Contact phone number
          party_size:       { type: 'integer', required: true, minimum: 1 },
            # Number of guests (at least 1)
          reservation_date: { type: 'string',  required: true, format: 'date-time' },
            # ISO 8601 timestamp for reservation
          special_requests: { type: 'string' }
            # Optional notes (e.g., "window seat")
        }
      }
    }
  end
end
