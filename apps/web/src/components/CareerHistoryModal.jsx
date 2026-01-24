'use client';

import { useState, useEffect } from 'react';
import { X, Briefcase, Calendar, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function CareerHistoryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  careerHistory = null, // null for new, object for edit
  loading = false 
}) {
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isCurrent: false
  });

  useEffect(() => {
    if (careerHistory) {
      setFormData({
        companyName: careerHistory.companyName || '',
        position: careerHistory.position || '',
        description: careerHistory.description || '',
        startDate: careerHistory.startDate ? careerHistory.startDate.split('T')[0] : '',
        endDate: careerHistory.endDate ? careerHistory.endDate.split('T')[0] : '',
        location: careerHistory.location || '',
        isCurrent: !careerHistory.endDate
      });
    } else {
      setFormData({
        companyName: '',
        position: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        isCurrent: false
      });
    }
  }, [careerHistory, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.position.trim()) {
      toast.error('Position is required');
      return;
    }
    if (!formData.startDate) {
      toast.error('Start date is required');
      return;
    }
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.startDate)) {
      toast.error('Invalid start date format');
      return;
    }
    
    if (!formData.isCurrent && !formData.endDate) {
      toast.error('End date is required if not current position');
      return;
    }
    
    if (formData.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.endDate)) {
      toast.error('Invalid end date format');
      return;
    }
    
    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    // Ensure endDate is either a valid date string or null (not empty string)
    let endDateValue = null;
    if (!formData.isCurrent && formData.endDate) {
      endDateValue = formData.endDate;
    }

    // Build data object, only including fields that have values
    const data = {
      companyName: formData.companyName.trim(),
      position: formData.position.trim(),
      startDate: formData.startDate
    };

    // Only add optional fields if they have values
    if (formData.description.trim()) {
      data.description = formData.description.trim();
    }
    if (endDateValue) {
      data.endDate = endDateValue;
    }
    if (formData.location.trim()) {
      data.location = formData.location.trim();
    }

    console.log('Sending career history data:', JSON.stringify(data, null, 2));
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-red-600" />
            {careerHistory ? 'Edit Career History' : 'Add Career History'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g., Google, Microsoft"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || undefined}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={formData.isCurrent}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isCurrent}
                    onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span>Current Position</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Cairo, Egypt"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your role, achievements, and responsibilities..."
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4" />
                  {careerHistory ? 'Update' : 'Add'} Career History
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

