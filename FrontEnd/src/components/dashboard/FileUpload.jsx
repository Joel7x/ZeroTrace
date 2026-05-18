import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const FileUpload = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const renderIcon = (Icon, props = {}) => {
    if (!Icon) return <div className="w-4 h-4 bg-white/10 rounded-full" />;
    return <Icon {...props} />;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus('uploading');

    // Simulate API call to upload and analyze
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock results
      const mockResults = [
        { id: 'UP-001', provider: 'New Clinic A', amount: '₹12,500', icd: 'M54.5', risk: 'high', score: 82, flags: 'High frequency' },
        { id: 'UP-002', provider: 'Dr. Smith', amount: '₹4,200', icd: 'Z00.00', risk: 'low', score: 15, flags: 'None' },
        { id: 'UP-003', provider: 'Unknown Lab', amount: '₹35,000', icd: 'Z13.6', risk: 'high', score: 91, flags: 'Overbill' },
      ];

      setUploadStatus('success');
      onUploadSuccess(mockResults);
      
      setTimeout(() => {
        setUploadStatus('idle');
        setFileName('');
      }, 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".csv"
      />
      
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
          "border border-white/10 hover:border-blue/50",
          uploadStatus === 'idle' && "bg-blue/10 text-blue-400 hover:bg-blue/20",
          uploadStatus === 'uploading' && "bg-white/5 text-white/50 cursor-not-allowed",
          uploadStatus === 'success' && "bg-green/10 text-green border-green/30",
          uploadStatus === 'error' && "bg-red/10 text-red border-red/30"
        )}
      >
        {uploadStatus === 'idle' && (
          <>
            {renderIcon(UploadCloud, { size: 16 })}
            <span>Upload Dataset (CSV)</span>
          </>
        )}
        {uploadStatus === 'uploading' && (
          <>
            {renderIcon(Loader2, { size: 16, className: "animate-spin" })}
            <span>Analyzing {fileName}...</span>
          </>
        )}
        {uploadStatus === 'success' && (
          <>
            {renderIcon(CheckCircle2, { size: 16 })}
            <span>Analysis Complete</span>
          </>
        )}
        {uploadStatus === 'error' && (
          <>
            {renderIcon(AlertCircle, { size: 16 })}
            <span>Upload Failed</span>
          </>
        )}
      </button>
      
      {fileName && uploadStatus !== 'idle' && (
        <div className="flex items-center gap-2 px-2 py-1 text-[11px] text-muted">
          {renderIcon(FileText, { size: 12 })}
          <span className="truncate max-w-[150px]">{fileName}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
