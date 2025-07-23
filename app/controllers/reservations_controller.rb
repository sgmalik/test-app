# app/controllers/reservations_controller.rb

class ReservationsController < ApplicationController
  # --------------------------------------------------------------------------
  # ERROR HANDLING FOR JSON
  # --------------------------------------------------------------------------
  rescue_from ActiveRecord::RecordNotFound, with: :json_record_not_found

  # Load @reservation for these actions
  before_action :set_reservation, only: %i[show edit update destroy confirm cancel]

  # GET /reservations
  # • HTML: standard view
  # • JSON: { success, data: { reservations, statuses }, meta? }
  def index
    @reservations = Reservation.all.order(:reservation_date)

    # Filter by status param if it's one of the allowed STATUSES
    if params[:status].present? && Reservation::STATUSES.include?(params[:status])
      @reservations = @reservations.where(status: params[:status])
    end

    # Filter by exact date if parseable
    if params[:date].present?
      date = Date.parse(params[:date]) rescue nil
      if date
        @reservations = @reservations.where(
          reservation_date: date.beginning_of_day..date.end_of_day
        )
      end
    end

    respond_to do |format|
      format.html
      format.json do
        payload = {
          reservations: @reservations.map { |r| reservation_json(r) },
          statuses:     Reservation::STATUSES
        }
        meta = { total: @reservations.size }

        render_success(payload, meta: meta)
      end
    end
  end

  # GET /reservations/:id
  def show
    respond_to do |format|
      format.html
      format.json { render_success(reservation_json(@reservation)) }
    end
  end

  # POST /reservations
  def create
    @reservation = Reservation.new(reservation_params)

    if @reservation.save
      # Fire off a confirmation email (fail silently if mail errors)
      ReservationMailer.confirmation(@reservation).deliver_now rescue nil

      respond_to do |format|
        format.html do
          redirect_to @reservation, notice: 'Your reservation has been submitted! We will confirm it shortly.'
        end

        format.json do
          render_success(
            reservation_json(@reservation),
            status: :created
          )
        end
      end
    else
      respond_to do |format|
        format.html { render :new }
        format.json do
          render_error(
            'Validation failed',
            status: :unprocessable_entity,
            errors: @reservation.errors.full_messages
          )
        end
      end
    end
  end

  # PATCH/PUT /reservations/:id
  def update
    if @reservation.update(reservation_params)
      respond_to do |format|
        format.html do
          redirect_to @reservation, notice: 'Reservation was successfully updated.'
        end

        format.json do
          render_success(reservation_json(@reservation))
        end
      end
    else
      respond_to do |format|
        format.html { render :edit }
        format.json do
          render_error(
            'Validation failed',
            status: :unprocessable_entity,
            errors: @reservation.errors.full_messages
          )
        end
      end
    end
  end

  # DELETE /reservations/:id
  def destroy
    @reservation.destroy

    respond_to do |format|
      format.html { redirect_to reservations_url, notice: 'Reservation was cancelled.' }
      format.json { render_success({}, status: :no_content) }
    end
  end

  # PUT/PATCH /reservations/:id/confirm
  def confirm
    @reservation.update(status: 'confirmed')

    respond_to do |format|
      format.html { redirect_to @reservation, notice: 'Reservation confirmed!' }
      format.json { render_success(reservation_json(@reservation)) }
    end
  end

  # PUT/PATCH /reservations/:id/cancel
  def cancel
    if @reservation.can_be_cancelled?
      @reservation.update(status: 'cancelled')

      respond_to do |format|
        format.html { redirect_to reservations_path, notice: 'Reservation cancelled.' }
        format.json { render_success(reservation_json(@reservation)) }
      end
    else
      respond_to do |format|
        format.html { redirect_to @reservation, alert: 'This reservation cannot be cancelled.' }
        format.json do
          render_error(
            'Cannot cancel reservation',
            status: :unprocessable_entity,
            errors: ['This reservation is not eligible for cancellation']
          )
        end
      end
    end
  end

  private

  # --------------------------------------------------------------------------
  # CALLBACKS
  # --------------------------------------------------------------------------

  def set_reservation
    @reservation = Reservation.find(params[:id])
  end

  def reservation_params
    params.require(:reservation).permit(
      :customer_name,
      :customer_email,
      :customer_phone,
      :special_requests
    )
  end

  # --------------------------------------------------------------------------
  # SERIALIZATION HELPER
  # --------------------------------------------------------------------------

  def reservation_json(reservation)
    {
      id:               reservation.id,
      customer_name:    reservation.customer_name,
      customer_email:   reservation.customer_email,
      customer_phone:   reservation.customer_phone,
      party_size:       reservation.party_size,
      reservation_date: reservation.reservation_date.iso8601,
      formatted_date:   reservation.formatted_date,
      special_requests: reservation.special_requests,
      status:           reservation.status,
      can_be_cancelled: reservation.can_be_cancelled?,
      created_at:       reservation.created_at.iso8601,
      updated_at:       reservation.updated_at.iso8601
    }
  end

  # --------------------------------------------------------------------------
  # JSON RENDERING HELPERS
  # --------------------------------------------------------------------------

  def render_success(data = {}, status: :ok, meta: nil)
    envelope = { success: true, data: data }
    envelope[:meta] = meta if meta
    render json: envelope, status: status
  end

  def render_error(message, status: :unprocessable_entity, errors: [])
    render json: {
      success: false,
      error:   message,
      errors:  errors
    }, status: status
  end

  # --------------------------------------------------------------------------
  # JSON ERROR HANDLER
  # --------------------------------------------------------------------------

  def json_record_not_found(exception)
    render_error(
      'Record not found',
      status: :not_found,
      errors: [exception.message]
    )
  end
end
