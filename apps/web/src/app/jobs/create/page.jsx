'use client';

import { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useJobsAPI } from '@/hooks/useJobsAPI';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import RevealOnScroll from '@/components/RevealOnScroll';
import PageFadeIn from '@/components/PageFadeIn';

const jobCategories = [
  "Technology",
  "Marketing",
  "Design",
  "Sales",
  "Data Science",
  "Engineering",
  "Finance",
  "HR",
  "Operations",
  "Customer Service",
];

const employmentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
  "INTERNSHIP",
];

const currencies = [
  "USD",
  "EUR",
  "GBP",
  "EGP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "AED",
  "SAR",
  "KWD",
  "QAR",
  "BHD",
  "OMR",
  "JOD",
  "LBP",
  "MAD",
  "TND",
  "DZD",
  "LYD",
  "SDG",
  "ETB",
  "KES",
  "NGN",
  "ZAR",
  "GHS",
  "UGX",
  "TZS",
  "RWF",
  "BWP",
  "SZL",
  "LSL",
  "NAD",
  "MZN",
  "AOA",
  "ZMW",
  "MWK",
  "BIF",
  "DJF",
  "KMF",
  "MGA",
  "MUR",
  "SCR",
  "SOS",
  "TND",
  "MAD",
  "DZD",
  "LYD",
  "SDG",
  "ETB",
  "KES",
  "NGN",
  "ZAR",
  "GHS",
  "UGX",
  "TZS",
  "RWF",
  "BWP",
  "SZL",
  "LSL",
  "NAD",
  "MZN",
  "AOA",
  "ZMW",
  "MWK",
  "BIF",
  "DJF",
  "KMF",
  "MGA",
  "MUR",
  "SCR",
  "SOS"
];

export default function CreateJobPage() {
  const { createJob, loading } = useJobsAPI();
  const { user, isRecruiter, isAdmin } = useAuthAPI();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    employmentType: 'FULL_TIME',
    salary: '',
    currency: 'USD',
    categories: []
  });

  // Redirect if not authorized
  if (user && !isRecruiter && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">Only recruiters and administrators can post jobs.</p>
            <a href="/jobs" className="text-red-600 hover:text-red-700 font-medium">
              Browse Jobs
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!jobData.title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!jobData.description.trim()) {
      setError('Job description is required');
      return;
    }
    if (!jobData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!jobData.employmentType) {
      setError('Employment type is required');
      return;
    }
    if (!jobData.salary.trim()) {
      setError('Salary is required');
      return;
    }
    
    // Validate salary is a valid number
    const salaryNumber = parseInt(jobData.salary);
    if (isNaN(salaryNumber) || salaryNumber <= 0) {
      setError('Please enter a valid salary amount');
      return;
    }
    // Categories are optional according to JobRequestDTO

    setSaving(true);
    try {
      // Format salary with selected currency
      const formattedJobData = {
        ...jobData,
        salary: `${jobData.currency} ${parseInt(jobData.salary).toLocaleString()}/month`
      };
      
      await createJob(formattedJobData);
      toast.success('Job posted successfully!');
      
      // Redirect back to jobs page
      window.location.href = '/jobs';
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.message || 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setJobData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const removeCategory = (category) => {
    setJobData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  return (
    <PageFadeIn className="bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8 initial-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
            <p className="text-gray-600">Fill in the details below to create a new job posting</p>
          </div>

          <RevealOnScroll>
            <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                value={jobData.title}
                onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior Software Engineer"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                value={jobData.description}
                onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={8}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={jobData.location}
                  onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., New York, NY or Remote"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Employment Type */}
              <div>
                <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type *
                </label>
                <select
                  id="employmentType"
                  value={jobData.employmentType}
                  onChange={(e) => setJobData(prev => ({ ...prev, employmentType: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  {employmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                Salary (Monthly Amount) *
              </label>
              <input
                type="number"
                id="salary"
                value={jobData.salary}
                onChange={(e) => setJobData(prev => ({ ...prev, salary: e.target.value }))}
                placeholder="5000"
                min="0"
                step="100"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the monthly salary amount (e.g., 5000 for 5,000/month)
              </p>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                id="currency"
                value={jobData.currency}
                onChange={(e) => setJobData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories (Optional)
              </label>
              
              {/* Selected Categories */}
              {jobData.categories.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {jobData.categories.map((category) => (
                      <span
                        key={category}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Category */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="customCategory"
                    placeholder="Type a custom category..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.target.value.trim();
                        if (value && !jobData.categories.includes(value)) {
                          setJobData(prev => ({
                            ...prev,
                            categories: [...prev.categories, value]
                          }));
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      const value = input.value.trim();
                      if (value && !jobData.categories.includes(value)) {
                        setJobData(prev => ({
                          ...prev,
                          categories: [...prev.categories, value]
                        }));
                        input.value = '';
                      }
                    }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Type a category and press Enter or click Add
                </p>
              </div>

              {/* Available Categories */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {jobCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    disabled={jobData.categories.includes(category)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      jobData.categories.includes(category)
                        ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Select from popular categories or add your own custom categories
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving || loading}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5" />
                {saving || loading ? 'Posting Job...' : 'Post Job'}
              </button>
              <a
                href="/jobs"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </a>
            </div>
            </form>
          </RevealOnScroll>
        </div>
      </div>

      <RevealOnScroll>
        <Footer />
      </RevealOnScroll>
    </PageFadeIn>
  );
}
