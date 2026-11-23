# ACME Employee Salary Management System
> Built for an organization of **10,000 employees** across 5 global jurisdictions.  
> **Backend:** Ruby on Rails 8 (API mode) · **Frontend:** React 19 (Vite + Tailwind CSS) · **TDD:** RSpec (46 passing specs)

---

## 1. Executive Summary & Problem Framing

ACME Org's HR team historically managed compensation for **10,000 employees** across multiple countries using fragmented spreadsheets. This created critical operational challenges:
* 50MB+ Excel sheets crashing or freezing on HR workstations.
* No real-time visibility into cross-departmental or international payroll expenditure.
* Currency mismatch (USD, GBP, EUR, INR, SGD) making global budgeting comparisons painful.
* Inability for the **HR Manager** to answer strategic questions about how the organization pays its people.

**This solution provides:**
1. **Executive Compensation Intelligence:** Real-time metrics answering org-wide questions (mean, median, min, max, department/country distributions, pay equity bands) computed via sub-millisecond database queries.
2. **High-Performance Employee Directory:** Instant search, multi-facet filtering, sortable columns, and server-side pagination across 10,000 records.
3. **Multi-Currency Normalization:** Native contractual currencies preserved for local compliance alongside normalized USD metrics for global reporting.
4. **Full CRUD Workflows:** Safe employee creation, compensation adjustment, and removal with instant feedback.

---

## 2. System Architecture

```
[HR Manager (Browser)]
         │
         ▼
[React 19 Frontend (Vite + Tailwind CSS)]  --> Port 5173
  ├── Executive Analytics Dashboard (Recharts + KPI Cards)
  ├── Employee Directory (Debounced Search + Server Pagination)
  └── Employee Modal Forms (Add / Edit / Delete)
         │
         ▼ (RESTful JSON / CORS)
[Ruby on Rails 8 API]                      --> Port 3000
  ├── Api::V1::AnalyticsController
  ├── Api::V1::EmployeesController
  ├── SalaryAnalyticsService (Zero-object SQL Aggregation Engine)
  └── Employee Model (Validations, Scopes, Currency Normalization)
         │
         ▼
[SQLite3 Database (WAL Mode + Composite B-Tree Indexes)]
  └── 10,000 Seeded Records (< 1.5s Seed Time via `insert_all`)
```

---

## 3. Quick Start (Single Command)

### Prerequisites
* Ruby 3.x (tested on Ruby 3.4.4 with Rails 8.0.4)
* Node.js 18+ (tested on Node v22.16 with npm 10.9)

### Run Application
To boot the full stack with automatic database setup and 10,000 seeded employees:
```bash
./start.sh
```
Or using Makefile:
```bash
make start
```

* **Frontend UI:** Open [http://localhost:5173](http://localhost:5173) in your browser.
* **Backend API:** [http://localhost:3000/api/v1/analytics/overview](http://localhost:3000/api/v1/analytics/overview)

---

## 4. Test-Driven Development (TDD) Verification

The backend was built using strict Test-Driven Development with **RSpec**. Every model validation, analytics aggregation query, search scope, and HTTP controller endpoint has full test coverage.

### Run Test Suite
```bash
cd backend
bundle exec rspec
```

### Test Suite Results:
```
46 examples, 0 failures (finished in 0.66 seconds)
```
* **25 Model Specs (`spec/models/employee_spec.rb`):** Validations for required fields, email format and case-insensitive uniqueness, numericality of salary, country/department inclusions, scopes (`.search`, `.by_department`, `.by_country`, `.sorted_by`), and currency conversion rates.
* **7 Service Specs (`spec/services/salary_analytics_service_spec.rb`):** Correctness of total payroll, mean salary, exact median calculation (using SQL offset), min/max range, department breakdowns, country breakdowns, salary bands, and empty database edge cases.
* **14 Request Specs (`spec/requests/api/v1/`):** Full endpoint contracts for analytics overview, paginated employee queries, filtering, sorting, CRUD actions, and 404/422 error states.

---

## 5. High-Performance Seeding (10,000 Employees)

To meet the 10,000-employee requirement realistically without sluggish iterative `create!` calls:
* Uses `Employee.insert_all` in optimized batches of 2,000.
* Distributed across 5 real-world jurisdictions with weighted headcount and realistic localized compensation bands:
  * **United States (USD):** ~3,500 employees ($65k - $240k)
  * **United Kingdom (GBP):** ~1,800 employees (£45k - £145k)
  * **Germany (EUR):** ~1,700 employees (€50k - €150k)
  * **India (INR):** ~2,000 employees (₹1.2M - ₹7.5M)
  * **Singapore (SGD):** ~1,000 employees (S$70k - S$210k)
* Distributed across 7 core departments: Engineering (35%), Sales (20%), Product (10%), Marketing (10%), Finance (9%), Human Resources (8%), Operations (8%).

**Performance:**
```bash
cd backend && bin/rails db:seed
# => Successfully seeded 10000 employees in 1.26 seconds!
```

---

## 6. Answering "How the Org Pays People"

The HR Manager can immediately answer executive questions via the **Compensation Analytics** tab:

1. *"What is ACME's total global annual payroll run-rate?"*
   * Answered instantly by the **Total Annual Spend** KPI card (normalized to USD).
2. *"What does our salary curve look like, and what is our median salary?"*
   * Answered by the **Org Median Salary** card ($85k+) and the **Salary Bracket Distribution** histogram showing workforce dispersion across `<$50k`, `$50k-$100k`, `$100k-$150k`, `$150k-$200k`, and `$200k+`.
3. *"Which department is our highest cost center?"*
   * Answered by the **Departmental Compensation Allocation** chart with interactive spend and headcount comparisons.
4. *"How much are we paying Engineering in India vs. Germany?"*
   * Use the **Slice By: Department & Jurisdiction** dropdowns to view sliced metrics instantaneously.

---

## 7. Artifacts & Documentation Index

As required by the assessment guidelines, comprehensive engineering artifacts are committed in the repository:

* [Product Requirements Document (PRD)](file:///Users/prasanthjagadeesan/Desktop/AInterview/Incubyte/salary_management/docs/REQUIREMENTS.md) — 1-page PRD defining goal, persona, in-scope features, out-of-scope justifications, and success metrics.
* [Architecture & Technical Design](file:///Users/prasanthjagadeesan/Desktop/AInterview/Incubyte/salary_management/docs/ARCHITECTURE.md) — System diagram, database schema with indexes, API contracts, and component hierarchy.
* [Engineering Trade-offs & Decisions](file:///Users/prasanthjagadeesan/Desktop/AInterview/Incubyte/salary_management/docs/TRADE_OFFS_AND_DECISIONS.md) — Trade-off analysis on API vs Monolith, SQLite vs Postgres, server vs client pagination, and currency normalization.
* [Performance Considerations (10k Records)](file:///Users/prasanthjagadeesan/Desktop/AInterview/Incubyte/salary_management/docs/PERFORMANCE.md) — Database indexing, batch seeding with `insert_all`, zero-object memory footprint, and client debouncing.
* [AI Prompts & Methodology](file:///Users/prasanthjagadeesan/Desktop/AInterview/Incubyte/salary_management/docs/AI_PROMPTS_AND_METHODOLOGY.md) — How AI tools were directed with TDD and product framing.
