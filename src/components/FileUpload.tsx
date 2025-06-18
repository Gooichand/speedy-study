
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const acceptedFileTypes = [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.html', '.css', '.js', 
    '.json', '.xml', '.csv', '.xls', '.xlsx', '.rtf', '.odt', '.epub'
  ];

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return acceptedFileTypes.includes(extension) || file.type.startsWith('text/');
    });

    if (validFiles.length !== fileArray.length) {
      toast({
        title: "Some files were skipped",
        description: "Only supported file types were added.",
        variant: "destructive"
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate processing
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "Upload successful!",
        description: `${files.length} file(s) uploaded and processed successfully.`
      });
      navigate('/dashboard');
    }, 3500);
  };

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient font-space">Upload Your Documents</h1>
          <p className="text-xl text-gray-600">
            Support for PDF, Word, PowerPoint, HTML, CSS, and many more file formats
          </p>
        </div>

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
              Supports PDF, Word, PowerPoint, HTML, CSS, and more
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

        {files.length > 0 && (
          <Card className="glass-card p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Selected Files</h3>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
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
                    onClick={() => removeFile(index)}
                    className="hover:bg-red-50 hover:border-red-300"
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
                {uploadProgress < 50 ? 'Uploading files...' : 
                 uploadProgress < 80 ? 'Analyzing content...' : 
                 'Generating summaries and quizzes...'}
              </p>
            </div>
          </Card>
        )}

        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
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
                Start Processing
              </>
            )}
          </Button>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Supported File Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { ext: 'PDF', color: 'bg-red-500' },
              { ext: 'DOCX', color: 'bg-blue-500' },
              { ext: 'PPTX', color: 'bg-orange-500' },
              { ext: 'HTML', color: 'bg-green-500' },
              { ext: 'CSS', color: 'bg-purple-500' },
              { ext: 'TXT', color: 'bg-gray-500' },
              { ext: 'JSON', color: 'bg-yellow-500' },
              { ext: 'More...', color: 'bg-pink-500' }
            ].map((type, index) => (
              <div key={index} className="glass-card p-4 rounded-lg text-center">
                <div className={`w-8 h-8 ${type.color} rounded-lg mx-auto mb-2`}></div>
                <span className="text-sm font-medium text-gray-700">{type.ext}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
