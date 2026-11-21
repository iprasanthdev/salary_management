import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Scale, 
  ArrowUpDown, 
  Globe2, 
  Briefcase, 
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  api, 
  formatCurrency, 
  formatUSD, 
  convertFromUSD,
  CURRENCY_SYMBOLS, 
  COUNTRY_CURRENCIES 
} from '../services/api';

const COLORS = ['#0284c7', '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6'];

export default function AnalyticsDashboard({ filterOptions }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [showInUSD, setShowInUSD] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics({
        department: selectedDept,
        country: selectedCountry
      });
      setData(res);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedDept, selectedCountry]);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setShowInUSD(false);
  };

  const handleResetFilters = () => {
    setSelectedDept('');
    setSelectedCountry('');
    setShowInUSD(false);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Computing compensation intelligence across 10,000 employees...</p>
      </div>
    );
  }

  const { summary, department_breakdown = [], country_breakdown = [], salary_bands = [] } = data || {};

  const jurisdictionCurrency = selectedCountry 
    ? (COUNTRY_CURRENCIES[selectedCountry] || 'USD') 
    : 'USD';

  const activeCurrency = (showInUSD || !selectedCountry) ? 'USD' : jurisdictionCurrency;
  const activeSymbol = CURRENCY_SYMBOLS[activeCurrency] || '$';

  const displaySpend = activeCurrency === 'USD' 
    ? summary?.total_payroll_usd 
    : (summary?.total_payroll_local || convertFromUSD(summary?.total_payroll_usd, activeCurrency));

  const displayMean = activeCurrency === 'USD' 
    ? summary?.average_salary_usd 
    : (summary?.average_salary_local || convertFromUSD(summary?.average_salary_usd, activeCurrency));

  const displayMedian = activeCurrency === 'USD' 
    ? summary?.median_salary_usd 
    : (summary?.median_salary_local || convertFromUSD(summary?.median_salary_usd, activeCurrency));

  const displayMin = activeCurrency === 'USD' 
    ? summary?.min_salary_usd 
    : (summary?.min_salary_local || convertFromUSD(summary?.min_salary_usd, activeCurrency));

  const displayMax = activeCurrency === 'USD' 
    ? summary?.max_salary_usd 
    : (summary?.max_salary_local || convertFromUSD(summary?.max_salary_usd, activeCurrency));

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Slicing Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compensation Intelligence</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono border border-slate-200">
              {activeSymbol} {activeCurrency}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time compensation analytics. Selecting a country automatically switches to its currency.
          </p>
        </div>

        {/* Clean, Simple Filter Bar with Centered Dropdown Icons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="relative inline-block">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
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

          {/* Jurisdiction Slicer */}
          <div className="relative inline-block">
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
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

          {/* Simple USD Toggle (always available) */}
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

          {(selectedDept || selectedCountry || showInUSD) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Headcount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Headcount</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {summary?.total_employees?.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {selectedCountry ? `${selectedCountry} employees` : 'Active global workforce'}
            </p>
          </div>
        </div>

        {/* Total Annual Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Annual Spend</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold font-mono text-sm">
              {activeSymbol}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(displaySpend, activeCurrency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total payroll in <span className="font-bold text-slate-700">{activeCurrency}</span>
            </p>
          </div>
        </div>

        {/* Average Salary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Salary</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(displayMean, activeCurrency)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Per employee / year ({activeCurrency})
            </p>
          </div>
        </div>

        {/* Median Salary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Median Salary</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(displayMedian, activeCurrency)}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Spread: {formatCurrency(displayMin, activeCurrency)} - {formatCurrency(displayMax, activeCurrency)}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Department Breakdown & Country Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-sky-600" />
                <span>Departmental Compensation Allocation</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Headcount, total spend, and average salary</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={department_breakdown} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="department" 
                  angle={-25} 
                  textAnchor="end" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'total_payroll_usd' ? formatUSD(value) : value,
                    name === 'total_payroll_usd' ? 'Total Spend (USD)' : 'Employees'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total_payroll_usd" fill="#0284c7" radius={[4, 4, 0, 0]}>
                  {department_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Detail List */}
          <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {department_breakdown.map((dept) => {
              const deptSpend = activeCurrency === 'USD' 
                ? dept.total_payroll_usd 
                : convertFromUSD(dept.total_payroll_usd, activeCurrency);
              const deptAvg = activeCurrency === 'USD' 
                ? dept.average_salary_usd 
                : convertFromUSD(dept.average_salary_usd, activeCurrency);

              return (
                <div key={dept.department} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-none">
                  <span className="font-semibold text-slate-800">{dept.department}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-500">{dept.headcount} staff</span>
                    <span className="font-medium text-slate-700">Avg: {formatCurrency(deptAvg, activeCurrency)}</span>
                    <span className="font-bold text-sky-700 font-mono">{formatCurrency(deptSpend, activeCurrency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-indigo-600" />
                <span>Countries & Local Currencies</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any country to automatically switch currency</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={country_breakdown} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="country" 
                  angle={-15} 
                  textAnchor="end" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip 
                  formatter={(value) => [formatUSD(value), 'Spend (USD)']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total_payroll_usd" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Country Detail List with click-to-switch */}
          <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {country_breakdown.map((c) => {
              const sym = CURRENCY_SYMBOLS[c.currency] || '$';
              const isSelected = selectedCountry === c.country;

              return (
                <button
                  key={c.country}
                  type="button"
                  onClick={() => handleCountryChange(c.country)}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors border-b border-slate-50 last:border-none text-left ${
                    isSelected ? 'bg-sky-50 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">{c.country}</span>
                    <span className="inline-flex items-center whitespace-nowrap text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold border border-slate-200 shrink-0">
                      {sym}&nbsp;{c.currency}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-500">{c.headcount} staff</span>
                    <span className="font-medium text-slate-700">
                      Local Avg: {formatCurrency(c.average_salary_local, c.currency)}
                    </span>
                    <span className="font-bold text-indigo-700 font-mono">
                      {formatUSD(c.total_payroll_usd)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Salary Tier Distribution Bands */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-emerald-600" />
            <span>Salary Bracket Distribution</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Workforce dispersion across annual compensation brackets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {salary_bands.map((band) => (
            <div key={band.range} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">{band.range}</span>
                <div className="mt-2 text-xl font-extrabold text-slate-900 font-mono">
                  {band.count.toLocaleString()}
                </div>
                <span className="text-xs font-semibold text-sky-700">{band.percentage}% of workforce</span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-sky-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${band.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
