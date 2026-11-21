# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SalaryAnalyticsService do
  describe '#call' do
    context 'when no employees exist' do
      it 'returns zeroed summary safely without errors' do
        result = described_class.new.call
        expect(result[:summary][:total_employees]).to eq(0)
        expect(result[:summary][:total_payroll_usd]).to eq(0.0)
        expect(result[:summary][:average_salary_usd]).to eq(0.0)
        expect(result[:summary][:median_salary_usd]).to eq(0.0)
        expect(result[:department_breakdown]).to be_empty
        expect(result[:country_breakdown]).to be_empty
      end
    end

    context 'with employees across countries and departments' do
      before do
        # US (USD rate 1.0)
        create(:employee, department: 'Engineering', country: 'United States', currency: 'USD', annual_salary: 100_000)
        create(:employee, department: 'Engineering', country: 'United States', currency: 'USD', annual_salary: 200_000)

        # UK (GBP rate 1.28) => 100,000 * 1.28 = 128,000 USD
        create(:employee, :uk, department: 'Sales', country: 'United Kingdom', currency: 'GBP', annual_salary: 100_000)

        # Germany (EUR rate 1.08) => 50,000 * 1.08 = 54,000 USD
        create(:employee, :germany, department: 'Human Resources', country: 'Germany', currency: 'EUR', annual_salary: 50_000)
      end

      it 'calculates overall summary KPIs correctly' do
        result = described_class.new.call
        summary = result[:summary]

        expect(summary[:total_employees]).to eq(4)
        # Total: 100k + 200k + 128k + 54k = 482,000 USD
        expect(summary[:total_payroll_usd]).to eq(482_000.0)
        # Average: 482,000 / 4 = 120,500 USD
        expect(summary[:average_salary_usd]).to eq(120_500.0)
        # Salaries sorted USD: [54k, 100k, 128k, 200k] => median = (100k + 128k) / 2 = 114,000
        expect(summary[:median_salary_usd]).to eq(114_000.0)
        expect(summary[:min_salary_usd]).to eq(54_000.0)
        expect(summary[:max_salary_usd]).to eq(200_000.0)
      end

      it 'calculates department breakdown accurately' do
        result = described_class.new.call
        dept_breakdown = result[:department_breakdown]

        eng = dept_breakdown.find { |d| d[:department] == 'Engineering' }
        expect(eng).not_to be_nil
        expect(eng[:headcount]).to eq(2)
        expect(eng[:total_payroll_usd]).to eq(300_000.0)
        expect(eng[:average_salary_usd]).to eq(150_000.0)
        expect(eng[:min_salary_usd]).to eq(100_000.0)
        expect(eng[:max_salary_usd]).to eq(200_000.0)

        sales = dept_breakdown.find { |d| d[:department] == 'Sales' }
        expect(sales[:headcount]).to eq(1)
        expect(sales[:total_payroll_usd]).to eq(128_000.0)
      end

      it 'calculates country breakdown accurately' do
        result = described_class.new.call
        country_breakdown = result[:country_breakdown]

        us = country_breakdown.find { |c| c[:country] == 'United States' }
        expect(us[:headcount]).to eq(2)
        expect(us[:total_payroll_usd]).to eq(300_000.0)
        expect(us[:currency]).to eq('USD')

        uk = country_breakdown.find { |c| c[:country] == 'United Kingdom' }
        expect(uk[:headcount]).to eq(1)
        expect(uk[:total_payroll_usd]).to eq(128_000.0)
        expect(uk[:currency]).to eq('GBP')
      end

      it 'populates salary bands correctly' do
        result = described_class.new.call
        bands = result[:salary_bands]
        # Sal USD: 54k ($50k-$100k), 100k ($100k-$150k), 128k ($100k-$150k), 200k ($200k+)
        expect(bands).to be_an(Array)
        band_50_100 = bands.find { |b| b[:range] == '$50k - $100k' }
        expect(band_50_100[:count]).to eq(1)

        band_100_150 = bands.find { |b| b[:range] == '$100k - $150k' }
        expect(band_100_150[:count]).to eq(2)

        band_200_plus = bands.find { |b| b[:range] == '$200k+' }
        expect(band_200_plus[:count]).to eq(1)
      end

      it 'supports filtering by department' do
        result = described_class.new(department: 'Engineering').call
        expect(result[:summary][:total_employees]).to eq(2)
        expect(result[:summary][:total_payroll_usd]).to eq(300_000.0)
      end

      it 'supports filtering by country' do
        result = described_class.new(country: 'United Kingdom').call
        expect(result[:summary][:total_employees]).to eq(1)
        expect(result[:summary][:total_payroll_usd]).to eq(128_000.0)
      end
    end
  end
end
