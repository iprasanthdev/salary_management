class CreateEmployees < ActiveRecord::Migration[8.0]
  def change
    create_table :employees do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :job_title, null: false
      t.string :department, null: false
      t.string :country, null: false
      t.string :currency, limit: 3, null: false
      t.decimal :annual_salary, precision: 12, scale: 2, null: false
      t.date :joined_date, null: false

      t.timestamps
    end

    add_index :employees, :email, unique: true
    add_index :employees, :department
    add_index :employees, :country
    add_index :employees, :annual_salary
    add_index :employees, [:last_name, :first_name]
  end
end
