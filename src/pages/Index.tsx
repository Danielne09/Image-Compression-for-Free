import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, Download, FileType2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await handleFile(droppedFile);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    console.log('Processing file:', selectedFile.name);
    
    if (!selectedFile.type.includes('image/') && selectedFile.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setCompressedFile(null);
    
    try {
      setIsCompressing(true);
      
      if (selectedFile.type.includes('image/')) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        
        const compressedBlob = await imageCompression(selectedFile, options);
        setCompressedFile(compressedBlob);
        toast.success('Image compressed successfully!');
      } else {
        // For PDF files, we'll just show a message since browser-side PDF compression
        // is limited. In a real app, you'd want to use a backend service for PDFs
        toast.error('PDF compression requires server-side processing');
      }
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Error compressing file');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${file?.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          File Compressor
        </h1>
        <p className="text-center mb-8 text-gray-600">
          Compress your images and PDFs easily
        </p>

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all
            ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white'}
            ${isCompressing ? 'opacity-50' : 'hover:border-indigo-500'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
            accept="image/*,.pdf"
            disabled={isCompressing}
          />
          
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2 text-gray-700">
              Drag and drop your file here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports images and PDFs up to 10MB
            </p>
          </div>
        </div>

        {file && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileType2 className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
              </div>
              
              {isCompressing ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              ) : compressedFile && (
                <Button
                  onClick={handleDownload}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;