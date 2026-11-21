# frozen_string_literal: true

# CurrencyConverter encapsulates all multi-currency exchange rates,
# symbols, calculations, and SQL conversion expressions.
#
# Adheres to Single Responsibility Principle (SRP) by decoupling currency logic
# from ActiveRecord models and analytical reporting services.
class CurrencyConverter
  RATES = {
    'USD' => 1.0,
    'GBP' => 1.28,
    'EUR' => 1.08,
    'SGD' => 0.74,
    'INR' => 0.012
  }.freeze

  SYMBOLS = {
    'USD' => '$',
    'GBP' => '£',
    'EUR' => '€',
    'SGD' => 'S$',
    'INR' => '₹'
  }.freeze

  def self.rate(currency)
    RATES[currency.to_s.upcase] || 1.0
  end

  def self.symbol(currency)
    SYMBOLS[currency.to_s.upcase] || '$'
  end

  def self.to_usd(amount, currency)
    return 0.0 if amount.nil?

    (amount.to_f * rate(currency)).round(2)
  end

  def self.from_usd(usd_amount, target_currency)
    return 0.0 if usd_amount.nil?

    r = rate(target_currency)
    r.positive? ? (usd_amount.to_f / r).round(2) : 0.0
  end

  def self.sql_usd_expr(column = 'annual_salary', currency_column = 'currency')
    cases = RATES.map { |curr, r| "WHEN '#{curr}' THEN #{r}" }.join(' ')
    "(#{column} * (CASE #{currency_column} #{cases} ELSE 1.0 END))"
  end
end
