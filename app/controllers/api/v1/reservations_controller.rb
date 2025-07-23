
# app/controllers/api/v1/reservations_controller.rb
# ------------------------------------------------------
# Controller managing RESTful actions for Reservation resources
# within the API v1 namespace. Handles listing, retrieval, creation,
# updating, deletion, and status transitions (confirm/cancel).
class Api::V1::ReservationsController < Api::V1::BaseController
  include ApiValidation
  before_action :validate_pagination_params, only: [:index]
  before_action :validate_date_params, only: [:index]
  # Load the reservation record for single-resource actions
  before_action :set_reservation, only: [:show, :update, :destroy, :confirm, :cancel]

  # ---------------------------------------------------------------------
  # GET /api/v1/reservations
  # Retrieve a list of reservations with optional filtering, date ranges,
  # and pagination.
  # ---------------------------------------------------------------------
  def index
    # Start with all reservations ordered chronologically by date
    reservations = Reservation.all.order(:reservation_date)

    # --- Status Filtering ---
    # Filter by specific status if valid (e.g., pending, confirmed)
    if params[:status].present? && Reservation::STATUSES.include?(params[:status])
      reservations = reservations.where(status: params[:status])
    end

    # --- Single Date Filtering ---
    # If a single `date` param is provided, parse and filter to that day
    if params[:date].present?
      date = Date.parse(params[:date]) rescue nil
      if date
        # Range from start to end of the provided date
        reservations = reservations.where(
          reservation_date: date.beginning_of_day..date.end_of_day
        )
      end
    end

    # --- Customer Email Filtering ---
    if params[:customer_email].present?
      reservations = reservations.where(customer_email: params[:customer_email])
    end

    # --- Date Range Filtering ---
    # Supports `start_date` and `end_date` to get multi-day ranges
    if params[:start_date].present? && params[:end_date].present?
      start_date = Date.parse(params[:start_date]) rescue nil
      end_date   = Date.parse(params[:end_date])   rescue nil
      if start_date && end_date
        reservations = reservations.where(
          reservation_date: start_date.beginning_of_day..end_date.end_of_day
        )
      end
    end

    # -------------------------------------------------------------------
    # Pagination
    # -------------------------------------------------------------------
    page     = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    # Cap page size to prevent overload
    per_page = [per_page, 100].min
    total_count = reservations.count

    # Apply limit and offset based on page parameters
    reservations = reservations.limit(per_page).offset((page - 1) * per_page)

    # -------------------------------------------------------------------
    # Serialization and Response
    # -------------------------------------------------------------------
    serialized = ReservationSerializer.new(reservations, serializer_params).serializable_hash
    render json: {
      data: serialized[:data],
      meta: {
        total_count: total_count,
        page:        page,
        per_page:    per_page,
        statuses:    Reservation::STATUSES  # Possible status values
      }
    }
  end

  # ---------------------------------------------------------------------
  # GET /api/v1/reservations/:id
  # Fetch a single reservation by its ID
  # ---------------------------------------------------------------------
  def show
    serialized = ReservationSerializer.new(@reservation, serializer_params).serializable_hash
    render json: { data: serialized[:data] }
  end

  # ---------------------------------------------------------------------
  # POST /api/v1/reservations
  # Create a new reservation and send a confirmation email
  # ---------------------------------------------------------------------
  def create
    reservation = Reservation.new(reservation_params)
    if reservation.save
      # Attempt to send confirmation email; log failures without blocking response
      begin
        ReservationMailer.confirmation(reservation).deliver_now
      rescue => e
        Rails.logger.error "Failed to send confirmation email: #{e.message}"
      end

      serialized = ReservationSerializer.new(reservation, serializer_params).serializable_hash
      render json: {
        data:    serialized[:data],
        message: 'Reservation created successfully. Confirmation email sent.'
      }, status: :created
    else
      render_error('Failed to create reservation', :unprocessable_entity, reservation.errors.full_messages)
    end
  end

  # ---------------------------------------------------------------------
  # PUT/PATCH /api/v1/reservations/:id
  # Update reservation details
  # ---------------------------------------------------------------------
  def update
    if @reservation.update(reservation_params)
      serialized = ReservationSerializer.new(@reservation, serializer_params).serializable_hash
      render json: {
        data:    serialized[:data],
        message: 'Reservation updated successfully'
      }
    else
      render_error('Failed to update reservation', :unprocessable_entity, @reservation.errors.full_messages)
    end
  end

  # ---------------------------------------------------------------------
  # DELETE /api/v1/reservations/:id
  # Permanently remove a reservation record
  # ---------------------------------------------------------------------
  def destroy
    if @reservation.destroy
      render json: { message: 'Reservation cancelled successfully' }
    else
      render_error('Failed to cancel reservation')
    end
  end

  # ---------------------------------------------------------------------
  # POST /api/v1/reservations/:id/confirm
  # Transition reservation status to 'confirmed'
  # ---------------------------------------------------------------------
  def confirm
    if @reservation.update(status: 'confirmed')
      serialized = ReservationSerializer.new(@reservation, serializer_params).serializable_hash
      render json: {
        data:    serialized[:data],
        message: 'Reservation confirmed successfully'
      }
    else
      render_error('Failed to confirm reservation', :unprocessable_entity, @reservation.errors.full_messages)
    end
  end

  # ---------------------------------------------------------------------
  # POST /api/v1/reservations/:id/cancel
  # Cancel a reservation if business rules allow
  # ---------------------------------------------------------------------
  def cancel
    if @reservation.can_be_cancelled?
      if @reservation.update(status: 'cancelled')
        serialized = ReservationSerializer.new(@reservation, serializer_params).serializable_hash
        render json: {
          data:    serialized[:data],
          message: 'Reservation cancelled successfully'
        }
      else
        render_error('Failed to cancel reservation', :unprocessable_entity, @reservation.errors.full_messages)
      end
    else
      render_error('This reservation cannot be cancelled', :unprocessable_entity)
    end
  end

  private

  # ---------------------------------------------------------------------
  # Callback: set_reservation
  # Find Reservation by ID or raise a RecordNotFound error
  # ---------------------------------------------------------------------
  def set_reservation
    @reservation = Reservation.find(params[:id])
  end

  # ---------------------------------------------------------------------
  # Strong Parameters: reservation_params
  # Whitelist allowed attributes to prevent mass-assignment issues
  # ---------------------------------------------------------------------
  def reservation_params
    params.require(:reservation).permit(
      :customer_name,
      :customer_email,
      :customer_phone,
      :party_size,
      :reservation_date,
      :special_requests
    )
  end

  # ---------------------------------------------------------------------
  # Context for serializers
  # Pass in current_user and flags for conditional fields
  # ---------------------------------------------------------------------
  def serializer_params
    {
      params: {
        current_user:        current_user,
        show_sensitive_data: true  # Temporarily allow all sensitive data
      }
    }
  end
end
