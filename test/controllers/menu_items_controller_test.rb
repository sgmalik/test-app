require "test_helper"

class MenuItemsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get menu_items_index_url
    assert_response :success
  end
end
