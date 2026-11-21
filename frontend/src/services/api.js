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

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null || isNaN(amount)) return '-';
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
  return `${symbol}${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

export const formatUSD = (amount) => formatCurrency(amount, 'USD');

export const api = {
  async getAnalytics(params = {}) {
    const query = new URLSearchParams();
    if (params.department) query.append('department', params.department);
    if (params.country) query.append('country', params.country);

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
