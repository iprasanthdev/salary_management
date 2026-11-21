# Product Requirements Document (PRD)
## Project: ACME Employee Salary Management System
**Author:** Software Engineering (2 yrs RoR / 1 yr React)  
**Date:** November 2026  
**Status:** Approved for Implementation  
**Target Audience:** HR Management & Executive Leadership  

---

### 1. Executive Summary & Goal
ACME Org has scaled to 10,000 employees across multiple global jurisdictions (United States, United Kingdom, Germany, India, Singapore). Salary administration is currently handled through fragmented, decentralized spreadsheets. This leads to version desynchronization, vulnerability to data corruption, lack of real-time auditability, and severe difficulty in answering strategic compensation questions (e.g., *"What is our total engineering payroll in Europe?"*, *"What does the salary distribution curve look like across departments?"*).

**Goal:** Build a robust, web-based Employee Salary Management platform that replaces spreadsheets, scales effortlessly to 10,000+ employees, provides real-time salary analytics, and offers an intuitive HR management workflow.

---

### 2. User Persona
* **Primary Persona:** **HR Manager (Helena Brooks)**
  * **Role:** Manages total compensation, salary bands, employee onboarding/adjustments, and international payroll allocations.
  * **Pain Points:** 
    * Opening massive 50MB+ Excel sheets that crash or freeze.
    * Inability to answer executive questions about org-wide pay distribution quickly.
    * Currency mismatch (paying in USD, GBP, EUR, INR, SGD) making global comparisons painstaking.
    * Manual errors during employee compensation updates.
  * **Jobs to be Done:**
    1. Search and filter across 10,000 employees instantaneously by department, country, or title.
    2. Add new hires or update salary packages with immediate validation.
    3. View real-time aggregated salary benchmarks (median, mean, min, max, total spend) normalized to a baseline currency (USD) while preserving local currency records.

---

### 3. In-Scope Features & Functional Requirements

#### 3.1. Compensation Analytics & Decision Engine ("Answering How the Org Pays")
* **Executive Summary Cards:** 
  * Total Headcount (10,000 active records).
  * Total Annual Payroll Expenditure (normalized to USD).
  * Org-wide Average and Median Salary.
* **Interactive Breakdown & Visualizations:**
  * **Spend & Headcount by Department:** Visual distribution across Engineering, Product, Sales, Marketing, HR, Finance, Operations.
  * **Spend & Headcount by Country:** Global allocation across USA (USD), UK (GBP), Germany (EUR), India (INR), and Singapore (SGD).
  * **Salary Bracket Distribution:** Histogram showing employee dispersion across competitive pay bands ($0-$50k, $50k-$100k, $100k-$150k, $150k-$200k, $200k+).
  * **Multi-Currency Normalization:** Transparent conversion to USD for global executive rollups alongside native currency display for local accuracy.

#### 3.2. Employee Directory & CRUD Management
* **High-Performance Paginated Grid:** Server-side pagination (25, 50, 100 per page) ensuring sub-50ms API responses over 10,000 records.
* **Instant Debounced Search:** Search across employee name, email, and job title with 300ms debounce.
* **Multi-Facet Filtering & Sorting:** Filter by Country and Department; sort ascending/descending by Name, Salary, Department, and Start Date.
* **Employee Management Actions:**
  * **Create:** Modal form with client- and server-side validation (unique email, positive salary, valid country/currency).
  * **Edit:** In-line / modal update for salary revisions or department transfers.
  * **Delete:** Soft/hard delete with confirmation prompt to prevent accidental data loss.

---

### 4. Deliberately Out of Scope (And Justifications)

| Feature | Status | Engineering & Product Justification |
| :--- | :--- | :--- |
| **Complex Multi-Tier RBAC & SSO** | Deferred (v2) | The primary user persona is the HR Manager. Adding OAuth/SAML/Devise multi-tenancy introduces auth overhead without enhancing the core salary intelligence and management capabilities required for this assessment. Basic secure session/token architecture is prioritized. |
| **Direct Bank Payroll Execution (ACH/SEPA/Stripe)** | Excluded | ACME is replacing spreadsheet management and reporting. Actual money movement and clearinghouse integrations require banking gateways, tax withholding engines, and regulatory compliance that distract from compensation intelligence. |
| **Historical Compensation Audit Trail / Time-Travel** | Deferred (v2) | Full historical point-in-time wage indexing requires temporal tables (`papertrail` or bi-temporal data modeling). Current annual salary tracking meets 100% of the active operational requirements. |
| **Dynamic Live Forex Scraping** | Simplified | Live FX APIs introduce third-party network failure modes, rate limits, and non-deterministic test suites. We use an extensible, deterministic currency exchange service with realistic peg rates. |
| **Complex Benefits & Stock Options (ESOP/RSU) Ledger** | Excluded | Equity vesting and 401(k)/pension schemes add significant schema complexity without impacting the core base salary distribution problem. |

---

### 5. Non-Functional & Technical Requirements
* **Response Time:** API response time < 50ms for paginated queries; < 100ms for aggregate analytics across 10,000 records.
* **Data Integrity:** Strict database constraints (NOT NULL, UNIQUE emails, CHECK constraints on salary > 0).
* **Test Coverage:** Test-Driven Development (TDD) using RSpec with >90% coverage across models, services, and API controllers.
* **Scalability:** Indexed relational database schema (SQLite / PostgreSQL) capable of seamless scaling to 100,000+ rows.
* **UI Responsiveness:** Responsive React interface with clean loading states, empty states, and toast notifications.
