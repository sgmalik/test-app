# app/controllers/concerns/api_validation.rb
# ----------------------------------------------------------------------
# A shared concern that provides methods to validate common API
# request parameters such as pagination and date filters. Controllers
# can include this module and call these methods before actions to
# ensure inputs are well-formed and return meaningful errors.
# ----------------------------------------------------------------------
module ApiValidation
  # Use ActiveSupport::Concern to structure this module as a Rails concern
  extend ActiveSupport::Concern

  # --------------------------------------------------------------------
  # Private methods only; not intended to be public API of controllers
  # --------------------------------------------------------------------
  private

  # --------------------------------------------------------------------
  # validate_pagination_params
  # --------------------------------------------------------------------
  # Ensures that pagination parameters `page` and `per_page` are
  # valid integers within acceptable ranges. If invalid, renders a
  # JSON error response and halts further processing.
  # @return [Boolean] true if parameters are valid; false otherwise
  def validate_pagination_params
    # Convert `params[:page]` to an integer. If it’s nil or non-numeric,
    # the safe navigation (`&.`) returns nil and we fall back to 1.
    page = params[:page]&.to_i || 1

    # Convert `params[:per_page]` to an integer, defaulting to 20.
    per_page = params[:per_page]&.to_i || 20

    # ------------------------------------------------------------------
    # Validate `page`
    # ------------------------------------------------------------------
    # The page number must be 1 or greater; pages start at 1.
    if page < 1
      # Render a standardized error JSON and return false to halt.
      render_error('Page must be greater than 0', :bad_request)
      return false
    end

    # ------------------------------------------------------------------
    # Validate `per_page`
    # ------------------------------------------------------------------
    # Enforce reasonable limits: at least 1 item per page, and
    # no more than 100 items to avoid overloading the server.
    if per_page < 1 || per_page > 100
      render_error('Per page must be between 1 and 100', :bad_request)
      return false
    end

    # If both checks pass, return true so the controller can proceed.
    true
  end

  # --------------------------------------------------------------------
  # validate_date_params
  # --------------------------------------------------------------------
  # Checks date-related query parameters for correct formatting and
  # logical ordering. Supports a single `date` filter or a range
  # using `start_date` and `end_date`.
  # @return [Boolean] true if all supplied dates are valid; false otherwise
  def validate_date_params
    # ------------------------------------------------------------------
    # Single-date validation
    # ------------------------------------------------------------------
    # If the client passed `params[:date]`, attempt to parse it.
    if params[:date].present?
      begin
        # Date.parse will raise ArgumentError if format incorrect
        Date.parse(params[:date])
      rescue ArgumentError
        # Inform client of expected format
        render_error('Invalid date format. Use YYYY-MM-DD', :bad_request)
        return false
      end
    end

    # ------------------------------------------------------------------
    # Date-range validation
    # ------------------------------------------------------------------
    # Only proceed if both range endpoints are provided
    if params[:start_date].present? && params[:end_date].present?
      begin
        start_date = Date.parse(params[:start_date])
        end_date   = Date.parse(params[:end_date])

        # Ensure the start date is not after the end date
        if start_date > end_date
          render_error('Start date must be before end date', :bad_request)
          return false
        end
      rescue ArgumentError
        # One or both dates failed to parse
        render_error('Invalid date format. Use YYYY-MM-DD', :bad_request)
        return false
      end
    end

    # All provided date validations passed successfully
    true
  end
end
