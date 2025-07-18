class ReservationsController < ApplicationController
  # ───────────────────────────────────────────────────────────────────────
  # 1. Callback to load @reservation for any “member” actions
  # ───────────────────────────────────────────────────────────────────────
  before_action :set_reservation,
                only: [:show, :edit, :update, :destroy, :confirm, :cancel]
  #  ^^^^^^^^^^^^^^^
  # :set_reservation is a private method (below) that runs *before* the listed
  # actions. It finds the single Reservation record based on params[:id] and
  # assigns it to @reservation, making it available in the action and view.

  # ───────────────────────────────────────────────────────────────────────
  # 2. GET /reservations
  # ───────────────────────────────────────────────────────────────────────
  def index
    # Load *all* reservations, sorted by reservation_date ascending
    @reservations = Reservation.all.order(:reservation_date)

    # — Filter by status if params[:status] is present *and* valid
    if params[:status].present? &&
       Reservation::STATUSES.include?(params[:status])
      # Chains a WHERE clause on the existing relation
      @reservations = @reservations.where(status: params[:status])
    end

    # — Filter by a specific date if params[:date] is present
    if params[:date].present?
      # Try parsing the user‑supplied date; if it fails, date == nil
      date = Date.parse(params[:date]) rescue nil
      if date
        # Restrict reservation_date to that full day
        @reservations = @reservations.where(
          reservation_date: date.beginning_of_day..date.end_of_day
        )
      end
    end

    # At this point @reservations is an ActiveRecord::Relation that
    # may be filtered by status and/or date.
  end

  # ───────────────────────────────────────────────────────────────────────
  # 3. GET /reservations/:id
  # ───────────────────────────────────────────────────────────────────────
  def show
    # Empty because set_reservation already loaded @reservation.
    # Rails will implicitly render app/views/reservations/show.html.erb.
  end

  # ───────────────────────────────────────────────────────────────────────
  # 4. GET /reservations/new
  # ───────────────────────────────────────────────────────────────────────
  def new
    @reservation = Reservation.new
    # Pre‑set a default reservation_date: tomorrow at 7pm
    @reservation.reservation_date =
      1.day.from_now.change(hour: 19, min: 0)
  end

  # ───────────────────────────────────────────────────────────────────────
  # 5. POST /reservations
  # ───────────────────────────────────────────────────────────────────────
  def create
    # Build a new Reservation using only the safe params (see reservation_params)
    @reservation = Reservation.new(reservation_params)

    if @reservation.save
      # Synchronously send a confirmation email; rescue nil so errors here
      # don’t break the user flow
      ReservationMailer.confirmation(@reservation).deliver_now rescue nil

      # Redirect to the #show page for this reservation
      redirect_to @reservation,
                  notice: 'Your reservation has been submitted!
                           We will confirm it shortly.'
    else
      # Validation failed—@reservation.errors is populated—and re‑render form
      render :new
    end
  end

  # ───────────────────────────────────────────────────────────────────────
  # 6. GET /reservations/:id/edit
  # ───────────────────────────────────────────────────────────────────────
  def edit
    # Empty: @reservation is already loaded. Rails will render edit.html.erb.
  end

  # ───────────────────────────────────────────────────────────────────────
  # 7. PATCH/PUT /reservations/:id
  # ───────────────────────────────────────────────────────────────────────
  def update
    if @reservation.update(reservation_params)
      # On success, redirect back to the show page
      redirect_to @reservation,
                  notice: 'Reservation was successfully updated.'
    else
      # On validation failure, re‑render the edit form
      render :edit
    end
  end

  # ───────────────────────────────────────────────────────────────────────
  # 8. DELETE /reservations/:id
  # ───────────────────────────────────────────────────────────────────────
  def destroy
    @reservation.destroy
    # After deletion, go back to the list of all reservations
    redirect_to reservations_url,
                notice: 'Reservation was cancelled.'
  end

  # ───────────────────────────────────────────────────────────────────────
  # 9. Custom Member Action: confirm
  #    PUT/PATCH /reservations/:id/confirm
  # ───────────────────────────────────────────────────────────────────────
  def confirm
    # Directly flip the status to “confirmed” (no validation)
    @reservation.update(status: 'confirmed')
    redirect_to @reservation, notice: 'Reservation confirmed!'
  end

  # ───────────────────────────────────────────────────────────────────────
  # 10. Custom Member Action: cancel
  #     PUT/PATCH /reservations/:id/cancel
  # ───────────────────────────────────────────────────────────────────────
  def cancel
    # Assumes your Reservation model defines #can_be_cancelled?
    if @reservation.can_be_cancelled?
      @reservation.update(status: 'cancelled')
      redirect_to reservations_path, notice: 'Reservation cancelled.'
    else
      # If business logic forbids cancellation, show an alert
      redirect_to @reservation,
                  alert: 'This reservation cannot be cancelled.'
    end
  end

  # ───────────────────────────────────────────────────────────────────────
  # 11. Private Helpers
  # ───────────────────────────────────────────────────────────────────────
  private

  # Loads the single record based on the URL :id
  def set_reservation
    @reservation = Reservation.find(params[:id])
    # params[:id] is pulled from the route /reservations/:id
  end

  # Strong‐parameters: whitelist only these form fields for mass assignment
  def reservation_params
    params.require(:reservation)
          .permit( :customer_name,
                   :customer_email,
                   :customer_phone,
                   :party_size,
                   :reservation_date,
                   :special_requests )
    # If any of these are missing or extra keys are present, Rails will: 
    #  - raise ParameterMissing if the top‐level :reservation key is absent
    #  - silently ignore any keys not explicitly permitted
  end
end
