
import React, { useState, useEffect } from 'react';
import { GeneratedFile } from '../types';

interface CodeViewerProps {
  files: GeneratedFile[];
  placeholder?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ files, placeholder = "Generated code will appear here..." }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (files.length > 0) {
      setActiveFileIndex(0);
    }
  }, [files]);

  const activeFile = files.length > 0 ? files[activeFileIndex] : null;

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileDisplay = (filepath: string) => {
    const filename = filepath.split('/').pop()?.split('\\').pop() || filepath;
    const parts = filename.split('.');
    if (parts.length > 1) {
      const name = parts[0];
      const ext = '.' + parts.slice(1).join('.');
      return (
        <span className="truncate">
          <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{name}</span>
          <span className="text-slate-500 group-hover:text-slate-400 transition-colors">{ext}</span>
        </span>
      );
    }
    return <span className="font-semibold text-slate-200">{filename}</span>;
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col h-full text-slate-300 transition-all duration-500">
      {/* macOS Window Header */}
      <div className="h-10 bg-slate-800/80 dark:bg-slate-900/90 border-b border-slate-700/50 flex items-center px-4 relative flex-shrink-0 backdrop-blur-md">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-sans">nuScript Terminal</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar - File List */}
        <div className="w-full md:w-64 bg-slate-900/30 border-r border-slate-700/30 flex flex-col flex-shrink-0 overflow-hidden">
           <div className="p-4 border-b border-slate-700/30 bg-slate-900/20">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                   Explorer
               </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
               {files.length > 0 ? (
                   files.map((file, idx) => (
                      <button
                          key={idx}
                          onClick={() => setActiveFileIndex(idx)}
                          className={`w-full text-left px-3 py-2 text-xs font-mono rounded transition-all flex items-center gap-2.5 truncate group
                          ${activeFileIndex === idx 
                              ? 'bg-primary/20 text-indigo-300' 
                              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                      >
                          {file.filename.endsWith('.feature') ? (
                             <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          ) : (
                             <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                          )}
                          {getFileDisplay(file.filename)}
                      </button>
                   ))
               ) : (
                  <div className="p-4 text-center opacity-40">
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Empty</p>
                  </div>
               )}
           </div>
        </div>

        {/* Code Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e14] relative">
          {activeFile ? (
              <>
                  {/* File Header Tab */}
                  <div className="h-9 border-b border-slate-800/50 flex items-center justify-between px-4 bg-slate-900/40">
                      <div className="flex items-center gap-2">
                           <span className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-500/50"></span>
                              {activeFile.filename}
                           </span>
                      </div>
                      <button
                          onClick={handleCopy}
                          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all
                          ${copied ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white'}`}
                      >
                          {copied ? (
                          <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Copied
                          </>
                          ) : (
                              <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                              Copy
                              </>
                          )}
                      </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-auto p-6 custom-scrollbar font-mono text-sm leading-relaxed scroll-smooth">
                      <pre className="whitespace-pre-wrap break-words">
                          <code className="text-slate-300 block">{activeFile.content}</code>
                      </pre>
                  </div>
              </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-slate-900/10 backdrop-blur-[2px]">
              <div className="relative group">
                  <div className="absolute -inset-4 bg-primary/10 opacity-0 group-hover:opacity-100 blur-xl rounded-full transition-opacity duration-700"></div>
                  <svg className="relative w-16 h-16 mb-4 text-slate-700 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
              </div>
              <p className="text-center max-w-sm text-xs font-semibold text-slate-500 uppercase tracking-widest">{placeholder}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
