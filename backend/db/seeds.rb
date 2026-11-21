# frozen_string_literal: true

require 'benchmark'

puts '== ACME Employee Salary Management - High-Performance Seeding =='
puts 'Target: 10,000 realistic employees across 5 countries and 7 departments'

# Reset existing data
Employee.delete_all

COUNTRIES_CONFIG = {
  'United States' => {
    currency: 'USD',
    weight: 0.35,
    min_salary: 65_000,
    max_salary: 240_000
  },
  'United Kingdom' => {
    currency: 'GBP',
    weight: 0.18,
    min_salary: 45_000,
    max_salary: 145_000
  },
  'Germany' => {
    currency: 'EUR',
    weight: 0.17,
    min_salary: 50_000,
    max_salary: 150_000
  },
  'India' => {
    currency: 'INR',
    weight: 0.20,
    min_salary: 1_200_000,
    max_salary: 7_500_000
  },
  'Singapore' => {
    currency: 'SGD',
    weight: 0.10,
    min_salary: 70_000,
    max_salary: 210_000
  }
}.freeze

DEPARTMENT_ROLES = {
  'Engineering' => [
    'Junior Software Engineer',
    'Software Engineer',
    'Senior Software Engineer',
    'Staff Software Engineer',
    'Principal Engineer',
    'Engineering Manager',
    'QA Automation Engineer',
    'DevOps / SRE Specialist'
  ],
  'Product' => [
    'Associate Product Manager',
    'Product Manager',
    'Senior Product Manager',
    'Lead Product Manager',
    'Product Designer',
    'Senior UI/UX Designer'
  ],
  'Sales' => [
    'Sales Development Rep',
    'Account Executive',
    'Senior Account Executive',
    'Enterprise Account Executive',
    'Sales Director',
    'Customer Success Manager'
  ],
  'Marketing' => [
    'Marketing Specialist',
    'Content Strategist',
    'Growth Marketing Manager',
    'Product Marketing Manager',
    'Brand Director'
  ],
  'Human Resources' => [
    'HR Coordinator',
    'Technical Recruiter',
    'Senior Recruiter',
    'HR Generalist',
    'People Operations Manager',
    'Director of Talent'
  ],
  'Finance' => [
    'Financial Analyst',
    'Senior Financial Analyst',
    'Payroll Specialist',
    'Staff Accountant',
    'Finance Manager',
    'Controller'
  ],
  'Operations' => [
    'Operations Coordinator',
    'Business Operations Analyst',
    'IT Support Specialist',
    'Systems Administrator',
    'Director of Operations'
  ]
}.freeze

FIRST_NAMES = %w[
  James Mary John Patricia Robert Jennifer Michael Linda William Elizabeth
  David Barbara Richard Susan Joseph Jessica Thomas Sarah Charles Karen
  Daniel Nancy Matthew Lisa Anthony Betty Mark Margaret Donald Sandra
  Steven Ashley Paul Kimberly Andrew Emily Joshua Donna Kenneth Michelle
  Kevin Carol Brian Amanda George Melissa Edward Deborah Ronald Stephanie
  Timothy Rebecca Jason Laura Jeffrey Sharon Ryan Cynthia Jacob Kathleen
  Gary Amy Nicholas Shirley Eric Angela Jonathan Helen Stephen Anna
  Larry Brenda Justin Pamela Scott Nicole Brandon Samantha Benjamin Katherine
  Samuel Christine Gregory Debra Alexander Rachel Patrick Carolyn Frank Janet
  Raymond Catherine Jack Maria Dennis Heather Jerry Diane Tyler Julie
  Aaron Joyce Jose Victoria Henry Kelly Adam Christina Douglas Joan
  Nathan Evelyn Peter Lauren Zachary Judith Kyle Megan Walter Cheryl
  Harold Andrea Jeremy Hannah Ethan Martha Carl Jacqueline Keith Frances
  Roger Gloria Gerald Ann Christian Teresa Terry Kathryn Sean Sara
  Arthur Janice Austin Julia Noah Abigail Lawrence Grace Jesse Judy
  Joe Amber Bryan Danielle Billy Beverly Jordan Denise Albert Marilyn
  Dylan Amber Gabriel Diana Bruce Brittany Logan Madison Willie Beverly
  Alan Joyce Ralph Alice Eugene Doris Roy Cheryl Vincent Hannah
  Wayne Julia Ralph Martha Randy Jacqueline Johnny Gloria Bobby Teresa
  Russell Sara Bradley Janice Philip Kathryn Eugene Judy Harry Denise
  Arun Priya Rahul Neha Vikram Ananya Amit Pooja Suresh Swati
  Rajesh Sneha Deepak Divya Sanjay Kavita Vivek Ritu Manoj Deepa
  Klaus Sabine Hans Petra Wolfgang Birgit Stefan Ursula Andreas Monika
  Oliver Emma Harry Olivia Jack Emily Charlie Jessica George Sophie
  Liam Charlotte Noah Amelia Oliver Harper Elijah Evelyn James Sophia
  Wei Mei Jun Li Hui Yan Jie Fang Ting Min
].freeze

