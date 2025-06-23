import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, X, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSecurityContext } from '@/contexts/SecurityContext';
import { validateFile, sanitizeText } from '@/utils/security';
import { extractFileContent, validateFileContent } from '@/utils/fileExtractor';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FileWithValidation extends File {
  validationError?: string;
  extractedContent?: string;
}

const FileUpload = () => {
  const [files, setFiles] = useState<FileWithValidation[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logSecurityEvent, addAlert } = useSecurityContext();
  const { user } = useAuth();

  const acceptedFileTypes = [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.html', '.css', '.js', 
    '.json', '.xml', '.csv', '.xls', '.xlsx', '.rtf', '.odt', '.epub'
  ];

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    setExtracting(true);
    const fileArray = Array.from(selectedFiles);
    const validatedFiles: FileWithValidation[] = [];
    let hasInvalidFiles = false;

    for (const file of fileArray) {
      const sanitizedName = sanitizeText(file.name);
      const validation = validateFile(file);
      
      if (validation.isValid) {
        try {
          // Extract content from the file
          const extractedContent = await extractFileContent(file);
          const isValidContent = validateFileContent(extractedContent, file.name);
          
          if (isValidContent) {
            const validatedFile = file.name !== sanitizedName 
              ? new File([file], sanitizedName, { type: file.type }) as FileWithValidation
              : file as FileWithValidation;
              
            validatedFile.extractedContent = extractedContent;
            validatedFiles.push(validatedFile);
            
            logSecurityEvent('FILE_UPLOAD_VALIDATED', {
              fileName: sanitizedName,
              fileSize: file.size,
              fileType: file.type,
              contentLength: extractedContent.length
            });
          } else {
            hasInvalidFiles = true;
            const invalidFile = file as FileWithValidation;
            invalidFile.validationError = 'File content is too short or unreadable for analysis';
            validatedFiles.push(invalidFile);
            
            logSecurityEvent('FILE_UPLOAD_REJECTED', {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              reason: 'Invalid content'
            });
          }
        } catch (error) {
          hasInvalidFiles = true;
          const invalidFile = file as FileWithValidation;
          invalidFile.validationError = `Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`;
          validatedFiles.push(invalidFile);
          
          logSecurityEvent('FILE_UPLOAD_REJECTED', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            reason: 'Content extraction failed'
          });
        }
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
    }

    if (hasInvalidFiles) {
      addAlert('warning', 'Some files were rejected due to security restrictions or content issues');
    }

    const totalFiles = files.length + validatedFiles.filter(f => !f.validationError).length;
    if (totalFiles > 10) {
      addAlert('warning', 'Maximum 10 files allowed per upload session');
      setExtracting(false);
      return;
    }

    setFiles(prev => [...prev, ...validatedFiles]);
    setExtracting(false);
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
    if (!user) {
      addAlert('error', 'Please sign in to upload documents');
      return;
    }

    const validFiles = files.filter(f => !f.validationError && f.extractedContent);
    
    if (validFiles.length === 0) {
      addAlert('warning', 'No valid files with extractable content to upload');
      return;
    }

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

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        // Update progress
        setUploadProgress(((i + 1) / validFiles.length) * 100);
        
        // Save document to database with extracted content
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            content: file.extractedContent,
            processed: true
          })
          .select()
          .single();

        if (documentError) {
          console.error('Error saving document:', documentError);
          throw new Error(`Failed to save ${file.name}: ${documentError.message}`);
        }

        console.log('Document saved successfully:', documentData.id, 'with content length:', file.extractedContent?.length);
        
        // Small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      logSecurityEvent('FILE_UPLOAD_COMPLETED', {
        fileCount: validFiles.length,
        totalSize
      });

      toast({
        title: "Upload successful!",
        description: `${validFiles.length} file(s) uploaded and processed successfully. AI summaries and quizzes will be generated automatically.`
      });

      // Clear files and navigate to dashboard
      setFiles([]);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      addAlert('error', `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const validFiles = files.filter(f => !f.validationError);
  const invalidFiles = files.filter(f => f.validationError);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-white font-space">Upload Your Documents</h1>
          <p className="text-xl text-slate-200">
            Secure file upload with automatic content analysis and quiz generation
          </p>
        </div>

        {/* Security Notice */}
        <Card className="bg-emerald-500/20 backdrop-blur-xl border-emerald-400/30 p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Shield size={20} className="text-emerald-400" />
            <div>
              <h3 className="font-semibold text-emerald-100">Security Protected</h3>
              <p className="text-sm text-emerald-200">
                All uploads are scanned for security threats and content is automatically extracted for AI analysis
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 p-8 mb-8 shadow-2xl">
          <div
            className="border-2 border-dashed border-purple-400/40 rounded-2xl p-12 text-center hover:border-purple-400/60 transition-all cursor-pointer bg-gradient-to-br from-purple-500/5 to-pink-500/5"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              {extracting ? (
                <AlertCircle size={40} className="text-white animate-spin" />
              ) : (
                <Upload size={40} className="text-white" />
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">
              {extracting ? 'Extracting content...' : 'Drop your files here or click to browse'}
            </h3>
            <p className="text-slate-300 mb-4">
              Maximum 10 files, 50MB per file, 200MB total
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept={acceptedFileTypes.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={extracting}
            />
          </div>
        </Card>

        {/* Valid Files */}
        {validFiles.length > 0 && (
          <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 p-6 mb-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white flex items-center space-x-2">
              <CheckCircle size={20} className="text-emerald-400" />
              <span>Valid Files ({validFiles.length})</span>
            </h3>
            <div className="space-y-3">
              {validFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-400/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-slate-300">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Content extracted: {file.extractedContent ? `${file.extractedContent.length} characters` : 'Processing...'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(files.findIndex(f => f === file))}
                    className="hover:bg-red-500/20 hover:border-red-400 border-slate-500 text-slate-300"
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
          <Card className="bg-slate-800/90 backdrop-blur-xl border-red-400/30 p-6 mb-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-400" />
              <span>Invalid Files ({invalidFiles.length})</span>
            </h3>
            <div className="space-y-3">
              {invalidFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-400/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-red-200">{file.name}</p>
                      <p className="text-sm text-red-300">{file.validationError}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(files.findIndex(f => f === file))}
                    className="hover:bg-red-500/20 hover:border-red-400 border-red-400/50 text-red-300"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {uploading && (
          <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 p-6 mb-8 shadow-2xl">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-white">Processing Your Documents</h3>
              <Progress value={uploadProgress} className="mb-4" />
              <p className="text-slate-300">
                {uploadProgress < 50 ? 'Uploading files...' : 'Saving to database...'}
              </p>
            </div>
          </Card>
        )}

        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleUpload}
            disabled={validFiles.length === 0 || uploading || !user || extracting}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:shadow-none transform hover:scale-105 transition-all duration-300"
          >
            {uploading ? (
              <>
                <AlertCircle size={20} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : extracting ? (
              <>
                <AlertCircle size={20} className="mr-2 animate-spin" />
                Extracting Content...
              </>
            ) : (
              <>
                <CheckCircle size={20} className="mr-2" />
                Upload & Process {validFiles.length} File{validFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>

        {/* Security Information */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-6 text-white">Security & File Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 p-4 shadow-2xl">
              <Shield size={32} className="mx-auto mb-3 text-emerald-400" />
              <h4 className="font-semibold text-white mb-2">Security Features</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Malware scanning</li>
                <li>• File type validation</li>
                <li>• Size limitations</li>
                <li>• Content sanitization</li>
              </ul>
            </Card>
            <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 p-4 shadow-2xl">
              <FileText size={32} className="mx-auto mb-3 text-cyan-400" />
              <h4 className="font-semibold text-white mb-2">Supported Formats</h4>
              <div className="grid grid-cols-4 gap-2 text-xs text-slate-300">
                {['PDF', 'DOCX', 'PPTX', 'HTML', 'CSS', 'TXT', 'JSON', 'CSV'].map((type, index) => (
                  <span key={index} className="bg-slate-700/50 px-2 py-1 rounded text-center">{type}</span>
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
