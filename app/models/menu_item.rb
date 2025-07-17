class MenuItem < ApplicationRecord
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :description, presence: true, length: { minimum: 10, maximum: 500 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :category, presence: true

  # Set default values for available items
  after_initialize :set_defaults

  # Scope available items
  scope :available, -> { where(available: true) }
  scope :by_category, ->(category) { where(category: category) if category.present? }

  # Categories for the dropdown
  CATEGORIES = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'].freeze

  private

  def set_defaults
    self.available = true if self.available.nil?
  end
end