LAST_NAMES = %w[
  Smith Johnson Williams Brown Jones Garcia Miller Davis Rodriguez Martinez
  Hernandez Lopez Gonzalez Wilson Anderson Thomas Taylor Moore Jackson Martin
  Lee Perez Thompson White Harris Sanchez Clark Ramirez Lewis Robinson
  Walker Young Allen King Wright Scott Torres Nguyen Hill Flores
  Green Adams Nelson Baker Hall Rivera Campbell Mitchell Carter Roberts
  Gomez Phillips Evans Turner Diaz Parker Cruz Edwards Collins Reyes
  Stewart Morris Morales Murphy Cook Rogers Gutierrez Ortiz Morgan Cooper
  Peterson Bailey Reed Kelly Howard Ramos Kim Cox Ward Richardson
  Watson Brooks Chavez Wood James Bennett Gray Mendoza Ruiz Hughes
  Price Alvarez Castillo Sanders Patel Myers Long Ross Foster Stoddard
  Sharma Verma Gupta Kapoor Singh Rao Reddy Nair Joshi Deshmukh
  Müller Schmidt Schneider Fischer Weber Meyer Wagner Becker Schulz Hoffmann
  Davies Evans Taylor Wilson Thomas Roberts Clarke Hall Robinson Clarke
  Tan Lim Lee Ng Ong Goh Wong Koh Chua Teo
].freeze

TOTAL_RECORDS = 10_000
BATCH_SIZE = 2_000

now = Time.current
start_date = Date.new(2020, 1, 1)
end_date = Date.current

puts "Generating #{TOTAL_RECORDS} employee records..."

time_taken = Benchmark.realtime do
  departments = DEPARTMENT_ROLES.keys
  department_weights = [0.35, 0.10, 0.20, 0.10, 0.08, 0.09, 0.08]

  # Country distribution cumulative array
  country_entries = COUNTRIES_CONFIG.to_a

  records = []

  (1..TOTAL_RECORDS).each do |i|
    # Weighted department pick
    r_dept = rand
    dept_index = 0
    cumulative_d = 0.0
    department_weights.each_with_index do |w, idx|
      cumulative_d += w
      if r_dept <= cumulative_d
        dept_index = idx
        break
      end
    end
    department = departments[dept_index]
    roles = DEPARTMENT_ROLES[department]
    job_title = roles.sample

    # Weighted country pick
    r_country = rand
    selected_country = country_entries.first[0]
    config = country_entries.first[1]
    cumulative_c = 0.0
    country_entries.each do |c_name, c_conf|
      cumulative_c += c_conf[:weight]
      if r_country <= cumulative_c
        selected_country = c_name
        config = c_conf
        break
      end
    end

    first_name = FIRST_NAMES.sample
    last_name = LAST_NAMES.sample
    email = "#{first_name.downcase}.#{last_name.downcase}.#{i}@acme.org"

    # Salary generated within country band, rounded to hundreds
    min_sal = config[:min_salary]
    max_sal = config[:max_salary]
    # Use normal-like distribution (average of 3 random values) for realistic clustering around median
    rand_factor = (rand + rand + rand) / 3.0
    raw_salary = min_sal + (rand_factor * (max_sal - min_sal))
    annual_salary = (raw_salary / 100.0).round * 100.0

    # Random joined date within last 5 years
    days_span = (end_date - start_date).to_i
    joined_date = start_date + rand(0..days_span).days

    records << {
      first_name: first_name,
      last_name: last_name,
      email: email,
      job_title: job_title,
      department: department,
      country: selected_country,
      currency: config[:currency],
      annual_salary: annual_salary,
      joined_date: joined_date,
      created_at: now,
      updated_at: now
    }

    if records.size >= BATCH_SIZE
      Employee.insert_all(records)
      records.clear
      print '.'
    end
  end

  # Insert remaining records if any
  Employee.insert_all(records) if records.any?
  puts ''
end

puts "Successfully seeded #{Employee.count} employees in #{time_taken.round(2)} seconds!"
puts ''
puts '--- Seed Summary by Country ---'
Employee.group(:country, :currency).count.each do |(country, currency), count|
  avg_sal = Employee.where(country: country).average(:annual_salary).to_f.round(2)
  puts "  - #{country} (#{currency}): #{count} employees | Avg Local Salary: #{avg_sal}"
end
puts ''
puts '--- Seed Summary by Department ---'
Employee.group(:department).count.each do |dept, count|
  puts "  - #{dept}: #{count} employees"
end
