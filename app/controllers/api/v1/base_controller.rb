# app/controllers/api/v1/base_controller.rb
# ------------------------------------------------------
# Base controller for API version 1, inheriting common behavior
# for all API endpoints. Handles JSON responses, disables CSRF
# for API requests, and centralizes error handling.
class Api::V1::BaseController < ApplicationController
  # ---------------------------------------------------------------------
  # Configuration
  # ---------------------------------------------------------------------

  # Skip Rails' built-in CSRF token verification for API requests
  # since API clients may not include authenticity tokens.
  skip_before_action :verify_authenticity_token

  # ---------------------------------------------------------------------
  # Exception Handling
  # ---------------------------------------------------------------------
  # Rescue common errors and render standardized JSON error responses.

  # Record not found in database (404 Not Found)
  rescue_from ActiveRecord::RecordNotFound,      with: :record_not_found
  # Validation failures when saving/updating records (422 Unprocessable Entity)
  rescue_from ActiveRecord::RecordInvalid,       with: :record_invalid
  # Missing required parameters in requests (400 Bad Request)
  rescue_from ActionController::ParameterMissing, with: :parameter_missing
  # Failed to destroy record (422 Unprocessable Entity)
  rescue_from ActiveRecord::RecordNotDestroyed,  with: :record_not_destroyed
  # Generic argument errors, e.g., invalid enum values (400 Bad Request)
  rescue_from ArgumentError,                    with: :argument_error

  private

  # ---------------------------------------------------------------------
  # Error Handlers
  # Each method constructs a JSON response with `success: false`,
  # an `error` code or message, optional `message` details, and
  # an appropriate HTTP status code.
  # ---------------------------------------------------------------------

  def record_not_found(exception)
    render json: {
      success: false,
      error:   'Record not found',    # Short code for error type
      message: exception.message     # Detailed exception message
    }, status: :not_found
  end

  def record_invalid(exception)
    render json: {
      success: false,
      error:   'Validation failed',                       # High-level error summary
      errors:  exception.record.errors.full_messages      # Array of validation errors
    }, status: :unprocessable_entity
  end

  def parameter_missing(exception)
    render json: {
      success: false,
      error:   'Missing parameter',  # Indicates which param is missing
      message: exception.message
    }, status: :bad_request
  end

  def record_not_destroyed(exception)
    render json: {
      success: false,
      error:   'Failed to delete record',  # Error when destroy returns false
      message: exception.message
    }, status: :unprocessable_entity
  end

  def argument_error(exception)
    render json: {
      success: false,
      error:   'Invalid argument',     # Generic invalid argument error
      message: exception.message
    }, status: :bad_request
  end

  # ---------------------------------------------------------------------
  # Response Helpers
  # Methods to standardize successful and error JSON responses
  # across all API controllers.
  # ---------------------------------------------------------------------

  # Render a successful response
  # @param data [Hash] Arbitrary data payload
  # @param message [String, nil] Optional success message
  # @param status [Symbol] HTTP status (default: :ok)
  def render_success(data = {}, message = nil, status = :ok)
    response = { success: true, data: data }
    response[:message] = message if message.present?
    render json: response, status: status
  end

  # Render an error response
  # @param message [String] Error summary
  # @param status [Symbol] HTTP status (default: :unprocessable_entity)
  # @param errors [Array] Optional list of detailed error messages
  def render_error(message, status = :unprocessable_entity, errors = [])
    render json: {
      success: false,
      error:   message,
      errors:  errors
    }, status: status
  end

  # ---------------------------------------------------------------------
  # Authentication Stubs
  # Placeholder methods for future authentication implementation.
  # ---------------------------------------------------------------------

  # Returns the currently authenticated user (stub)
  def current_user
    nil
  end

  # Enforce authentication before actions (stub)
  def authenticate_user!
    # To be implemented when authentication is added
  end
end
