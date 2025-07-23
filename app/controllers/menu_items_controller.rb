# app/controllers/menu_items_controller.rb

class MenuItemsController < ApplicationController
  # --------------------------------------------------------------------------
  # ERROR HANDLING FOR JSON
  # --------------------------------------------------------------------------
  # If a record lookup fails (e.g. MenuItem.find), catch it and return
  # a JSON 404 response rather than raising.
  rescue_from ActiveRecord::RecordNotFound, with: :json_record_not_found

  # Before show/edit/update/destroy, load @menu_item or trigger the above rescue.
  before_action :set_menu_item, only: %i[show edit update destroy]

  # GET /menu_items
  # • HTML: render the standard ERB view
  # • JSON:   return { success, data: { menu_items, categories }, meta? }
  def index
    # Load everything, then apply optional filters
    @menu_items = MenuItem.all
    @categories = MenuItem::CATEGORIES

    # Filter by category if requested
    if params[:category].present?
      @menu_items = @menu_items.by_category(params[:category])
    end

    # Filter by availability if requested
    if params[:available] == 'true'
      @menu_items = @menu_items.available
    end

    respond_to do |format|
      format.html   # renders app/views/menu_items/index.html.erb
      format.json do
        # Build our JSON payload under a 'data' key
        payload = {
          menu_items: @menu_items.map { |item| menu_item_json(item) },
          categories: @categories
        }

        # You can also include metadata (e.g. total count)
        meta = { total: @menu_items.size }

        # Render success envelope
        render_success(payload, meta: meta)
      end
    end
  end

  # GET /menu_items/:id
  # Show one item
  def show
    respond_to do |format|
      format.html
      format.json { render_success(menu_item_json(@menu_item)) }
    end
  end

  # POST /menu_items
  # Create a new record from form or JSON body
  def create
    @menu_item = MenuItem.new(menu_item_params)

    if @menu_item.save
      respond_to do |format|
        format.html do
          redirect_to @menu_item, notice: 'Menu item was successfully created.'
        end

        format.json do
          # status: :created translates to HTTP 201
          render_success(menu_item_json(@menu_item), status: :created)
        end
      end
    else
      respond_to do |format|
        format.html { render :new } 

        format.json do
          # Return errors in our envelope
          render_error(
            'Validation failed',
            status: :unprocessable_entity,
            errors: @menu_item.errors.full_messages
          )
        end
      end
    end
  end

  # PATCH/PUT /menu_items/:id
  # Update an existing record
  def update
    if @menu_item.update(menu_item_params)
      respond_to do |format|
        format.html do
          redirect_to @menu_item, notice: 'Menu item was successfully updated.'
        end

        format.json do
          render_success(menu_item_json(@menu_item))
        end
      end
    else
      respond_to do |format|
        format.html { render :edit }

        format.json do
          render_error(
            'Validation failed',
            status: :unprocessable_entity,
            errors: @menu_item.errors.full_messages
          )
        end
      end
    end
  end

  # DELETE /menu_items/:id
  # Destroy a record
  def destroy
    @menu_item.destroy

    respond_to do |format|
      format.html do
        redirect_to menu_items_url, notice: 'Menu item was successfully deleted.'
      end

      format.json do
        # HTTP 204 No Content, with our success envelope (no data)
        render_success({}, status: :no_content)
      end
    end
  end

  private

  # --------------------------------------------------------------------------
  # CALLBACKS
  # --------------------------------------------------------------------------

  # Load the MenuItem or trigger rescue_from
  def set_menu_item
    @menu_item = MenuItem.find(params[:id])
  end

  # Strong parameters: only allow listed attributes from the client
  def menu_item_params
    params.require(:menu_item).permit(
      :name,
      :description,
      :price,
      :category,
      :available
    )
  end

  # --------------------------------------------------------------------------
  # SERIALIZATION HELPERS
  # --------------------------------------------------------------------------

  # Turn a MenuItem into a plain hash for JSON.
  def menu_item_json(item)
    {
      id:          item.id,
      name:        item.name,
      description: item.description,
      price:       item.price.to_f,               # ensure number, not BigDecimal
      category:    item.category,
      available:   item.available,
      created_at:  item.created_at.iso8601,       # standard timestamp format
      updated_at:  item.updated_at.iso8601
    }
  end

  # --------------------------------------------------------------------------
  # JSON RENDERING HELPERS
  # These wrap every JSON response in a consistent envelope:
  #   { success: Boolean, data: <payload>, meta?: <info>, error?: <msg>, errors?: <list> }
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
  # JSON ERROR HANDLERS
  # Called by rescue_from above
  # --------------------------------------------------------------------------

  def json_record_not_found(exception)
    render_error(
      'Record not found',
      status: :not_found,
      errors: [exception.message]
    )
  end
end
