class Employee < ApplicationRecord
  DEPARTMENTS = [
    'Engineering',
    'Product',
    'Sales',
    'Marketing',
    'Human Resources',
    'Finance',
    'Operations'
  ].freeze

  COUNTRIES = [
    'United States',
    'United Kingdom',
    'Germany',
    'India',
    'Singapore'
  ].freeze

  CURRENCIES = %w[USD GBP EUR INR SGD].freeze

  EXCHANGE_RATES = {
    'USD' => 1.0,
    'GBP' => 1.28,
    'EUR' => 1.08,
    'SGD' => 0.74,
    'INR' => 0.012
  }.freeze

  validates :first_name, :last_name, :email, :job_title, :department, :country, :currency, :joined_date, presence: true
  validates :email, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP, message: 'is invalid' }
  validates :annual_salary, presence: true, numericality: { greater_than: 0 }
  validates :department, inclusion: { in: DEPARTMENTS, message: 'is not a valid department' }
  validates :country, inclusion: { in: COUNTRIES, message: 'is not a valid country' }
  validates :currency, inclusion: { in: CURRENCIES, message: 'is not a valid currency' }

  scope :by_department, ->(dept) { where(department: dept) if dept.present? }
  scope :by_country, ->(cntry) { where(country: cntry) if cntry.present? }
  scope :search, lambda { |query|
    return all if query.blank?

    term = "%#{query.strip.downcase}%"
    where(
      'LOWER(first_name) LIKE :term OR LOWER(last_name) LIKE :term OR LOWER(email) LIKE :term OR LOWER(job_title) LIKE :term',
      term: term
    )
  }

  scope :sorted_by, lambda { |field, direction = 'asc'|
    dir = direction.to_s.downcase == 'desc' ? :desc : :asc
    case field.to_s
    when 'name'
      order(first_name: dir, last_name: dir)
    when 'annual_salary'
      order(annual_salary: dir)
    when 'department'
      order(department: dir)
    when 'country'
      order(country: dir)
    when 'joined_date'
      order(joined_date: dir)
    else
      order(id: :desc)
    end
  }

  def full_name
    "#{first_name} #{last_name}"
  end

  def annual_salary_usd
    CurrencyConverter.to_usd(annual_salary, currency)
  end
end
