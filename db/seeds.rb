# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Clear existing data in the menu_items table 
MenuItem.destroy_all
# Create sample menu items
 MenuItem.create!([
  {
    name: "Bruschetta Trio",
    description: "Three varieties of our signature bruschetta with fresh
tomatoes, herbs, and cheese",
    price: 12.99,
    category: "Appetizers",
    available: true
}, {
    name: "Calamari Fritti",
    description: "Crispy fried squid rings served with marinara sauce and
lemon",
    price: 14.99,
    category: "Appetizers",
    available: true
}, {
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan cheese, croutons, and
our house Caesar dressing",
    price: 11.99,
    category: "Appetizers",
    available: true
}, {
    name: "Spaghetti Carbonara",
    description: "Classic Roman pasta with eggs, cheese, pancetta, and black
pepper",
    price: 18.99,
    category: "Main Courses",
    available: true
}, {
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with seasonal vegetables and lemon
butter sauce",
    price: 24.99,
    category: "Main Courses",
    available: true
}, {
    name: "Chicken Parmigiana",
    description: "Breaded chicken breast topped with marinara sauce and
melted mozzarella",
    price: 21.99,
    category: "Main Courses",
    available: true

}, {
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers and
mascarpone cream",
    price: 8.99,
    category: "Desserts",
    available: true
}, {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with
vanilla ice cream",
    price: 9.99,
    category: "Desserts",
    available: false
}, {
    name: "House Wine",
    description: "Selection of red and white wines from local vineyards",
    price: 7.99,
    category: "Beverages",
    available: true
}, {
    name: "Craft Beer",
    description: "Rotating selection of local craft beers on tap",
    price: 5.99,
    category: "Beverages",
    available: true
} ])
puts "Created #{MenuItem.count} menu items"

 
