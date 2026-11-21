import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  UserPlus, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { 
  api, 
  formatCurrency, 
  formatUSD, 
  CURRENCY_SYMBOLS, 
  COUNTRY_CURRENCIES 
} from '../services/api';

const DEPT_BADGE_COLORS = {
  'Engineering': 'bg-blue-50 text-blue-700 border-blue-200',
  'Product': 'bg-purple-50 text-purple-700 border-purple-200',
  'Sales': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Marketing': 'bg-amber-50 text-amber-700 border-amber-200',
  'Human Resources': 'bg-pink-50 text-pink-700 border-pink-200',
  'Finance': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Operations': 'bg-slate-100 text-slate-700 border-slate-300'
};

export default function EmployeeDirectory({ 
  filterOptions, 
  onAddEmployee, 
  onEditEmployee, 
  onDeleteEmployee,
  refreshTrigger 
}) {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 25,
    total_pages: 1,
    total_count: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [showInUSD, setShowInUSD] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getEmployees({
        page: pagination.current_page,
        per_page: pagination.per_page,
        search: debouncedSearch,
        department: selectedDept,
        country: selectedCountry,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setEmployees(res.employees || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, debouncedSearch, selectedDept, selectedCountry, sortBy, sortOrder, refreshTrigger]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleCountryFilterChange = (country) => {
    setSelectedCountry(country);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination((prev) => ({ ...prev, current_page: newPage }));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedDept('');
    setSelectedCountry('');
    setShowInUSD(false);
    setSortBy('name');
    setSortOrder('asc');
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-sky-600" /> 
      : <ArrowDown className="w-3.5 h-3.5 text-sky-600" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Simple Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee name, email, or job title..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filters, Single USD Toggle & Add Employee Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter with centered dropdown icon */}
          <div className="relative inline-block">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPagination((p) => ({ ...p, current_page: 1 }));
              }}
              className="appearance-none text-xs font-medium border border-slate-300 rounded-xl pl-3 pr-8 py-2 bg-slate-50 text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-xs"
            >
              <option value="">All Departments</option>
              {filterOptions?.departments?.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Jurisdiction Filter with centered dropdown icon */}
          <div className="relative inline-block">
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryFilterChange(e.target.value)}
              className="appearance-none text-xs font-bold border border-sky-300 rounded-xl pl-3 pr-8 py-2 bg-sky-50 text-sky-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-xs"
            >
              <option value="">All Countries (Global)</option>
              {filterOptions?.countries?.map((c) => {
                const cur = COUNTRY_CURRENCIES[c] || 'USD';
                const sym = CURRENCY_SYMBOLS[cur] || '$';
                return (
                  <option key={c} value={c}>
                    {c} ({sym} {cur})
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-sky-600">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Universal USD Toggle Button */}
          <button
            type="button"
            onClick={() => setShowInUSD(!showInUSD)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
              showInUSD
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {showInUSD ? 'Viewing in USD ($)' : 'Convert to USD ($)'}
          </button>

          {(searchTerm || selectedDept || selectedCountry || showInUSD) && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Add Employee Button */}
          <button
            onClick={() => onAddEmployee(selectedCountry)}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  <button 
                    onClick={() => handleSort('name')}
                    className="group flex items-center space-x-1.5 focus:outline-none"
                  >
                    <span>Employee</span>
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5">Role</th>
                <th scope="col" className="px-6 py-3.5">
                  <button 
                    onClick={() => handleSort('department')}
                    className="group flex items-center space-x-1.5 focus:outline-none"
                  >
                    <span>Department</span>
                    {renderSortIcon('department')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 whitespace-nowrap">
                  <button 
                    onClick={() => handleSort('country')}
                    className="group flex items-center space-x-1.5 focus:outline-none"
                  >
                    <span>Jurisdiction</span>
                    {renderSortIcon('country')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  <button 
                    onClick={() => handleSort('annual_salary')}
                    className="group inline-flex items-center space-x-1.5 focus:outline-none"
                  >
                    <span>{showInUSD ? 'Salary (USD $)' : 'Salary (Native)'}</span>
                    {renderSortIcon('annual_salary')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5">
                  <button 
                    onClick={() => handleSort('joined_date')}
                    className="group flex items-center space-x-1.5 focus:outline-none"
                  >
                    <span>Joined Date</span>
                    {renderSortIcon('joined_date')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-slate-100 rounded w-44"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                    <p className="font-semibold text-slate-700 text-base">No employees found</p>
                    <p className="text-xs text-slate-400 mt-1">Try modifying your search or clearing active filters.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const badgeColor = DEPT_BADGE_COLORS[emp.department] || 'bg-slate-100 text-slate-700';
                  const sym = CURRENCY_SYMBOLS[emp.currency?.toUpperCase()] || '$';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900">{emp.full_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{emp.email}</div>
                      </td>

                      {/* Job Title */}
                      <td className="px-6 py-3.5 font-medium text-slate-800">
                        {emp.job_title}
                      </td>

                      {/* Department Badge */}
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
                          {emp.department}
                        </span>
                      </td>

                      {/* Country & Native Currency */}
                      <td className="px-6 py-3.5 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center space-x-2 whitespace-nowrap">
                          <span className="font-medium">{emp.country}</span>
                          <span className="inline-flex items-center whitespace-nowrap text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-mono font-bold border border-slate-200 shrink-0">
                            {sym}&nbsp;{emp.currency}
                          </span>
                        </div>
                      </td>

                      {/* Compensation (respects USD vs Native mode) */}
                      <td className="px-6 py-3.5 text-right font-mono">
                        {showInUSD ? (
                          <>
                            <div className="font-extrabold text-slate-900">
                              {formatUSD(emp.annual_salary_usd)}
                            </div>
                            {emp.currency !== 'USD' && (
                              <div className="text-xs text-slate-500 font-medium">
                                Native: {formatCurrency(emp.annual_salary, emp.currency)}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="font-extrabold text-slate-900">
                              {formatCurrency(emp.annual_salary, emp.currency)}
                            </div>
                            {emp.currency !== 'USD' && (
                              <div className="text-xs text-slate-500 font-medium">
                                ≈ {formatUSD(emp.annual_salary_usd)} USD
                              </div>
                            )}
                          </>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-3.5 text-xs text-slate-600">
                        {emp.joined_date}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onEditEmployee(emp)}
                            title="Edit Employee"
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEmployee(emp)}
                            title="Delete Employee"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Showing <span className="font-semibold text-slate-900">{((pagination.current_page - 1) * pagination.per_page) + (employees.length ? 1 : 0)}</span> to{' '}
            <span className="font-semibold text-slate-900">{Math.min(pagination.current_page * pagination.per_page, pagination.total_count)}</span> of{' '}
            <span className="font-semibold text-slate-900">{pagination.total_count.toLocaleString()}</span> employees
          </div>

          <div className="flex items-center space-x-4">
            {/* Per-Page Select with centered icon and right padding */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <span>Rows per page:</span>
              <div className="relative inline-block">
                <select
                  value={pagination.per_page}
                  onChange={(e) => setPagination((prev) => ({ ...prev, per_page: Number(e.target.value), current_page: 1 }))}
                  className="appearance-none border border-slate-300 rounded-lg pl-2.5 pr-7 py-1 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-xs"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-700 px-2">
                Page {pagination.current_page} of {pagination.total_pages || 1}
              </span>

              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
