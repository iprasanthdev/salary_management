import React from 'react';
import { BarChart3, Users, Building2, ShieldCheck, DollarSign } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, totalEmployees }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Org Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-100">
              <DollarSign className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">ACME Corp</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Salary Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500">Global Compensation Management System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Compensation Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'directory'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Employee Directory</span>
              {totalEmployees > 0 && (
                <span className="ml-1 text-xs bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-semibold">
                  {totalEmployees.toLocaleString()}
                </span>
              )}
            </button>
          </nav>

          {/* Persona Card */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">Helena Brooks</span>
              <span className="text-xs text-slate-500">Global HR Manager</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-slate-100">
              HB
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
