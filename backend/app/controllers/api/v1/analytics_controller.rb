# frozen_string_literal: true

module Api
  module V1
    class AnalyticsController < ApplicationController
      def overview
        data = SalaryAnalyticsService.new(
          department: params[:department],
          country: params[:country],
          currency: params[:currency]
        ).call

        render json: data
      end
    end
  end
end
