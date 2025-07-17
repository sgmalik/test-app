class MenuItemsController < ApplicationController
  # ensure menu_item is set before doing any action
  before_action :set_menu_item, only: [:show, :edit, :update, :destroy]

  # GET /menu_items
  def index
    @menu_items = MenuItem.all
    @categories = MenuItem::CATEGORIES

    # Filter by category if provided
    if params[:category].present?
      @menu_items = @menu_items.by_category(params[:category])
    end

    # Filter by availability if provided
    if params[:available] == 'true'
      @menu_items = @menu_items.available
    end
  end

  # GET /menu_items/1
  def show
  end

  # GET /menu_items/new
  def new
    @menu_item = MenuItem.new
  end

  # GET /menu_items/1/edit
  def edit
  end

  # POST /menu_items
  def create
    @menu_item = MenuItem.new(menu_item_params)

    if @menu_item.save
      redirect_to @menu_item, notice: 'Menu item was successfully created.'
    else
      render :new
    end
  end

  # PATCH/PUT /menu_items/1
  def update
    if @menu_item.update(menu_item_params)
      redirect_to @menu_item, notice: 'Menu item was successfully updated.'
    else
      render :edit
    end
  end

  # DELETE /menu_items/1
  def destroy
    @menu_item.destroy
    redirect_to menu_items_url, notice: 'Menu item was successfully destroyed.'
  end
  
  private

  def set_menu_item
    @menu_item = MenuItem.find(params[:id])
  end

  def menu_item_params
    params.require(:menu_item).permit(:name, :description, :price, :category, :available)
  end

  # Handles all CRUD operations for the menu items
  # index: List all menu items with optional filtering by category and availability
  # show: Display a single menu item
  # new: Render form for creating a new menu item
  # create: Handle the creation of a new menu item and save it to the database
  # edit: Render form for editing an existing menu item
  # update: Handle the update of an existing menu item
  # destroy: Handle the deletion of a menu item

end
