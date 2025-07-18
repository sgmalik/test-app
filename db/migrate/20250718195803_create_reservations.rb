class CreateReservations < ActiveRecord::Migration[8.0]
  def change
    create_table :reservations do |t|
      t.string :customer_name
      t.string :customer_email
      t.string :customer_phone
      t.integer :party_size
      t.datetime :reservation_date
      t.text :special_requests
      t.string :status

      t.timestamps
    end
  end
end
