# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Analytics', type: :request do
  describe 'GET /api/v1/analytics/overview' do
    before do
      create(:employee, department: 'Engineering', country: 'United States', annual_salary: 100_000)
      create(:employee, :uk, department: 'Sales', country: 'United Kingdom', annual_salary: 80_000)
    end

    it 'returns http success and correct schema' do
      get '/api/v1/analytics/overview'

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)

      expect(json).to have_key(:summary)
      expect(json[:summary][:total_employees]).to eq(2)
      expect(json[:summary][:total_payroll_usd]).to be > 0
      expect(json).to have_key(:department_breakdown)
      expect(json).to have_key(:country_breakdown)
      expect(json).to have_key(:salary_bands)
    end

    it 'respects department filter' do
      get '/api/v1/analytics/overview', params: { department: 'Engineering' }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:summary][:total_employees]).to eq(1)
    end

    it 'respects country filter' do
      get '/api/v1/analytics/overview', params: { country: 'United Kingdom' }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:summary][:total_employees]).to eq(1)
    end
  end
end
