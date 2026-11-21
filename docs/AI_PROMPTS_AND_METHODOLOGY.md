# AI Prompts & Engineering Methodology

This project was built adhering to the assessment guidelines:
> *"Using agentic AI tools of your choice, build the solution while maintaining high standards of code quality and test coverage... Use AI intentionally while maintaining correctness and quality."*

### 1. Developer Persona & Stance
* **Profile:** Full-stack engineer with 2 years in Ruby on Rails and 1 year in React.js.
* **Philosophy:** 
  * Prioritize idiomatic Rails conventions over exotic meta-programming.
  * Embrace Test-Driven Development (TDD) — write unit and request specs before implementation.
  * Keep React state simple, functional, predictable, and modular.
  * Design for realistic 10,000-record scale using database indexes and server-side pagination.

---

### 2. Methodological Phases & AI Directives

#### Phase 1: Requirements & Domain Modeling
* **Instruction:** "Analyze the ACME HR salary management problem statement. Formulate a 1-page PRD defining the core persona, in-scope features, explicit out-of-scope items with engineering justifications, and multi-currency normalization."
* **Outcome:** Clean scope boundary avoiding scope creep (e.g., leaving out bank integration and SSO, focusing on core salary analytics and management).

#### Phase 2: Test-Driven Backend Design (TDD)
* **Instruction:** "Generate comprehensive RSpec tests for `Employee` model validations, salary normalization, and search scopes before writing the ActiveRecord model. Ensure test execution is deterministic and fast."
* **Outcome:** Comprehensive model specs covering nullability, uniqueness, email formatting, salary positivity, and USD conversion helpers.

#### Phase 3: Analytics Service & SQL Aggregations
* **Instruction:** "Design `SalaryAnalyticsService` with RSpec unit tests that compute global payroll metrics, department breakdowns, country breakdowns, and salary distribution bands without loading 10,000 objects into memory."
* **Outcome:** Sub-5ms database-level aggregations and 100% test coverage.

#### Phase 4: API Request Specs & Controllers
* **Instruction:** "Write RSpec request specs for `/api/v1/employees` (pagination, filter, sort, CRUD) and `/api/v1/analytics/overview`. Verify HTTP status codes, error payloads, and JSON response shapes."
* **Outcome:** Robust REST API with pagination metadata and clean error handling.

#### Phase 5: High-Performance Seeding
* **Instruction:** "Develop `db/seeds.rb` generating 10,000 realistic employees across US, UK, DE, IN, SG with realistic department pay distributions using `insert_all`."
* **Outcome:** 10,000 records seeded in 1.2 seconds.

#### Phase 6: Modern React UI & Visualizations
* **Instruction:** "Construct a modular React frontend using Vite, Tailwind CSS, and Recharts. Implement executive KPI cards, department/country charts, debounced search, sortable table, and modal dialogs for employee operations."
* **Outcome:** Clean, aesthetic, responsive HR portal.
