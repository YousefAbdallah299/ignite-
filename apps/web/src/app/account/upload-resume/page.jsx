'use client';

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCandidatesAPI } from "@/hooks/useCandidatesAPI";
import PageFadeIn from '@/components/PageFadeIn';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

export default function UploadResumePage() {
  const { updateMyProfile, loading } = useCandidatesAPI();
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setResumeFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setResumePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setResumeFile(null);
    setResumePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast.error('Please select a resume file to upload');
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 or upload to a service
      // For now, we'll convert to base64 data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          
          // Update profile with resume URL (using base64 data URL)
          await updateMyProfile({
            title: 'New Candidate',
            summary: '',
            resumeUrl: base64Data
          });

          toast.success('Resume uploaded successfully!');
          setTimeout(() => {
            navigate('/account/signin');
          }, 1500);
        } catch (error) {
          console.error('Error uploading resume:', error);
          toast.error(error.message || 'Failed to upload resume. Please try again.');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(resumeFile);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file. Please try again.');
      setUploading(false);
    }
  };

  return (
    <PageFadeIn className="bg-gray-50 min-h-screen">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h1>
            <p className="text-gray-600">
              Complete your profile by uploading your resume. This helps recruiters find you.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-400 transition-colors">
              {!resumeFile ? (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mb-4">PDF or Word document (MAX. 5MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{resumeFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="ml-auto p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-block text-sm text-red-600 hover:text-red-700 cursor-pointer underline"
                  >
                    Change file
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!resumeFile || uploading || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {uploading || loading ? 'Uploading...' : 'Upload Resume'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/account/signin')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Skip for now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              You can update your resume later in your profile settings
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </PageFadeIn>
  );
}

