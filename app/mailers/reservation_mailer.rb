class ReservationMailer < ApplicationMailer
  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.reservation_mailer.confirmation.subject
  #

  default from: 'reservations@restarauntapp.com'

  def confirmation
    @reseration = reservation
    @customer_name = reservation.customer_name

    mail (
      to: reservation.customer_email,
      subject: 'Reservation Confirmation - RestarauntApp'
    )
  end
end
