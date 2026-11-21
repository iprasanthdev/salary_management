require 'rails_helper'

RSpec.describe Employee, type: :model do
  describe 'validations' do
    subject { build(:employee) }

    it 'is valid with valid attributes' do
      expect(subject).to be_valid
    end

    it 'requires a first_name' do
      subject.first_name = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:first_name]).to include("can't be blank")
    end

    it 'requires a last_name' do
      subject.last_name = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:last_name]).to include("can't be blank")
    end

    it 'requires an email' do
      subject.email = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:email]).to include("can't be blank")
    end

    it 'enforces uniqueness of email case-insensitively' do
      create(:employee, email: 'test@acme.org')
      duplicate = build(:employee, email: 'TEST@acme.org')
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to include('has already been taken')
    end

    it 'requires a valid email format' do
      subject.email = 'invalid-email'
      expect(subject).not_to be_valid
      expect(subject.errors[:email]).to include('is invalid')
    end

    it 'requires annual_salary to be greater than 0' do
      subject.annual_salary = -100
      expect(subject).not_to be_valid
      subject.annual_salary = 0
      expect(subject).not_to be_valid
      subject.annual_salary = 50_000
      expect(subject).to be_valid
    end

    it 'requires a valid department' do
      subject.department = 'Invalid Department'
      expect(subject).not_to be_valid
      expect(subject.errors[:department]).to be_present
    end

    it 'requires a valid country' do
      subject.country = 'Atlantis'
      expect(subject).not_to be_valid
      expect(subject.errors[:country]).to be_present
    end

    it 'requires a valid currency' do
      subject.currency = 'XYZ'
      expect(subject).not_to be_valid
      expect(subject.errors[:currency]).to be_present
    end

    it 'requires joined_date' do
      subject.joined_date = nil
      expect(subject).not_to be_valid
      expect(subject.errors[:joined_date]).to include("can't be blank")
    end
  end

  describe '#full_name' do
    it 'returns combined first and last name' do
      employee = build(:employee, first_name: 'Helena', last_name: 'Brooks')
      expect(employee.full_name).to eq('Helena Brooks')
    end
  end

  describe '#annual_salary_usd' do
    it 'returns same amount for USD currency' do
      employee = build(:employee, currency: 'USD', annual_salary: 100_000.0)
      expect(employee.annual_salary_usd).to eq(100_000.0)
    end

    it 'converts GBP correctly using exchange rate (1.28)' do
      employee = build(:employee, :uk, annual_salary: 100_000.0)
      expect(employee.annual_salary_usd).to eq(128_000.0)
    end

    it 'converts EUR correctly using exchange rate (1.08)' do
      employee = build(:employee, :germany, annual_salary: 100_000.0)
      expect(employee.annual_salary_usd).to eq(108_000.0)
    end

    it 'converts INR correctly using exchange rate (0.012)' do
      employee = build(:employee, :india, annual_salary: 1_000_000.0)
      expect(employee.annual_salary_usd).to eq(12_000.0)
    end

    it 'converts SGD correctly using exchange rate (0.74)' do
      employee = build(:employee, :singapore, annual_salary: 100_000.0)
      expect(employee.annual_salary_usd).to eq(74_000.0)
    end
  end

  describe 'scopes' do
    let!(:emp_us_eng) { create(:employee, department: 'Engineering', country: 'United States', first_name: 'Alice', last_name: 'Smith', job_title: 'Backend Engineer', annual_salary: 120_000) }
    let!(:emp_uk_sales) { create(:employee, :uk, department: 'Sales', first_name: 'Bob', last_name: 'Jones', job_title: 'Account Executive', annual_salary: 70_000) }
    let!(:emp_de_hr) { create(:employee, :germany, department: 'Human Resources', first_name: 'Carol', last_name: 'Schmidt', job_title: 'HR Generalist', annual_salary: 65_000) }

    describe '.by_department' do
      it 'filters employees by department' do
        expect(Employee.by_department('Engineering')).to contain_exactly(emp_us_eng)
        expect(Employee.by_department('Sales')).to contain_exactly(emp_uk_sales)
      end
    end

    describe '.by_country' do
      it 'filters employees by country' do
        expect(Employee.by_country('United States')).to contain_exactly(emp_us_eng)
        expect(Employee.by_country('United Kingdom')).to contain_exactly(emp_uk_sales)
      end
    end

    describe '.search' do
      it 'matches by first name' do
        expect(Employee.search('Alice')).to contain_exactly(emp_us_eng)
      end

      it 'matches by last name' do
        expect(Employee.search('Jones')).to contain_exactly(emp_uk_sales)
      end

      it 'matches by email' do
        expect(Employee.search(emp_us_eng.email)).to contain_exactly(emp_us_eng)
      end

      it 'matches by job title' do
        expect(Employee.search('Executive')).to contain_exactly(emp_uk_sales)
      end
    end

    describe '.sorted_by' do
      it 'sorts by salary ascending and descending' do
        expect(Employee.sorted_by('annual_salary', 'asc').first).to eq(emp_de_hr)
        expect(Employee.sorted_by('annual_salary', 'desc').first).to eq(emp_us_eng)
      end

      it 'sorts by name' do
        expect(Employee.sorted_by('name', 'asc').first).to eq(emp_us_eng) # Alice Smith
      end
    end
  end
end
