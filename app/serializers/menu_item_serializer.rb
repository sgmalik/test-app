# app/serializers/menu_item_serializer.rb
# ------------------------------------------------------
# Serializer for the MenuItem model using the JSON:API specification.
# Leverages the JSONAPI::Serializer DSL to define which attributes
# and custom fields are exposed in API responses.
class MenuItemSerializer
  # Include the JSONAPI::Serializer module to gain access to the `attributes`
  # and `attribute` class methods, which define the serialized schema.
  include JSONAPI::Serializer

  # ---------------------------------------------------------------------
  # Standard Attributes
  # ---------------------------------------------------------------------
  # These attributes are serialized directly as key/value pairs from the model.
  attributes :name,        # String: The display name of the menu item
             :description, # String: A brief description or summary of the dish
             :category,    # String: Classification (e.g., 'Appetizer', 'Entree')
             :available,   # Boolean: Availability status in the menu
             :created_at,  # DateTime: Timestamp when the record was created
             :updated_at   # DateTime: Timestamp when the record was last modified

  # ---------------------------------------------------------------------
  # Custom Attributes
  # ---------------------------------------------------------------------
  # Define fields that require custom computation or formatting.

  # 1) Raw numeric price
  # Converts the stored price (e.g., BigDecimal) into a Ruby Float
  # to ensure JSON consumers receive a standard numeric type.
  attribute :price do |menu_item|
    # menu_item.price may be BigDecimal or String; enforce Float here.
    menu_item.price.to_f
  end

  # 2) Human-readable formatted price
  # Provides a currency-formatted string (e.g., "$12.50") for display purposes.
  attribute :formatted_price do |menu_item|
    # sprintf('%.2f') ensures two decimal places, even for whole-dollar amounts.
    "$#{sprintf('%.2f', menu_item.price)}"
  end

  # ---------------------------------------------------------------------
  # Conditional Attributes
  # ---------------------------------------------------------------------
  # Attributes that are only included under specific conditions,
  # such as user permissions or custom request parameters.

  # Admin-only internal notes
  # This block will run only if the `:current_user` param is provided
  # and responds true to `admin?`. Otherwise, `admin_notes` is omitted.
  attribute :admin_notes, if: Proc.new { |record, params|
    # Params should be a Hash including :current_user; guard against nil.
    params && params[:current_user]&.admin?
  } do |menu_item|
    # Example placeholder text; in a real app, you might pull notes from a DB field.
    "Internal notes for #{menu_item.name}"
  end
end
