
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, X, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSecurityContext } from '@/contexts/SecurityContext';
import { validateFile, sanitizeText } from '@/utils/security';

interface FileWithValidation extends File {
  validationError?: string;
}

const FileUpload = () => {
  const [files, setFiles] = useState<FileWithValidation[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logSecurityEvent, addAlert } = useSecurityContext();

  const acceptedFileTypes = [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.html', '.css', '.js', 
    '.json', '.xml', '.csv', '.xls', '.xlsx', '.rtf', '.odt', '.epub'
  ];

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const validatedFiles: FileWithValidation[] = [];
    let hasInvalidFiles = false;

    fileArray.forEach(file => {
      // Sanitize filename
      const sanitizedName = sanitizeText(file.name);
      
      // Validate file
      const validation = validateFile(file);
      
      if (validation.isValid) {
        // Create new file with sanitized name if needed
        const validatedFile = file.name !== sanitizedName 
          ? new File([file], sanitizedName, { type: file.type }) as FileWithValidation
          : file as FileWithValidation;
          
        validatedFiles.push(validatedFile);
        
        logSecurityEvent('FILE_UPLOAD_VALIDATED', {
          fileName: sanitizedName,
          fileSize: file.size,
          fileType: file.type
        });
      } else {
        hasInvalidFiles = true;
        const invalidFile = file as FileWithValidation;
        invalidFile.validationError = validation.error;
        validatedFiles.push(invalidFile);
        
        logSecurityEvent('FILE_UPLOAD_REJECTED', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          reason: validation.error
        });
      }
    });

    if (hasInvalidFiles) {
      addAlert('warning', 'Some files were rejected due to security restrictions');
    }

    // Check total file count
    const totalFiles = files.length + validatedFiles.filter(f => !f.validationError).length;
    if (totalFiles > 10) {
      addAlert('warning', 'Maximum 10 files allowed per upload session');
      return;
    }

    setFiles(prev => [...prev, ...validatedFiles]);
  }, [files.length, addAlert, logSecurityEvent]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = (index: number) => {
    const removedFile = files[index];
    logSecurityEvent('FILE_REMOVED', {
      fileName: removedFile.name,
      hadError: !!removedFile.validationError
    });
    
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => !f.validationError);
    
    if (validFiles.length === 0) {
      addAlert('warning', 'No valid files to upload');
      return;
    }

    // Final security check before upload
    const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 200 * 1024 * 1024; // 200MB total
    
    if (totalSize > maxTotalSize) {
      addAlert('error', 'Total file size exceeds 200MB limit');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    logSecurityEvent('FILE_UPLOAD_STARTED', {
      fileCount: validFiles.length,
      totalSize
    });

    // Simulate upload progress with security scanning
    const stages = [
      { progress: 20, message: 'Uploading files...' },
      { progress: 40, message: 'Scanning for malware...' },
      { progress: 60, message: 'Validating content...' },
      { progress: 80, message: 'Analyzing content...' },
      { progress: 100, message: 'Processing complete...' }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setUploadProgress(stage.progress);
    }

    logSecurityEvent('FILE_UPLOAD_COMPLETED', {
      fileCount: validFiles.length,
      totalSize
    });

    setUploading(false);
    toast({
      title: "Upload successful!",
      description: `${validFiles.length} file(s) uploaded and processed successfully.`
    });
    navigate('/dashboard');
  };

  const validFiles = files.filter(f => !f.validationError);
  const invalidFiles = files.filter(f => f.validationError);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient font-space">Upload Your Documents</h1>
          <p className="text-xl text-gray-600">
            Secure file upload with malware scanning and content validation
          </p>
        </div>

        {/* Security Notice */}
        <Card className="glass-card p-4 mb-6 border-l-4 border-l-green-500">
          <div className="flex items-center space-x-3">
            <Shield size={20} className="text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Security Protected</h3>
              <p className="text-sm text-gray-600">
                All uploads are scanned for security threats and validated for content safety
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-8 mb-8">
          <div
            className="border-2 border-dashed border-dgc-purple/30 rounded-2xl p-12 text-center hover:border-dgc-purple/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="w-20 h-20 bg-purple-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-purple animate-scale-bounce">
              <Upload size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">
              Drop your files here or click to browse
            </h3>
            <p className="text-gray-600 mb-4">
              Maximum 10 files, 50MB per file, 200MB total
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept={acceptedFileTypes.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </Card>

        {/* Valid Files */}
        {validFiles.length > 0 && (
          <Card className="glass-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center space-x-2">
              <CheckCircle size={20} className="text-green-600" />
              <span>Valid Files ({validFiles.length})</span>
            </h3>
            <div className="space-y-3">
              {validFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-gradient rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(files.findIndex(f => f === file))}
                    className="hover:bg-red-50 hover:border-red-300"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Invalid Files */}
        {invalidFiles.length > 0 && (
          <Card className="glass-card p-6 mb-6 border-red-200">
            <h3 className="text-xl font-bold mb-4 text-red-800 flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-600" />
              <span>Invalid Files ({invalidFiles.length})</span>
            </h3>
            <div className="space-y-3">
              {invalidFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-red-800">{file.name}</p>
                      <p className="text-sm text-red-600">{file.validationError}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(files.findIndex(f => f === file))}
                    className="hover:bg-red-100 hover:border-red-300"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {uploading && (
          <Card className="glass-card p-6 mb-8">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Processing Your Documents</h3>
              <Progress value={uploadProgress} className="mb-4" />
              <p className="text-gray-600">
                {uploadProgress < 25 ? 'Uploading files...' : 
                 uploadProgress < 50 ? 'Scanning for malware...' : 
                 uploadProgress < 75 ? 'Validating content...' : 
                 uploadProgress < 95 ? 'Analyzing content...' : 
                 'Processing complete...'}
              </p>
            </div>
          </Card>
        )}

        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleUpload}
            disabled={validFiles.length === 0 || uploading}
            className="btn-3d bg-purple-gradient hover:opacity-90 text-white px-8 py-3 text-lg rounded-xl shadow-glow-purple disabled:opacity-50"
          >
            {uploading ? (
              <>
                <AlertCircle size={20} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={20} className="mr-2" />
                Upload {validFiles.length} Valid File{validFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>

        {/* Security Information */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Security & File Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="glass-card p-4">
              <Shield size={32} className="mx-auto mb-3 text-green-600" />
              <h4 className="font-semibold text-gray-800 mb-2">Security Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Malware scanning</li>
                <li>• File type validation</li>
                <li>• Size limitations</li>
                <li>• Content sanitization</li>
              </ul>
            </Card>
            <Card className="glass-card p-4">
              <FileText size={32} className="mx-auto mb-3 text-blue-600" />
              <h4 className="font-semibold text-gray-800 mb-2">Supported Formats</h4>
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                {['PDF', 'DOCX', 'PPTX', 'HTML', 'CSS', 'TXT', 'JSON', 'CSV'].map((type, index) => (
                  <span key={index} className="bg-gray-100 px-2 py-1 rounded">{type}</span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
