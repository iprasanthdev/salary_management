# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Employees', type: :request do
  describe 'GET /api/v1/employees' do
    before do
      create_list(:employee, 30, department: 'Engineering', country: 'United States')
      create(:employee, first_name: 'SpecialSearchName', department: 'Sales', country: 'Germany')
    end

    it 'returns paginated employees with metadata' do
      get '/api/v1/employees', params: { page: 1, per_page: 10 }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)

      expect(json[:employees].length).to eq(10)
      expect(json[:pagination][:current_page]).to eq(1)
      expect(json[:pagination][:per_page]).to eq(10)
      expect(json[:pagination][:total_count]).to eq(31)
      expect(json[:pagination][:total_pages]).to eq(4)
      expect(json[:filter_options][:departments]).to include('Engineering')
      expect(json[:filter_options][:countries]).to include('United States')
    end

    it 'filters by department' do
      get '/api/v1/employees', params: { department: 'Sales' }

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:pagination][:total_count]).to eq(1)
      expect(json[:employees].first[:first_name]).to eq('SpecialSearchName')
    end

    it 'filters by country' do
      get '/api/v1/employees', params: { country: 'Germany' }

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:pagination][:total_count]).to eq(1)
      expect(json[:employees].first[:country]).to eq('Germany')
    end

    it 'searches by name' do
      get '/api/v1/employees', params: { search: 'SpecialSearch' }

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:pagination][:total_count]).to eq(1)
      expect(json[:employees].first[:first_name]).to eq('SpecialSearchName')
    end
  end

  describe 'GET /api/v1/employees/:id' do
    let(:employee) { create(:employee) }

    it 'returns employee details' do
      get "/api/v1/employees/#{employee.id}"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:id]).to eq(employee.id)
      expect(json[:email]).to eq(employee.email)
      expect(json[:annual_salary_usd]).to eq(employee.annual_salary_usd)
    end

    it 'returns 404 for non-existent employee' do
      get '/api/v1/employees/999999'
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/employees' do
    let(:valid_params) do
      {
        employee: {
          first_name: 'Grace',
          last_name: 'Hopper',
          email: 'grace.hopper@acme.org',
          job_title: 'Distinguished Engineer',
          department: 'Engineering',
          country: 'United States',
          currency: 'USD',
          annual_salary: 210_000.0,
          joined_date: '2023-01-15'
        }
      }
    end

    it 'creates a new employee with valid parameters' do
      expect do
        post '/api/v1/employees', params: valid_params
      end.to change(Employee, :count).by(1)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:first_name]).to eq('Grace')
      expect(json[:annual_salary_usd]).to eq(210_000.0)
    end

    it 'returns 422 with invalid parameters' do
      post '/api/v1/employees', params: { employee: { first_name: '' } }

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:errors]).to be_present
    end
  end

  describe 'PATCH /api/v1/employees/:id' do
    let(:employee) { create(:employee, annual_salary: 100_000.0) }

    it 'updates employee compensation' do
      patch "/api/v1/employees/#{employee.id}", params: {
        employee: { annual_salary: 135_000.0, job_title: 'Lead Software Engineer' }
      }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:annual_salary].to_f).to eq(135_000.0)
      expect(json[:job_title]).to eq('Lead Software Engineer')
      expect(employee.reload.annual_salary).to eq(135_000.0)
    end

    it 'returns 422 for invalid updates' do
      patch "/api/v1/employees/#{employee.id}", params: {
        employee: { annual_salary: -50 }
      }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'DELETE /api/v1/employees/:id' do
    let!(:employee) { create(:employee) }

    it 'deletes the employee record' do
      expect do
        delete "/api/v1/employees/#{employee.id}"
      end.to change(Employee, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
