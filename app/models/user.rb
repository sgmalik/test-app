# app/models/user.rb
# ---------------------------------------------------------------------
# User model
#
# Represents a user of the system, with authentication, roles, and
# validations to ensure data integrity.
# ---------------------------------------------------------------------
class User < ApplicationRecord
  # -------------------------------------------------------------------
  # Authentication
  # -------------------------------------------------------------------
  # Adds methods to set and authenticate against a BCrypt password.
  # Requires the model to have a `password_digest` column.
  # Provides:
  #   • virtual `password` and `password_confirmation` attributes
  #   • `authenticate` instance method
  has_secure_password

  # -------------------------------------------------------------------
  # Validations
  # -------------------------------------------------------------------
  # Ensure email is present, unique, and in a valid email format.
  validates :email,
            presence: true,
            uniqueness: true,
            format: { with: URI::MailTo::EMAIL_REGEXP }

  # Ensure password is at least 6 characters when creating a new record
  # or when a password value is provided (e.g. on update).
  validates :password,
            length: { minimum: 6 },
            if: -> { new_record? || !password.nil? }

  # Ensure role is one of the allowed values: 'admin', 'staff', or 'customer'
  validates :role,
            inclusion: { in: %w[admin staff customer] }

  # -------------------------------------------------------------------
  # Callbacks
  # -------------------------------------------------------------------
  # Before validating (on create or update), ensure a default role is set
  # if none was provided. This guarantees every user has a valid role.
  before_validation :set_default_role

  # -------------------------------------------------------------------
  # Scopes
  # -------------------------------------------------------------------
  # Easily retrieve subsets of users based on role.

  # All users with role 'admin'
  scope :admins, -> { where(role: 'admin') }

  # All users with role 'staff' or 'admin' (staff includes admins)
  scope :staff,  -> { where(role: %w[admin staff]) }

  # -------------------------------------------------------------------
  # Instance Methods
  # -------------------------------------------------------------------

  # Returns true if the user's role is 'admin'
  def admin?
    role == 'admin'
  end

  # Returns true if the user's role is 'staff' or 'admin'
  def staff?
    %w[admin staff].include?(role)
  end

  private

  # -------------------------------------------------------------------
  # Callback Helper
  # -------------------------------------------------------------------
  # Sets the default role to 'customer' if none was specified.
  def set_default_role
    self.role ||= 'customer'
  end
end
