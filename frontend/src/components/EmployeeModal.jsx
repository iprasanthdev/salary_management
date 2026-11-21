import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowRightLeft, ChevronDown } from 'lucide-react';
import { 
  COUNTRY_CURRENCIES, 
  CURRENCY_SYMBOLS, 
  SUPPORTED_CURRENCIES, 
  formatCurrency, 
  formatUSD 
} from '../services/api';

const RATES = {
  USD: 1.0,
  GBP: 1.28,
  EUR: 1.08,
  SGD: 0.74,
  INR: 0.012
};

export default function EmployeeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  employee = null, 
  filterOptions,
  defaultCountry = ''
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    job_title: '',
    department: 'Engineering',
    country: 'United States',
    currency: 'USD',
    annual_salary: '',
    joined_date: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        job_title: employee.job_title || '',
        department: employee.department || 'Engineering',
        country: employee.country || 'United States',
        currency: employee.currency || 'USD',
        annual_salary: employee.annual_salary || '',
        joined_date: employee.joined_date || new Date().toISOString().split('T')[0]
      });
    } else {
      const initialCountry = defaultCountry || 'United States';
      const initialCurrency = COUNTRY_CURRENCIES[initialCountry] || 'USD';
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        job_title: '',
        department: 'Engineering',
        country: initialCountry,
        currency: initialCurrency,
        annual_salary: '',
        joined_date: new Date().toISOString().split('T')[0]
      });
    }
    setError('');
  }, [employee, isOpen, defaultCountry]);

  if (!isOpen) return null;

  // When Country changes, automatically update the matching Currency & Symbol
  const handleCountryChange = (countryName) => {
    const cur = COUNTRY_CURRENCIES[countryName] || 'USD';
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      currency: cur
    }));
  };

  // When Currency changes directly (e.g. choosing USD for a UK employee)
  const handleCurrencyChange = (cur) => {
    setFormData((prev) => ({
      ...prev,
      currency: cur
    }));
  };

  const calculatedUSD = () => {
    const val = parseFloat(formData.annual_salary);
    if (isNaN(val) || val <= 0) return 0;
    const rate = RATES[formData.currency] || 1.0;
    return val * rate;
  };

  const activeSymbol = CURRENCY_SYMBOLS[formData.currency] || '$';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First and last name are required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Corporate email is required');
      return;
    }
    if (!formData.annual_salary || parseFloat(formData.annual_salary) <= 0) {
      setError('Annual salary must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {employee ? 'Edit Employee Compensation' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee ? `Update details for ${employee.full_name}` : 'Create a new employee record'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              required
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              placeholder="e.g. Senior Software Engineer"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <div className="relative">
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="appearance-none w-full text-xs pl-3 pr-8 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer shadow-xs"
                >
                  {filterOptions?.departments?.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jurisdiction / Country</label>
              <div className="relative">
                <select
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="appearance-none w-full text-xs pl-3 pr-8 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium cursor-pointer shadow-xs"
                >
                  {filterOptions?.countries?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Simple Currency & Salary Section */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <div className="relative">
                <select
                  value={formData.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="appearance-none w-full text-xs pl-2.5 pr-7 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-slate-800 font-mono cursor-pointer shadow-xs"
                >
                  {SUPPORTED_CURRENCIES.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.code} ({cur.symbol})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Salary
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center justify-center pointer-events-none">
                  <span className="text-slate-600 font-extrabold text-sm font-mono leading-none">
                    {activeSymbol}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={formData.annual_salary}
                  onChange={(e) => setFormData({ ...formData, annual_salary: e.target.value })}
                  placeholder="0.00"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Live Simple Conversion Preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-600 font-medium">Package:</span>
              <span className="font-extrabold text-slate-900 font-mono">
                {formatCurrency(formData.annual_salary || 0, formData.currency)} {formData.currency}
              </span>
            </div>
            {formData.currency !== 'USD' && (
              <div className="flex items-center space-x-1.5 text-sky-700 font-semibold font-mono">
                <ArrowRightLeft className="w-3 h-3 text-sky-600" />
                <span>≈ {formatUSD(calculatedUSD())} USD</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Joined Date</label>
            <input
              type="date"
              required
              value={formData.joined_date}
              onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
