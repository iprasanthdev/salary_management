import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Scale, 
  ArrowUpDown, 
  Globe2, 
  Briefcase, 
  Filter,
  RefreshCw
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
import { api, formatUSD } from '../services/api';

const COLORS = ['#0284c7', '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6'];

export default function AnalyticsDashboard({ filterOptions }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

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

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Computing compensation intelligence across 10,000 employees...</p>
      </div>
    );
  }

  const { summary, department_breakdown = [], country_breakdown = [], salary_bands = [] } = data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Slicing Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compensation Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time aggregate insights and pay equity benchmarks for executive HR decision-making.
          </p>
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Slice By:</span>
          </div>
          
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Departments</option>
            {filterOptions?.departments?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Jurisdictions</option>
            {filterOptions?.countries?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {(selectedDept || selectedCountry) && (
            <button
              onClick={() => {
                setSelectedDept('');
                setSelectedCountry('');
              }}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Headcount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
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
            <p className="text-xs text-slate-500 mt-1">Active global employees</p>
          </div>
        </div>

        {/* Total Annual Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Annual Spend</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {formatUSD(summary?.total_payroll_usd)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Normalized USD run-rate</p>
          </div>
        </div>

        {/* Average Salary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mean Salary</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {formatUSD(summary?.average_salary_usd)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Per employee / year (USD)</p>
          </div>
        </div>

        {/* Median Salary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Median Salary</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">
              {formatUSD(summary?.median_salary_usd)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Spread: {formatUSD(summary?.min_salary_usd)} - {formatUSD(summary?.max_salary_usd)}
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
            {department_breakdown.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-none">
                <span className="font-semibold text-slate-800">{dept.department}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500">{dept.headcount} staff</span>
                  <span className="font-medium text-slate-700">Avg: {formatUSD(dept.average_salary_usd)}</span>
                  <span className="font-bold text-sky-700">{formatUSD(dept.total_payroll_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-indigo-600" />
                <span>Geographic Spend & Currency Normalization</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">International headcount and normalized spend in USD</p>
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

          {/* Country Detail List */}
          <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {country_breakdown.map((c) => (
              <div key={c.country} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-none">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-800">{c.country}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                    {c.currency}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500">{c.headcount} staff</span>
                  <span className="font-medium text-slate-700">Avg USD: {formatUSD(c.average_salary_usd)}</span>
                  <span className="font-bold text-indigo-700">{formatUSD(c.total_payroll_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Salary Tier Distribution Bands */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-emerald-600" />
            <span>Salary Bracket Distribution (Pay Equity Dispersion)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispersion of total workforce across normalized annual compensation tiers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {salary_bands.map((band, idx) => (
            <div key={band.range} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700">{band.range}</span>
                <div className="mt-2 text-xl font-extrabold text-slate-900">
                  {band.count.toLocaleString()}
                </div>
                <span className="text-xs font-semibold text-sky-700">{band.percentage}% of workforce</span>
              </div>
              
              {/* Progress bar */}
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
