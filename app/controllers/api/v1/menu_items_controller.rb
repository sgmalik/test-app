# app/controllers/api/v1/menu_items_controller.rb
# ------------------------------------------------------
# Controller responsible for handling RESTful actions on MenuItem resources
# within the API v1 namespace. Supports filtering, sorting, pagination,
# and uses JSONAPI-compliant serialization.
class Api::V1::MenuItemsController < Api::V1::BaseController
  include ApiValidation
  before_action :authenticate_user!, except: [:index, :show]
  before_action :validate_pagination_params, only: [:index]
  # Load the menu item for actions that operate on a single record
  before_action :set_menu_item, only: [:show, :update, :destroy]

  # ---------------------------------------------------------------------
  # GET /api/v1/menu_items
  # Fetches a collection of menu items with optional filters, sorting, and pagination
  # ---------------------------------------------------------------------
  def index
    # Start with all menu items
    menu_items = MenuItem.all

    # --- Filtering ---
    # Filter by category if provided (e.g., ?category=Appetizer)
    if params[:category].present?
      menu_items = menu_items.by_category(params[:category])
    end

    # Filter by availability flag if explicitly set to 'true' (e.g., ?available=true)
    if params[:available] == 'true'
      menu_items = menu_items.available
    end

    # --- Sorting ---
    # Sort based on `sort` param: name, price, or category (with name as secondary)
    menu_items = case params[:sort]
                 when 'name'
                   menu_items.order(:name)
                 when 'price'
                   menu_items.order(:price)
                 when 'category'
                   menu_items.order(:category, :name)
                 else
                   # Default ordering: grouped by category, then alphabetical by name
                   menu_items.order(:category, :name)
                 end

    # --- Pagination ---
    # Convert page/per_page to integers with sensible defaults
    page     = params[:page]&.to_i.presence || 1
    per_page = params[:per_page]&.to_i.presence || 20
    # Enforce an upper limit on per_page to prevent excessive load
    per_page = [per_page, 100].min
    offset   = (page - 1) * per_page

    # Apply limit/offset
    menu_items = menu_items.limit(per_page).offset(offset)

    # --- Serialization ---
    # Pass current_user context for conditional fields (e.g., admin_notes)
    serialized = MenuItemSerializer.new(menu_items, serializer_params).serializable_hash

    # --- Response ---
    render json: {
      data: serialized[:data],
      meta: {
        total_count: MenuItem.count,
        page:        page,
        per_page:    per_page,
        categories:  MenuItem::CATEGORIES  # Reference to allowed category values
      }
    }
  end

  # ---------------------------------------------------------------------
  # GET /api/v1/menu_items/:id
  # Retrieve a single menu item by ID
  # ---------------------------------------------------------------------
  def show
    serialized = MenuItemSerializer.new(@menu_item, serializer_params).serializable_hash
    render json: { data: serialized[:data] }
  end

  # ---------------------------------------------------------------------
  # POST /api/v1/menu_items
  # Create a new menu item record
  # ---------------------------------------------------------------------
  def create
    menu_item = MenuItem.new(menu_item_params)
    if menu_item.save
      serialized = MenuItemSerializer.new(menu_item, serializer_params).serializable_hash
      render json: {
        data:    serialized[:data],
        message: 'Menu item created successfully'
      }, status: :created
    else
      # Use BaseController's error helper to render validation failures
      render_error('Failed to create menu item', :unprocessable_entity, menu_item.errors.full_messages)
    end
  end

  # ---------------------------------------------------------------------
  # PUT/PATCH /api/v1/menu_items/:id
  # Update an existing menu item
  # ---------------------------------------------------------------------
  def update
    if @menu_item.update(menu_item_params)
      serialized = MenuItemSerializer.new(@menu_item, serializer_params).serializable_hash
      render json: {
        data:    serialized[:data],
        message: 'Menu item updated successfully'
      }
    else
      render_error('Failed to update menu item', :unprocessable_entity, @menu_item.errors.full_messages)
    end
  end

  # ---------------------------------------------------------------------
  # DELETE /api/v1/menu_items/:id
  # Remove a menu item from the system
  # ---------------------------------------------------------------------
  def destroy
    if @menu_item.destroy
      render json: { message: 'Menu item deleted successfully' }
    else
      render_error('Failed to delete menu item')
    end
  end

  private

  # ---------------------------------------------------------------------
  # Callback: set_menu_item
  # Finds the MenuItem by ID and assigns it to @menu_item.
  # Raises ActiveRecord::RecordNotFound if not found (handled by BaseController).
  # ---------------------------------------------------------------------
  def set_menu_item
    @menu_item = MenuItem.find(params[:id])
  end

  # ---------------------------------------------------------------------
  # Strong Parameters: menu_item_params
  # Whitelists allowed attributes for create/update actions to prevent
  # mass-assignment vulnerabilities.
  # ---------------------------------------------------------------------
  def menu_item_params
    params.require(:menu_item).permit(
      :name,
      :description,
      :price,
      :category,
      :available
    )
  end

  # ---------------------------------------------------------------------
  # Context parameters for serializers
  # Provides additional context (e.g., current_user) to conditional fields.
  # ---------------------------------------------------------------------
  def serializer_params
    {
      params: {
        current_user: current_user
      }
    }
  end
end
