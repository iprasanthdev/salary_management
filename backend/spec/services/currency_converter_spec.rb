# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CurrencyConverter do
  describe '.rate' do
    it 'returns 1.0 for USD' do
      expect(described_class.rate('USD')).to eq(1.0)
    end

    it 'returns correct rates for foreign currencies' do
      expect(described_class.rate('GBP')).to eq(1.28)
      expect(described_class.rate('EUR')).to eq(1.08)
      expect(described_class.rate('SGD')).to eq(0.74)
      expect(described_class.rate('INR')).to eq(0.012)
    end

    it 'handles case-insensitive codes' do
      expect(described_class.rate('gbp')).to eq(1.28)
    end
  end

  describe '.symbol' do
    it 'returns correct symbols' do
      expect(described_class.symbol('USD')).to eq('$')
      expect(described_class.symbol('GBP')).to eq('£')
      expect(described_class.symbol('EUR')).to eq('€')
      expect(described_class.symbol('INR')).to eq('₹')
      expect(described_class.symbol('SGD')).to eq('S$')
    end
  end

  describe '.to_usd' do
    it 'converts local currency amount to USD' do
      expect(described_class.to_usd(100_000, 'GBP')).to eq(128_000.0)
      expect(described_class.to_usd(100_000, 'EUR')).to eq(108_000.0)
      expect(described_class.to_usd(1_000_000, 'INR')).to eq(12_000.0)
      expect(described_class.to_usd(100_000, 'USD')).to eq(100_000.0)
    end
  end

  describe '.from_usd' do
    it 'converts USD to target currency' do
      expect(described_class.from_usd(128_000.0, 'GBP')).to eq(100_000.0)
      expect(described_class.from_usd(108_000.0, 'EUR')).to eq(100_000.0)
    end
  end

  describe '.sql_usd_expr' do
    it 'generates a valid SQL CASE expression' do
      expr = described_class.sql_usd_expr
      expect(expr).to include("WHEN 'USD' THEN 1.0")
      expect(expr).to include("WHEN 'GBP' THEN 1.28")
      expect(expr).to include("annual_salary")
    end
  end
end
