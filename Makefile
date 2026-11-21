.PHONY: setup seed test test-backend test-frontend build start

setup:
	@echo "Setting up ACME Salary Management..."
	cd backend && bundle install && bin/rails db:migrate
	cd frontend && npm install

seed:
	@echo "Seeding 10,000 employees..."
	cd backend && bin/rails db:seed

test: test-backend

test-backend:
	@echo "Running RSpec Test Suite..."
	cd backend && bundle exec rspec

build-frontend:
	@echo "Building React Frontend..."
	cd frontend && npm run build

start:
	@./start.sh
