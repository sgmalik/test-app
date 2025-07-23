# app/serializers/reservation_serializer.rb
# ------------------------------------------------------
# Serializer for the Reservation model following the JSON:API spec.
# Uses JSONAPI::Serializer to define which fields and custom logic
# appear in API responses for reservation resources.
class ReservationSerializer
  # ---------------------------------------------------------------------
  # Include core serialization methods
  # ---------------------------------------------------------------------
  # Adds `attributes` and `attribute` class methods for defining the
  # serialized schema.
  include JSONAPI::Serializer

  # ---------------------------------------------------------------------
  # Standard Attributes
  # ---------------------------------------------------------------------
  # Simple key/value pairs mapped directly from the model’s fields.
  attributes :customer_name,    # String: Full name of the customer making the reservation
             :customer_email,   # String: Customer’s contact email address
             :customer_phone,   # String: Customer’s phone number (may be conditional)
             :party_size,       # Integer: Number of guests in the reservation
             :special_requests, # String: Any additional requests (e.g., "window seat")
             :status,           # String: Current reservation status (e.g., "pending", "confirmed")
             :created_at,       # DateTime: When the reservation record was created
             :updated_at        # DateTime: When the reservation record was last updated

  # ---------------------------------------------------------------------
  # Custom Date Formatting
  # ---------------------------------------------------------------------
  # These attributes demonstrate how to transform model data before exposing it.

  # 1) ISO-8601 compatible raw reservation date
  # Converts the model’s Date or DateTime into a standardized string.
  attribute :reservation_date do |reservation|
    # reservation.reservation_date => Date or Time object
    reservation.reservation_date.iso8601
  end

  # 2) Human-friendly formatted date
  # Delegates to a model method or presenter for custom display formatting.
  attribute :formatted_date do |reservation|
    # `formatted_date` could be defined on the model (e.g., "Thu, Jul 23, 2025 at 7:00 PM")
    reservation.formatted_date
  end

  # ---------------------------------------------------------------------
  # Business Logic Attributes
  # ---------------------------------------------------------------------
  # Attributes reflecting computed state or decisions based on domain rules.

  # Can this reservation still be cancelled?
  # Returns a Boolean based on business rules (e.g., cutoff time restrictions).
  attribute :can_be_cancelled do |reservation|
    reservation.can_be_cancelled?
  end

  # Is the reservation currently pending approval?
  attribute :is_pending do |reservation|
    reservation.pending?
  end

  # Has the reservation been confirmed?
  attribute :is_confirmed do |reservation|
    reservation.confirmed?
  end

  # ---------------------------------------------------------------------
  # Conditional Attributes for Sensitive Data
  # ---------------------------------------------------------------------
  # Only include certain fields when the user has permission or flags are set.

  attribute :customer_phone, if: Proc.new { |record, params|
    # Show phone number only if:
    # 1) `:current_user` param exists and is an admin
    # OR
    # 2) A `:show_sensitive_data` flag is passed in params
    params && (params[:current_user]&.admin? || params[:show_sensitive_data])
  }
end
