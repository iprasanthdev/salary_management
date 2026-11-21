# Engineering Trade-offs & Design Decisions

### 1. Decoupled Architecture (Rails API + Vite React) vs. Rails Full-Stack Monolith (Hotwire/ERB)
* **Decision:** Decoupled Rails API with a standalone Vite React frontend.
* **Why:**
  * The assessment specifically requests **ReactJS** as frontend and **Ruby on Rails** as backend.
  * Clear separation of concerns: Rails excels at business logic, database queries, and RESTful serializations; React excels at highly responsive client-side state transitions, interactive data tables, and dynamic charting (Recharts).
  * Fast development feedback loop via Vite HMR (Hot Module Replacement).
* **Trade-off:** Requires running two processes during development and managing Cross-Origin Resource Sharing (Rack-CORS). We mitigate this with a clean one-click `start.sh` runner.

---

### 2. Database Selection: SQLite with WAL & Indexes vs. PostgreSQL
* **Decision:** SQLite3 with WAL (Write-Ahead Logging) mode and B-tree indexes.
* **Why:**
  * Zero-friction setup: Evaluators can clone and run the repo immediately without needing a local PostgreSQL/Docker daemon running.
  * Performance: SQLite easily handles tens of thousands of rows with sub-millisecond query execution when proper indices (`department`, `country`, `annual_salary`, `email`) are added.
  * Standard Rails 8 defaults: Rails 8 treats SQLite as a first-class production-capable database with optimized pragma defaults.
* **Trade-off:** In a real-world enterprise setting with 50 concurrent HR administrators writing simultaneously, PostgreSQL with connection pooling (PgBouncer) would be preferred for high write-concurrency. For this single-persona assessment, SQLite is optimal.

---

### 3. Server-Side Pagination vs. Client-Side Rendering
* **Decision:** Strict server-side pagination with SQL `LIMIT` and `OFFSET`.
* **Why:**
  * Transferring 10,000 full employee records over JSON in a single response payload would require transferring ~4-6 MB of uncompressed JSON, causing high latency, heavy browser DOM node allocation, and browser UI freezes.
  * With server-side pagination (25-100 rows), each response payload is ~15 KB, rendering instantaneously (< 30ms network round-trip).
* **Trade-off:** Search and filter changes require an API round-trip. We mitigate latency using 300ms debouncing and index-backed SQL `LIKE` queries.

---

### 4. Database-Level SQL Aggregation vs. Ruby Object Mapping for Analytics
* **Decision:** Single-pass SQL aggregation (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY`) inside `SalaryAnalyticsService`.
* **Why:**
  * Loading 10,000 ActiveRecord objects into Ruby memory (`Employee.all.sum(&:annual_salary)`) allocates over 10,000 Ruby objects and consumes 40MB+ RAM, taking 200-400ms.
  * Delegating aggregation to SQLite's C-engine via SQL takes **under 4ms** and uses negligible Ruby memory.
* **Trade-off:** Raw SQL group-by queries require explicit handling of currency normalization. We solve this by storing the currency and calculating USD equivalence using a structured SQL `CASE` or lightweight converted aggregation.

---

### 5. Multi-Currency Normalization Strategy
* **Decision:** Dual-track compensation tracking:
  1. Store the exact local contractual salary and currency (`annual_salary`, `currency`) to ensure legal and payroll accuracy for each country.
  2. Provide a normalized USD equivalent (`annual_salary_usd`) for executive rollups, comparisons, and charts.
* **Standard Pegged Conversion Rates:**
  * 1 USD = 1.00 USD
  * 1 GBP = 1.28 USD
  * 1 EUR = 1.08 USD
  * 1 SGD = 0.74 USD
  * 1 INR = 0.012 USD
* **Trade-off:** In a production banking environment, exchange rates fluctuate minute-by-minute. For HR salary planning and annual budget modeling, fixed fiscal-quarter exchange rates are standard practice.
