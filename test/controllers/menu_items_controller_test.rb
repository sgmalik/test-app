# test/controllers/api/v1/menu_items_controller_test.rb
# ---------------------------------------------------------------------
# Integration tests for the API::V1::MenuItemsController
#
# These tests simulate HTTP requests against our Rails API endpoints for
# menu items, verifying behavior both with and without authentication.
# We use built‑in fixtures for data setup and JWT tokens for simulating
# an authenticated admin user.
# ---------------------------------------------------------------------
require "test_helper"

class Api::V1::MenuItemsControllerTest < ActionDispatch::IntegrationTest
  # -------------------------------------------------------------------
  # setup
  # -------------------------------------------------------------------
  # Runs before each test. Loads a sample menu_item and an admin user
  # from fixtures, then generates a valid JWT for that admin.
  setup do
    # Load a menu item fixture (defined in test/fixtures/menu_items.yml)
    @menu_item  = menu_items(:one)

    # Load an admin user fixture (defined in test/fixtures/users.yml)
    @admin_user = users(:admin)

    # Generate a JWT containing the admin_user’s ID, to send in Authorization headers
    @token      = JwtService.encode(user_id: @admin_user.id)
  end

  # -------------------------------------------------------------------
  # test "should get index without authentication"
  # -------------------------------------------------------------------
  # Verifies that the index action is publicly accessible (no auth required)
  # and returns a successful JSON payload with a 'data' key containing the list.
  test "should get index without authentication" do
    # Perform GET /api/v1/menu_items.json
    get api_v1_menu_items_url, as: :json

    # Expect HTTP 200 OK
    assert_response :success

    # Ensure the JSON response includes a 'data' key (the serialized items)
    assert_not_nil response.parsed_body['data']
  end

  # -------------------------------------------------------------------
  # test "should create menu_item with authentication"
  # -------------------------------------------------------------------
  # Ensures that a valid POST to create a menu item succeeds when
  # a correct JWT is provided, and that the record count increases.
  test "should create menu_item with authentication" do
    # Expect the MenuItem count to increase by 1
    assert_difference('MenuItem.count') do
      post api_v1_menu_items_url,
           params: {
             menu_item: {
               name:        "Test Item",
               description: "A test menu item description",
               price:       12.99,
               category:    "Appetizers",
               available:   true
             }
           },
           headers: { Authorization: "Bearer #{@token}" },
           as: :json
    end

    # Expect HTTP 201 Created
    assert_response :created

    # Verify that the JSON response’s data.attributes.name equals the name we sent
    returned_name = response.parsed_body['data']['attributes']['name']
    assert_equal "Test Item", returned_name
  end

  # -------------------------------------------------------------------
  # test "should not create menu_item without authentication"
  # -------------------------------------------------------------------
  # Confirms that POSTing without a valid JWT returns 401 Unauthorized
  # and does not change the MenuItem count.
  test "should not create menu_item without authentication" do
    # Expect no change in MenuItem count
    assert_no_difference('MenuItem.count') do
      post api_v1_menu_items_url,
           params: {
             menu_item: {
               name:        "Test Item",
               description: "A test menu item description",
               price:       12.99,
               category:    "Appetizers",
               available:   true
             }
           },
           as: :json
    end

    # Expect HTTP 401 Unauthorized
    assert_response :unauthorized
  end

  # -------------------------------------------------------------------
  # test "should show menu_item"
  # -------------------------------------------------------------------
  # Verifies that GET /api/v1/menu_items/:id works without authentication
  # and returns the correct item data.
  test "should show menu_item" do
    get api_v1_menu_item_url(@menu_item), as: :json

    # Expect HTTP 200 OK
    assert_response :success

    # The returned JSON must include the same name as our fixture
    returned_name = response.parsed_body['data']['attributes']['name']
    assert_equal @menu_item.name, returned_name
  end

  # -------------------------------------------------------------------
  # test "should update menu_item with authentication"
  # -------------------------------------------------------------------
  # Ensures that PATCHing an existing item with a valid JWT updates
  # the record and returns HTTP 200.
  test "should update menu_item with authentication" do
    patch api_v1_menu_item_url(@menu_item),
          params: {
            menu_item: { name: "Updated Name" }
          },
          headers: { Authorization: "Bearer #{@token}" },
          as: :json

    # Expect HTTP 200 OK
    assert_response :success

    # Confirm that the JSON response reflects the updated name
    returned_name = response.parsed_body['data']['attributes']['name']
    assert_equal "Updated Name", returned_name
  end

  # -------------------------------------------------------------------
  # test "should destroy menu_item with authentication"
  # -------------------------------------------------------------------
  # Checks that DELETE /api/v1/menu_items/:id with a valid JWT
  # removes the record and returns HTTP 200.
  test "should destroy menu_item with authentication" do
    # Expect the MenuItem count to decrease by 1
    assert_difference('MenuItem.count', -1) do
      delete api_v1_menu_item_url(@menu_item),
             headers: { Authorization: "Bearer #{@token}" },
             as: :json
    end

    # Expect HTTP 200 OK
    assert_response :success
  end
end
