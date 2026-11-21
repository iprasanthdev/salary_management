Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get "analytics/overview", to: "analytics#overview"
      resources :employees
    end
  end
end
