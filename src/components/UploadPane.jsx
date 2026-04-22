import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, Loader2, X, FileText } from 'lucide-react';

export default function UploadPane({ onUploadProgress, uploadState, uploadedFiles, onRemoveFile }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovered(false);
    const files = e.dataTransfer.files;
    if (files.length) handleFiles(files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => setIsHovered(false);

  const handleFiles = (file) => {
    const isValid = file && (
      file.type === 'application/pdf' || 
      file.type === 'text/plain' || 
      file.name.toLowerCase().endsWith('.pdf') || 
      file.name.toLowerCase().endsWith('.txt')
    );
    if (isValid) {
      onUploadProgress(file);
    } else {
      alert('Invalid file format! Please select a .pdf or .txt file.');
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-dark-pane p-4 md:p-8 border-b md:border-b-0 md:border-r border-[#1e293b] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-neon-violet opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col justify-center items-center relative z-10">
        <div className="w-full max-w-sm flex flex-col gap-3 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar">
          {uploadedFiles && uploadedFiles.map((f, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full rounded-2xl border border-neon-cyan/50 bg-slate-900/80 backdrop-blur-md p-4 relative shadow-[0_0_15px_rgba(0,240,255,0.1)] flex items-center gap-4"
            >
              <FileText className="w-8 h-8 text-neon-cyan shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-200 truncate">
                  {f.name}
                </h3>
                <p className="text-[10px] text-neon-cyan uppercase tracking-wider">Context Active</p>
              </div>
              <button 
                onClick={() => onRemoveFile(idx)}
                className="p-2 bg-rose-500/10 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {uploadState === 'idle' && (
          <motion.div
            className={`w-full max-w-sm rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 md:p-8 transition-colors ${
              isHovered ? 'border-neon-cyan bg-neon-cyan/5' : 'border-slate-700 bg-slate-900/50'
            } backdrop-blur-md`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={{ boxShadow: isHovered ? '0 0 30px rgba(0, 240, 255, 0.2)' : '0 0 0px rgba(0,0,0,0)' }}
          >
            <UploadCloud className={`w-10 h-10 mb-4 ${isHovered ? 'text-neon-cyan' : 'text-slate-500'}`} />
            <h3 className="text-lg font-medium text-slate-200 mb-1 font-sans tracking-wide text-center">
              {uploadedFiles && uploadedFiles.length > 0 ? "Inject Additional Data" : "Initialize Coordinates"}
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              Drag & drop neural context (PDF or TXT)
            </p>
            <input 
              type="file" 
              accept=".pdf,.txt"
              className="hidden"
              id="fileBrowser"
              onChange={(e) => {
                if (e.target.files?.length) {
                   handleFiles(e.target.files[0]);
                   e.target.value = null;
                }
              }}
            />
            <button className="px-5 py-2 text-xs rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700/50" onClick={() => document.getElementById('fileBrowser').click()}>
              Browse Files
            </button>
          </motion.div>
        )}

        {/* Progress Display */}
        {uploadState !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 w-full max-w-sm bg-slate-900/80 rounded-2xl p-6 border border-slate-800"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-300">Link Established</span>
              {uploadState === 'done' ? <CheckCircle className="w-5 h-5 text-neon-cyan"/> : <Loader2 className="w-5 h-5 animate-spin text-neon-violet"/>}
            </div>
            
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-neon-violet to-neon-cyan"
                initial={{ width: 0 }}
                animate={{
                  width: uploadState === 'embedding' ? '40%' : uploadState === 'vectorizing' ? '80%' : '100%'
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 uppercase tracking-widest">
              {uploadState === 'embedding' ? 'Extracting text...' : 
               uploadState === 'vectorizing' ? 'Generating embeddings...' : 
               'Context synchronized'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
