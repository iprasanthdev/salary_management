# frozen_string_literal: true

class SalaryAnalyticsService
  USD_SALARY_EXPR = <<~SQL.squish
    (annual_salary * (CASE currency
      WHEN 'USD' THEN 1.0
      WHEN 'GBP' THEN 1.28
      WHEN 'EUR' THEN 1.08
      WHEN 'SGD' THEN 0.74
      WHEN 'INR' THEN 0.012
      ELSE 1.0
    END))
  SQL

  BAND_EXPR = <<~SQL.squish
    CASE
      WHEN #{USD_SALARY_EXPR} < 50000 THEN '< $50k'
      WHEN #{USD_SALARY_EXPR} < 100000 THEN '$50k - $100k'
      WHEN #{USD_SALARY_EXPR} < 150000 THEN '$100k - $150k'
      WHEN #{USD_SALARY_EXPR} < 200000 THEN '$150k - $200k'
      ELSE '$200k+'
    END
  SQL

  STANDARD_BANDS = [
    '< $50k',
    '$50k - $100k',
    '$100k - $150k',
    '$150k - $200k',
    '$200k+'
  ].freeze

  def initialize(department: nil, country: nil)
    @department = department
    @country = country
  end

  def call
    scope = Employee.all
    scope = scope.where(department: @department) if @department.present?
    scope = scope.where(country: @country) if @country.present?

    total_employees = scope.count

    if total_employees.zero?
      return {
        summary: empty_summary,
        department_breakdown: [],
        country_breakdown: [],
        salary_bands: empty_bands
      }
    end

    total_payroll_usd = scope.sum(Arel.sql(USD_SALARY_EXPR)).to_f.round(2)
    avg_salary_usd = (total_payroll_usd / total_employees).round(2)
    median_salary_usd = calculate_median(scope, total_employees)
    min_salary_usd = scope.minimum(Arel.sql(USD_SALARY_EXPR)).to_f.round(2)
    max_salary_usd = scope.maximum(Arel.sql(USD_SALARY_EXPR)).to_f.round(2)

    {
      summary: {
        total_employees: total_employees,
        total_payroll_usd: total_payroll_usd,
        average_salary_usd: avg_salary_usd,
        median_salary_usd: median_salary_usd,
        min_salary_usd: min_salary_usd,
        max_salary_usd: max_salary_usd
      },
      department_breakdown: calculate_department_breakdown(scope),
      country_breakdown: calculate_country_breakdown(scope),
      salary_bands: calculate_salary_bands(scope, total_employees)
    }
  end

  private

  def calculate_median(scope, count)
    return 0.0 if count.zero?

    offset = (count - 1) / 2
    if count.odd?
      val = scope.order(Arel.sql(USD_SALARY_EXPR)).offset(offset).limit(1).pick(Arel.sql(USD_SALARY_EXPR))
      val.to_f.round(2)
    else
      vals = scope.order(Arel.sql(USD_SALARY_EXPR)).offset(offset).limit(2).pluck(Arel.sql(USD_SALARY_EXPR))
      (vals.sum.to_f / 2.0).round(2)
    end
  end

  def calculate_department_breakdown(scope)
    rows = scope.group(:department).pluck(
      :department,
      Arel.sql('COUNT(*)'),
      Arel.sql("SUM(#{USD_SALARY_EXPR})"),
      Arel.sql("MIN(#{USD_SALARY_EXPR})"),
      Arel.sql("MAX(#{USD_SALARY_EXPR})")
    )

    rows.map do |dept, headcount, total_usd, min_usd, max_usd|
      total_f = total_usd.to_f.round(2)
      avg_f = headcount.positive? ? (total_f / headcount).round(2) : 0.0
      {
        department: dept,
        headcount: headcount,
        total_payroll_usd: total_f,
        average_salary_usd: avg_f,
        min_salary_usd: min_usd.to_f.round(2),
        max_salary_usd: max_usd.to_f.round(2)
      }
    end.sort_by { |d| -d[:total_payroll_usd] }
  end

  def calculate_country_breakdown(scope)
    rows = scope.group(:country, :currency).pluck(
      :country,
      :currency,
      Arel.sql('COUNT(*)'),
      Arel.sql("SUM(#{USD_SALARY_EXPR})"),
      Arel.sql('AVG(annual_salary)')
    )

    rows.map do |country, currency, headcount, total_usd, avg_local|
      total_f = total_usd.to_f.round(2)
      avg_f = headcount.positive? ? (total_f / headcount).round(2) : 0.0
      {
        country: country,
        currency: currency,
        headcount: headcount,
        total_payroll_usd: total_f,
        average_salary_usd: avg_f,
        average_salary_local: avg_local.to_f.round(2)
      }
    end.sort_by { |c| -c[:headcount] }
  end

  def calculate_salary_bands(scope, total_employees)
    counts = scope.group(Arel.sql(BAND_EXPR)).count

    STANDARD_BANDS.map do |band|
      count = counts[band] || 0
      percentage = total_employees.positive? ? ((count.to_f / total_employees) * 100).round(1) : 0.0
      {
        range: band,
        count: count,
        percentage: percentage
      }
    end
  end

  def empty_summary
    {
      total_employees: 0,
      total_payroll_usd: 0.0,
      average_salary_usd: 0.0,
      median_salary_usd: 0.0,
      min_salary_usd: 0.0,
      max_salary_usd: 0.0
    }
  end

  def empty_bands
    STANDARD_BANDS.map do |band|
      { range: band, count: 0, percentage: 0.0 }
    end
  end
end
