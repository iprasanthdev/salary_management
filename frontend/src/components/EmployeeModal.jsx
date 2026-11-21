import React, { useState, useEffect } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';
import { COUNTRY_CURRENCIES, formatUSD } from '../services/api';

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
  filterOptions 
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
      setFormData({
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
    }
    setError('');
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleCountryChange = (c) => {
    const cur = COUNTRY_CURRENCIES[c] || 'USD';
    setFormData((prev) => ({
      ...prev,
      country: c,
      currency: cur
    }));
  };

  const calculatedUSD = () => {
    const val = parseFloat(formData.annual_salary);
    if (isNaN(val) || val <= 0) return 0;
    const rate = RATES[formData.currency] || 1.0;
    return val * rate;
  };

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
              {employee ? `Update details for ${employee.full_name}` : 'Create a new employee compensation profile'}
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
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {filterOptions?.departments?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country Jurisdiction</label>
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {filterOptions?.countries?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
              <input
                type="text"
                disabled
                value={formData.currency}
                className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-100 text-slate-600 rounded-xl font-mono font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Salary</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={formData.annual_salary}
                onChange={(e) => setFormData({ ...formData, annual_salary: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Live USD Conversion Preview */}
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
            <span className="text-xs text-sky-800 font-medium">Normalized USD Equivalent:</span>
            <span className="text-xs font-extrabold text-sky-900 font-mono">
              {formatUSD(calculatedUSD())} USD
            </span>
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
