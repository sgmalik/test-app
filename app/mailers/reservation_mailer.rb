# app/mailers/reservation_mailer.rb

# ---------------------------------------------------------------------
# ReservationMailer
#
# Sends reservation‐related emails (e.g. confirmation notices) to your
# customers. Inherits from ApplicationMailer, which sets up the default
# sender, layouts, etc.
# ---------------------------------------------------------------------
class ReservationMailer < ApplicationMailer
  # Default “from” header for all emails sent by this mailer
  default from: 'reservations@restaurantapp.com'  # fixed typo in domain

  # -------------------------------------------------------------------
  # confirmation_email
  #
  # @param reservation [Reservation] the reservation record just created
  # -------------------------------------------------------------------
  def confirmation_email(reservation)
    # Make reservation attributes available to your mailer views
    @reservation     = reservation                   # full reservation object
    @customer_name   = reservation.customer_name     # for greeting
    @reservation_time = reservation.reservation_date # for display in the view
    @party_size      = reservation.party_size        # for view logic
    @special_requests = reservation.special_requests # optional notes

    # Build and send the email. The `mail` method:
    #  • sets the “to” and “subject” headers
    #  • renders app/views/reservation_mailer/confirmation_email.(html|text).erb
    mail(
      to:      reservation.customer_email,            # recipient address
      subject: 'Reservation Confirmation — RestaurantApp'
    )
  end
end
