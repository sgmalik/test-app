class Reservation < ApplicationRecord
  validates :customer_name, presence: true, length: { minimum: 2, maximum:
100 }
  validates :customer_email, presence: true, format: { with:
URI::MailTo::EMAIL_REGEXP }
  validates :customer_phone, presence: true
  validates :party_size, presence: true, numericality: { greater_than: 0,
less_than_or_equal_to: 12 }
  validates :reservation_date, presence: true
  validates :status, presence: true
  # Validate that reservation is in the future
  validate :reservation_must_be_in_future
  validate :reservation_during_business_hours
  # Status options
  STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'].freeze
  validates :status, inclusion: { in: STATUSES }
  # Set default status
  after_initialize :set_defaults
  # Scopes for different statuses
  scope :pending, -> { where(status: 'pending') }
  scope :confirmed, -> { where(status: 'confirmed') }
  scope :upcoming, -> { where('reservation_date > ?', Time.current) }
  scope :today, -> { where(reservation_date:
Date.current.beginning_of_day..Date.current.end_of_day) }
  # Business hours (5 PM to 10 PM)
  OPENING_HOUR = 17  # 5 PM
  CLOSING_HOUR = 22  # 10 PM
  def formatted_date
    reservation_date.strftime("%B %d, %Y at %I:%M %p")
end
  def can_be_cancelled?
    pending? && reservation_date > 2.hours.from_now
end
  def pending?
    status == 'pending'
end
  def confirmed?
    status == 'confirmed'
end
private
  def set_defaults
    self.status = 'pending' if self.status.nil?
end
  def reservation_must_be_in_future
    return unless reservation_date.present?
    if reservation_date <= Time.current
      errors.add(:reservation_date, "must be in the future")
end end
  def reservation_during_business_hours
    return unless reservation_date.present?
    hour = reservation_date.hour
    if hour < OPENING_HOUR || hour >= CLOSING_HOUR
      errors.add(:reservation_date, "must be between #{OPENING_HOUR}:00 and #
{CLOSING_HOUR}:00")
end end
end
