
import React from 'react';
import { TestCaseData } from '../types';

interface TestCasePreviewProps {
  testCase: TestCaseData;
  onClose?: () => void;
  isSideBySide?: boolean;
}

const TestCasePreview: React.FC<TestCasePreviewProps> = ({ testCase, onClose, isSideBySide = false }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 flex flex-col border border-slate-200 dark:border-slate-800 transition-all duration-300 ${isSideBySide ? 'rounded-xl h-full shadow-sm' : 'w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl animate-fade-in-up'}`}>
      <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 font-sans">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Test Case Preview
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
      
      <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950 font-sans space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
           <div className="flex-1">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Title</h4>
              <p className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">{testCase.title || <span className="text-slate-400 italic">Untitled</span>}</p>
           </div>
           {testCase.id && (
               <div className="sm:text-right">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">ID</h4>
                  <span className="inline-block bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono text-xs font-medium border border-slate-200 dark:border-slate-700">{testCase.id}</span>
               </div>
           )}
        </div>

        {testCase.description && (
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Description</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{testCase.description}</p>
            </div>
        )}

        {testCase.preconditions && (
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Preconditions</h4>
            <div className="bg-slate-50 dark:bg-slate-900/40 border-l-2 border-primary p-3 rounded-r">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{testCase.preconditions}</p>
            </div>
          </div>
        )}

        {testCase.steps.length > 0 && (
          <div>
             <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Test Steps</h4>
             <div className="space-y-3">
                 {testCase.steps.map((step, idx) => (
                     <div key={step.id} className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                         <div className="flex gap-2.5">
                             <span className="font-bold text-primary text-sm">{idx + 1}.</span>
                             <div className="flex-1">
                                 <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">{step.action}</p>
                                 {step.expected && (
                                     <div className="mt-1.5 pl-3 border-l-2 border-primary/20">
                                         <p className="text-[9px] font-bold uppercase tracking-widest text-primary/70 dark:text-primary/70 mb-0.5">Expected</p>
                                         <p className="text-xs text-slate-500 dark:text-slate-500 italic">{step.expected}</p>
                                     </div>
                                 )}
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
          </div>
        )}

        {testCase.testData && (
           <div>
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Test Data</h4>
              <div className="bg-slate-900 p-3 rounded-lg overflow-x-auto border border-slate-800 shadow-inner">
                  <pre className="text-slate-400 text-[11px] font-mono leading-tight">{testCase.testData}</pre>
              </div>
           </div>
        )}
      </div>

      {!isSideBySide && onClose && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
                Close
            </button>
        </div>
      )}
    </div>
  );
};

export default TestCasePreview;
