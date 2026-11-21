FactoryBot.define do
  factory :employee do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    sequence(:email) { |n| "employee#{n}@acme.org" }
    job_title { "Software Engineer" }
    department { "Engineering" }
    country { "United States" }
    currency { "USD" }
    annual_salary { 120_000.00 }
    joined_date { Date.current - rand(30..1500).days }

    trait :uk do
      country { "United Kingdom" }
      currency { "GBP" }
      annual_salary { 75_000.00 }
    end

    trait :germany do
      country { "Germany" }
      currency { "EUR" }
      annual_salary { 85_000.00 }
    end

    trait :india do
      country { "India" }
      currency { "INR" }
      annual_salary { 2_400_000.00 }
    end

    trait :singapore do
      country { "Singapore" }
      currency { "SGD" }
      annual_salary { 110_000.00 }
    end
  end
end
