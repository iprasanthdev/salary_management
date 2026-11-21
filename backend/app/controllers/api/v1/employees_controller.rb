# frozen_string_literal: true

module Api
  module V1
    class EmployeesController < ApplicationController
      before_action :set_employee, only: %i[show update destroy]

      rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

      def index
        page = [params[:page].to_i, 1].max
        per_page = params[:per_page].present? ? [[params[:per_page].to_i, 1].max, 100].min : 25

        scope = Employee.all
        scope = scope.by_department(params[:department]) if params[:department].present?
        scope = scope.by_country(params[:country]) if params[:country].present?
        scope = scope.search(params[:search]) if params[:search].present?
        scope = scope.sorted_by(params[:sort_by], params[:sort_order])

        total_count = scope.count
        total_pages = total_count.positive? ? (total_count.to_f / per_page).ceil : 1
        employees = scope.offset((page - 1) * per_page).limit(per_page)

        render json: {
          employees: employees.map { |e| employee_payload(e) },
          pagination: {
            current_page: page,
            per_page: per_page,
            total_pages: total_pages,
            total_count: total_count
          },
          filter_options: {
            departments: Employee::DEPARTMENTS,
            countries: Employee::COUNTRIES
          }
        }
      end

      def show
        render json: employee_payload(@employee)
      end

      def create
        @employee = Employee.new(employee_params)
        if @employee.save
          render json: employee_payload(@employee), status: :created
        else
          render json: { errors: @employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @employee.update(employee_params)
          render json: employee_payload(@employee), status: :ok
        else
          render json: { errors: @employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @employee.destroy
        head :no_content
      end

      private

      def set_employee
        @employee = Employee.find(params[:id])
      end

      def record_not_found
        render json: { error: 'Employee not found' }, status: :not_found
      end

      def employee_params
        params.require(:employee).permit(
          :first_name,
          :last_name,
          :email,
          :job_title,
          :department,
          :country,
          :currency,
          :annual_salary,
          :joined_date
        )
      end

      def employee_payload(employee)
        employee.as_json.merge(
          'full_name' => employee.full_name,
          'annual_salary_usd' => employee.annual_salary_usd
        )
      end
    end
  end
end
