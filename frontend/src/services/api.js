const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  INR: '₹',
  SGD: 'S$'
};

export const COUNTRY_CURRENCIES = {
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Germany': 'EUR',
  'India': 'INR',
  'Singapore': 'SGD'
};

export const CURRENCY_TO_COUNTRY = {
  USD: 'United States',
  GBP: 'United Kingdom',
  EUR: 'Germany',
  INR: 'India',
  SGD: 'Singapore'
};

export const RATES_TO_USD = {
  USD: 1.0,
  GBP: 1.28,
  EUR: 1.08,
  SGD: 0.74,
  INR: 0.012
};

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$) - Singapore Dollar' }
];

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null || isNaN(amount)) return '-';
  const cleanCode = String(currency || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[cleanCode] || cleanCode + ' ';
  return `${symbol}${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

export const formatUSD = (amount) => formatCurrency(amount, 'USD');

export const convertFromUSD = (amountUSD, targetCurrency = 'USD') => {
  if (amountUSD == null || isNaN(amountUSD)) return 0;
  const rate = RATES_TO_USD[targetCurrency] || 1.0;
  return amountUSD / rate;
};

export const convertToUSD = (localAmount, fromCurrency = 'USD') => {
  if (localAmount == null || isNaN(localAmount)) return 0;
  const rate = RATES_TO_USD[fromCurrency] || 1.0;
  return localAmount * rate;
};

export const api = {
  async getAnalytics(params = {}) {
    const query = new URLSearchParams();
    if (params.department) query.append('department', params.department);
    if (params.country) query.append('country', params.country);
    if (params.currency) query.append('currency', params.currency);

    const res = await fetch(`${API_BASE_URL}/analytics/overview?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
    return res.json();
  },

  async getEmployees(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.per_page) query.append('per_page', params.per_page);
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.country) query.append('country', params.country);
    if (params.currency) query.append('currency', params.currency);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_order) query.append('sort_order', params.sort_order);

    const res = await fetch(`${API_BASE_URL}/employees?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch employees: ${res.statusText}`);
    return res.json();
  },

  async getEmployee(id) {
    const res = await fetch(`${API_BASE_URL}/employees/${id}`);
    if (!res.ok) throw new Error('Failed to fetch employee details');
    return res.json();
  },

  async createEmployee(data) {
    const res = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee: data })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.errors ? result.errors.join(', ') : 'Failed to create employee');
    }
    return result;
  },

  async updateEmployee(id, data) {
    const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee: data })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.errors ? result.errors.join(', ') : 'Failed to update employee');
    }
    return result;
  },

  async deleteEmployee(id) {
    const res = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete employee');
    return true;
  }
};
