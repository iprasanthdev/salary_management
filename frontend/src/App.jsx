import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import EmployeeDirectory from './components/EmployeeDirectory';
import EmployeeModal from './components/EmployeeModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [filterOptions, setFilterOptions] = useState({
    departments: [
      'Engineering',
      'Product',
      'Sales',
      'Marketing',
      'Human Resources',
      'Finance',
      'Operations'
    ],
    countries: [
      'United States',
      'United Kingdom',
      'Germany',
      'India',
      'Singapore'
    ]
  });

  const [totalEmployees, setTotalEmployees] = useState(10000);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [modalState, setModalState] = useState({ isOpen: false, employee: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, employee: null });

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Initial load of filter options & total count
  useEffect(() => {
    const initApp = async () => {
      try {
        const empRes = await api.getEmployees({ per_page: 1 });
        if (empRes.pagination) {
          setTotalEmployees(empRes.pagination.total_count);
        }
        if (empRes.filter_options) {
          setFilterOptions(empRes.filter_options);
        }
      } catch (err) {
        console.error('Error initializing application metadata:', err);
      }
    };
    initApp();
  }, [refreshTrigger]);

  const handleOpenAdd = () => {
    setModalState({ isOpen: true, employee: null });
  };

  const handleOpenEdit = (emp) => {
    setModalState({ isOpen: true, employee: emp });
  };

  const handleOpenDelete = (emp) => {
    setDeleteModal({ isOpen: true, employee: emp });
  };

  const handleSaveEmployee = async (formData) => {
    if (modalState.employee) {
      await api.updateEmployee(modalState.employee.id, formData);
      showToast(`Successfully updated compensation for ${formData.first_name} ${formData.last_name}`);
    } else {
      await api.createEmployee(formData);
      showToast(`Successfully added new employee ${formData.first_name} ${formData.last_name}`);
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await api.deleteEmployee(id);
      showToast('Employee record successfully removed', 'success');
      setDeleteModal({ isOpen: false, employee: null });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      showToast(err.message || 'Failed to delete employee', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalEmployees={totalEmployees}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'analytics' ? (
          <AnalyticsDashboard
            filterOptions={filterOptions}
            key={`analytics-${refreshTrigger}`}
          />
        ) : (
          <EmployeeDirectory
            filterOptions={filterOptions}
            onAddEmployee={handleOpenAdd}
            onEditEmployee={handleOpenEdit}
            onDeleteEmployee={handleOpenDelete}
            refreshTrigger={refreshTrigger}
          />
        )}
      </main>

      {/* Employee Add / Edit Modal */}
      <EmployeeModal
        isOpen={modalState.isOpen}
        employee={modalState.employee}
        filterOptions={filterOptions}
        onClose={() => setModalState({ isOpen: false, employee: null })}
        onSave={handleSaveEmployee}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        employee={deleteModal.employee}
        onClose={() => setDeleteModal({ isOpen: false, employee: null })}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto text-center text-xs text-slate-500">
        <p>ACME Organization · Internal Human Resources Compensation & Payroll Intelligence Portal · Production Ready</p>
      </footer>
    </div>
  );
}
