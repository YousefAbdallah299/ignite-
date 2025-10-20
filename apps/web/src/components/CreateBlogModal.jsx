import { useState, useEffect, useRef } from 'react';
import { X, Image, Video, FileText, Upload, Trash2 } from 'lucide-react';

export default function CreateBlogModal({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    content: '',
    mediaType: 'TEXT'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Selected file:', selectedFile);
    
    if (!formData.content.trim()) {
      console.log('No content provided');
      return;
    }
    
    // Call onSubmit with the new signature: content, mediaType, file
    onSubmit(formData.content.trim(), formData.mediaType, selectedFile);
  };

  const handleClose = () => {
    setFormData({
      content: '',
      mediaType: 'TEXT'
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      content: '',
      mediaType: 'TEXT'
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        alert('File size too large. Please select a file smaller than 100MB.');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Auto-detect media type based on file type
      if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, mediaType: 'VIDEO' }));
      } else if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, mediaType: 'IMAGE' }));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFormData(prev => ({ ...prev, mediaType: 'TEXT' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        if (file.size > maxSize) {
          alert('File size too large. Please select a file smaller than 100MB.');
          return;
        }
        
        setSelectedFile(file);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
        // Auto-detect media type based on file type
        if (file.type.startsWith('video/')) {
          setFormData(prev => ({ ...prev, mediaType: 'VIDEO' }));
        } else if (file.type.startsWith('image/')) {
          setFormData(prev => ({ ...prev, mediaType: 'IMAGE' }));
        }
      } else {
        alert('Please drop an image or video file.');
      }
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts, experiences, or insights..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              required
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.content.length}/500 characters
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add Media (Optional)
            </label>
            
            {/* File Input */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={loading}
              />
              
              {!selectedFile ? (
                <div>
                  <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragOver ? 'text-red-500' : 'text-gray-400'}`} />
                  <p className={`mb-2 ${isDragOver ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {isDragOver ? 'Drop your file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, MP4, MOV (Max 100MB)</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={loading}
                  >
                    Choose File
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        {formData.mediaType === 'IMAGE' ? (
                          <Image className="w-6 h-6 text-red-600" />
                        ) : (
                          <Video className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Preview */}
                  {previewUrl && (
                    <div className="mt-3">
                      {formData.mediaType === 'IMAGE' ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                      ) : (
                        <video
                          src={previewUrl}
                          controls
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>


          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.content.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
